// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PredictionMarket.sol";

/**
 * @title MarketFactory
 * @notice Creates and indexes PredictionMarket instances.
 *         Only the authorised agent or owner may create markets.
 */
contract MarketFactory {
    address public owner;
    address public agent;
    address public immutable usdc;
    address public immutable conditionalPayment;
    address public immutable resolver;

    address[] private _allMarkets;
    mapping(address => bool) public isMarket;

    event MarketCreated(
        address indexed marketAddress,
        string  question,
        uint256 closingTime,
        address createdBy
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "MarketFactory: not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == agent, "MarketFactory: not authorized");
        _;
    }

    constructor(
        address _usdc,
        address _conditionalPayment,
        address _resolver
    ) {
        owner              = msg.sender;
        usdc               = _usdc;
        conditionalPayment = _conditionalPayment;
        resolver           = _resolver;
    }

    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
    }

    /**
     * @notice Deploy a new prediction market.
     * @param question     Human-readable market question
     * @param closingTime  Unix timestamp after which no new positions are accepted
     */
    function createMarket(
        string calldata question,
        uint256 closingTime
    ) external onlyAuthorized returns (address marketAddress) {
        require(closingTime > block.timestamp, "MarketFactory: closing time in past");
        require(bytes(question).length > 0, "MarketFactory: empty question");

        PredictionMarket market = new PredictionMarket(
            usdc,
            conditionalPayment,
            resolver,
            question,
            closingTime
        );

        marketAddress = address(market);
        _allMarkets.push(marketAddress);
        isMarket[marketAddress] = true;

        emit MarketCreated(marketAddress, question, closingTime, msg.sender);
    }

    function getActiveMarkets() external view returns (address[] memory) {
        // Return all non-finalized markets
        uint256 count;
        for (uint256 i; i < _allMarkets.length; i++) {
            if (!PredictionMarket(_allMarkets[i]).finalized()) count++;
        }
        address[] memory active = new address[](count);
        uint256 j;
        for (uint256 i; i < _allMarkets.length; i++) {
            if (!PredictionMarket(_allMarkets[i]).finalized()) {
                active[j++] = _allMarkets[i];
            }
        }
        return active;
    }

    function getAllMarkets() external view returns (address[] memory) {
        return _allMarkets;
    }

    function marketCount() external view returns (uint256) {
        return _allMarkets.length;
    }
}
