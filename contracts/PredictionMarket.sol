// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IConditionalPayment {
    function lockFee(bytes32 marketId, uint256 amount) external;
    function releaseFee(bytes32 marketId) external;
    function refundFee(bytes32 marketId) external;
}

/**
 * @title PredictionMarket
 * @notice Binary YES/NO prediction market settled by the MarketResolver.
 *         - Participants stake USDC on YES or NO.
 *         - When resolved, winners split the losing side's stakes proportionally.
 *         - A 1% performance fee is locked in ConditionalPayment on each entry
 *           and released to treasury only if the agent's prediction was correct.
 */
contract PredictionMarket {
    enum Side    { YES, NO }
    enum Outcome { UNRESOLVED, YES, NO }

    struct Position {
        uint256 yesStake;
        uint256 noStake;
        bool    claimed;
    }

    IERC20               public immutable usdc;
    IConditionalPayment  public immutable conditionalPayment;
    address              public immutable factory;
    address              public immutable resolver;

    string   public question;
    uint256  public closingTime;        // No new positions after this
    uint256  public resolutionTime;     // Set when outcome is finalised

    uint256  public totalYesStake;
    uint256  public totalNoStake;

    Outcome  public outcome = Outcome.UNRESOLVED;
    bool     public finalized;

    uint256  public constant FEE_BPS = 100; // 1%

    mapping(address => Position) public positions;

    bytes32  public marketId;

    event PositionEntered(address indexed participant, Side side, uint256 stake, uint256 fee);
    event PositionExited(address indexed participant, Side side, uint256 refund);
    event WinningsClaimed(address indexed participant, uint256 amount);
    event MarketResolved(Outcome outcome, uint256 resolvedAt);
    event MarketFinalized(Outcome outcome);

    modifier onlyResolver() {
        require(msg.sender == resolver, "PredictionMarket: not resolver");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "PredictionMarket: not factory");
        _;
    }

    modifier beforeClose() {
        require(block.timestamp < closingTime, "PredictionMarket: market closed");
        _;
    }

    modifier afterResolve() {
        require(finalized, "PredictionMarket: not finalized");
        _;
    }

    constructor(
        address _usdc,
        address _conditionalPayment,
        address _resolver,
        string memory _question,
        uint256 _closingTime
    ) {
        factory            = msg.sender;
        usdc               = IERC20(_usdc);
        conditionalPayment = IConditionalPayment(_conditionalPayment);
        resolver           = _resolver;
        question           = _question;
        closingTime        = _closingTime;
        marketId           = keccak256(abi.encodePacked(address(this)));
    }

    // Participant actions

    /**
     * @notice Enter a position on YES or NO.
     * @param side     0 = YES, 1 = NO
     * @param amount   USDC stake in 6-decimal units (e.g. 100 * 1e6 = $100)
     */
    function enterPosition(Side side, uint256 amount) external beforeClose {
        require(outcome == Outcome.UNRESOLVED, "PredictionMarket: already resolved");
        require(amount > 0, "PredictionMarket: zero amount");

        uint256 fee  = (amount * FEE_BPS) / 10_000;
        uint256 net  = amount - fee;

        usdc.transferFrom(msg.sender, address(this), amount);

        // Lock performance fee in ConditionalPayment escrow
        usdc.transfer(address(conditionalPayment), fee);
        conditionalPayment.lockFee(marketId, fee);

        Position storage pos = positions[msg.sender];
        if (side == Side.YES) {
            pos.yesStake  += net;
            totalYesStake += net;
        } else {
            pos.noStake   += net;
            totalNoStake  += net;
        }

        emit PositionEntered(msg.sender, side, net, fee);
    }

    /**
     * @notice Exit a position before market close — full refund of net stake.
     */
    function exitPosition(Side side) external beforeClose {
        Position storage pos = positions[msg.sender];
        uint256 refund;

        if (side == Side.YES) {
            refund       = pos.yesStake;
            pos.yesStake = 0;
            totalYesStake -= refund;
        } else {
            refund      = pos.noStake;
            pos.noStake = 0;
            totalNoStake -= refund;
        }

        require(refund > 0, "PredictionMarket: no position");
        usdc.transfer(msg.sender, refund);
        emit PositionExited(msg.sender, side, refund);
    }

    /**
     * @notice Claim winnings after market is finalized.
     */
    function claimWinnings() external afterResolve {
        Position storage pos = positions[msg.sender];
        require(!pos.claimed, "PredictionMarket: already claimed");

        uint256 winnings = _calculateWinnings(msg.sender);
        require(winnings > 0, "PredictionMarket: no winnings");

        pos.claimed = true;
        usdc.transfer(msg.sender, winnings);
        emit WinningsClaimed(msg.sender, winnings);
    }

    // Resolver actions

    /**
     * @notice Called by MarketResolver once the outcome is determined.
     * @param _outcome  1 = YES, 2 = NO
     */
    function resolve(Outcome _outcome) external onlyResolver {
        require(outcome == Outcome.UNRESOLVED, "PredictionMarket: already resolved");
        require(_outcome != Outcome.UNRESOLVED, "PredictionMarket: invalid outcome");
        require(block.timestamp >= closingTime, "PredictionMarket: not closed yet");

        outcome        = _outcome;
        resolutionTime = block.timestamp;

        emit MarketResolved(_outcome, block.timestamp);
    }

    /**
     * @notice Finalises the market after 24-hour dispute window.
     *         Releases or refunds performance fees accordingly.
     */
    function finalize(bool agentCorrect) external onlyResolver {
        require(outcome != Outcome.UNRESOLVED, "PredictionMarket: not resolved");
        require(!finalized, "PredictionMarket: already finalized");
        require(block.timestamp >= resolutionTime + 24 hours, "PredictionMarket: dispute window active");

        finalized = true;

        if (agentCorrect) {
            conditionalPayment.releaseFee(marketId);
        } else {
            conditionalPayment.refundFee(marketId);
        }

        emit MarketFinalized(outcome);
    }

    function _calculateWinnings(address participant) internal view returns (uint256) {
        Position storage pos = positions[participant];
        if (outcome == Outcome.YES && pos.yesStake > 0 && totalYesStake > 0) {
            uint256 loserPool = totalNoStake;
            return pos.yesStake + (pos.yesStake * loserPool) / totalYesStake;
        }
        if (outcome == Outcome.NO && pos.noStake > 0 && totalNoStake > 0) {
            uint256 loserPool = totalYesStake;
            return pos.noStake + (pos.noStake * loserPool) / totalNoStake;
        }
        return 0;
    }

    function previewWinnings(address participant) external view returns (uint256) {
        return _calculateWinnings(participant);
    }

    function totalPool() external view returns (uint256) {
        return totalYesStake + totalNoStake;
    }
}
