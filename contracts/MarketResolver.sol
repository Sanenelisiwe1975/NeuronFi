// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPredictionMarket {
    enum Outcome { UNRESOLVED, YES, NO }
    function resolve(Outcome _outcome) external;
    function finalize(bool agentCorrect) external;
    function outcome() external view returns (Outcome);
    function closingTime() external view returns (uint256);
    function resolutionTime() external view returns (uint256);
    function question() external view returns (string memory);
}

interface IChainlinkFeed {
    function latestRoundData() external view returns (
        uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound
    );
    function decimals() external view returns (uint8);
}

interface IKiteAttestationRegistry {
    function writeAttestation(bytes32 contentHash, string calldata rationaleUri)
        external returns (bytes32 attestationId);
}

/**
 * @title MarketResolver
 * @notice Resolves PredictionMarket contracts using Chainlink price feeds
 *         combined with AI oracle input. Every resolution is attested
 *         on-chain via KiteAttestationRegistry for full auditability.
 *
 * Resolution flow:
 *  1. Agent calls aiResolve() → proposes outcome + rationale
 *  2. 24-hour dispute window opens
 *  3. After window, anyone calls finalize() → market pays winners, fees released
 */
contract MarketResolver {
    enum Outcome { UNRESOLVED, YES, NO }
    enum Source  { MULTISIG, CHAINLINK, UMA, AI_ORACLE }

    struct Resolution {
        uint8   outcome;
        uint8   source;
        uint256 timestamp;
        address resolvedBy;
        bool    finalized;
    }

    mapping(bytes32 => Resolution) public resolutions;

    address public owner;
    address public agent;

    IKiteAttestationRegistry public immutable attestationRegistry;

    // Market address → price feed address
    mapping(address => address) public priceFeeds;
    // Market address → target price (6-decimal) for YES resolution
    mapping(address => uint256) public targetPrices;
    // Market address → whether target is an upper bound (price >= target → YES)
    mapping(address => bool) public targetIsUpper;

    event ResolutionProposed(
        bytes32 indexed marketId,
        uint8   outcome,
        uint8   source,
        string  rationale
    );
    event ResolutionFinalized(bytes32 indexed marketId, uint8 outcome);
    event PriceFeedSet(address indexed market, address feed, uint256 targetPrice);

    modifier onlyOwner() {
        require(msg.sender == owner, "MarketResolver: not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == agent, "MarketResolver: not authorized");
        _;
    }

    constructor(address _attestationRegistry) {
        owner                = msg.sender;
        attestationRegistry  = IKiteAttestationRegistry(_attestationRegistry);
    }

    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
    }

    function setPriceFeed(
        address market,
        address feed,
        uint256 targetPrice,
        bool    isUpper
    ) external onlyOwner {
        priceFeeds[market]      = feed;
        targetPrices[market]    = targetPrice;
        targetIsUpper[market]   = isUpper;
        emit PriceFeedSet(market, feed, targetPrice);
    }

    // Resolution

    /**
     * @notice AI agent proposes a resolution outcome.
     * @param market    PredictionMarket contract address
     * @param _outcome  1 = YES, 2 = NO
     * @param rationale Short rationale or IPFS CID with full reasoning
     */
    function aiResolve(
        address market,
        uint8   _outcome,
        string calldata rationale
    ) external onlyAuthorized {
        require(_outcome == 1 || _outcome == 2, "MarketResolver: invalid outcome");

        bytes32 marketId = keccak256(abi.encodePacked(market));
        require(resolutions[marketId].timestamp == 0, "MarketResolver: already proposed");

        IPredictionMarket pm = IPredictionMarket(market);
        require(block.timestamp >= pm.closingTime(), "MarketResolver: market still open");

        // Write attestation to Kite Registry
        bytes32 contentHash = keccak256(abi.encodePacked(market, _outcome, rationale, block.timestamp));
        attestationRegistry.writeAttestation(contentHash, rationale);

        resolutions[marketId] = Resolution({
            outcome:    _outcome,
            source:     uint8(Source.AI_ORACLE),
            timestamp:  block.timestamp,
            resolvedBy: msg.sender,
            finalized:  false
        });

        // Inform the market contract of the outcome
        pm.resolve(IPredictionMarket.Outcome(_outcome));

        emit ResolutionProposed(marketId, _outcome, uint8(Source.AI_ORACLE), rationale);
    }

    /**
     * @notice Resolve using Chainlink feed directly (no dispute window for oracle resolution).
     */
    function chainlinkResolve(address market, string calldata rationale) external onlyAuthorized {
        address feed = priceFeeds[market];
        require(feed != address(0), "MarketResolver: no price feed");

        bytes32 marketId = keccak256(abi.encodePacked(market));
        require(resolutions[marketId].timestamp == 0, "MarketResolver: already proposed");

        IPredictionMarket pm = IPredictionMarket(market);
        require(block.timestamp >= pm.closingTime(), "MarketResolver: market still open");

        IChainlinkFeed oracle = IChainlinkFeed(feed);
        (, int256 answer,,,) = oracle.latestRoundData();
        require(answer > 0, "MarketResolver: invalid oracle answer");

        uint8 decimals = oracle.decimals();
        uint256 price  = uint256(answer) * (10 ** 6) / (10 ** uint256(decimals));

        uint8 _outcome = targetIsUpper[market]
            ? (price >= targetPrices[market] ? 1 : 2) // 1=YES, 2=NO
            : (price <= targetPrices[market] ? 1 : 2);

        bytes32 contentHash = keccak256(abi.encodePacked(market, _outcome, rationale, block.timestamp));
        attestationRegistry.writeAttestation(contentHash, rationale);

        resolutions[marketId] = Resolution({
            outcome:    _outcome,
            source:     uint8(Source.CHAINLINK),
            timestamp:  block.timestamp,
            resolvedBy: msg.sender,
            finalized:  false
        });

        pm.resolve(IPredictionMarket.Outcome(_outcome));
        emit ResolutionProposed(marketId, _outcome, uint8(Source.CHAINLINK), rationale);
    }

    /**
     * @notice Finalise a resolution after the 24-hour dispute window.
     *         Determines if the agent prediction was correct and triggers
     *         ConditionalPayment accordingly.
     */
    function finalize(address market) external {
        bytes32 marketId = keccak256(abi.encodePacked(market));
        Resolution storage r = resolutions[marketId];

        require(r.timestamp > 0,    "MarketResolver: not resolved");
        require(!r.finalized,       "MarketResolver: already finalized");
        require(
            block.timestamp >= r.timestamp + 24 hours,
            "MarketResolver: dispute window active"
        );

        r.finalized = true;

        // Agent is correct if it used AI_ORACLE and outcome matches Chainlink (if feed exists)
        bool agentCorrect = true;
        address feed = priceFeeds[market];
        if (feed != address(0) && r.source == uint8(Source.AI_ORACLE)) {
            IChainlinkFeed oracle = IChainlinkFeed(feed);
            try oracle.latestRoundData() returns (uint80, int256 answer, uint256, uint256, uint80) {
                if (answer > 0) {
                    uint8 decimals = oracle.decimals();
                    uint256 price  = uint256(answer) * 1e6 / (10 ** uint256(decimals));
                    uint8 chainlinkOutcome = targetIsUpper[market]
                        ? (price >= targetPrices[market] ? 1 : 2)
                        : (price <= targetPrices[market] ? 1 : 2);
                    agentCorrect = (r.outcome == chainlinkOutcome);
                }
            } catch {}
        }

        IPredictionMarket(market).finalize(agentCorrect);
        emit ResolutionFinalized(marketId, r.outcome);
    }
}
