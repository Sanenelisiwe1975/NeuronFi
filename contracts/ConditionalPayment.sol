// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ConditionalPayment
 * @notice Escrows performance fees locked by PredictionMarket on every trade entry.
 *         - If the agent's prediction is CORRECT → fee is released to the treasury.
 *         - If the agent's prediction is WRONG   → fee is refunded to the market pool.
 *
 *         Only the authorised MarketResolver may trigger release or refund.
 */
contract ConditionalPayment {
    IERC20  public immutable usdc;
    address public owner;
    address public treasury;
    address public resolver;

    struct Lock {
        uint256 amount;
        address market;     // originating PredictionMarket
        bool    released;
        bool    refunded;
    }

    mapping(bytes32 => Lock) public locks;
    uint256 public totalLocked;
    uint256 public totalReleased;
    uint256 public totalRefunded;

    event FeeLocked(bytes32 indexed marketId, uint256 amount, address market);
    event FeeReleased(bytes32 indexed marketId, uint256 amount, address treasury);
    event FeeRefunded(bytes32 indexed marketId, uint256 amount, address market);

    modifier onlyOwner() {
        require(msg.sender == owner, "ConditionalPayment: not owner");
        _;
    }

    modifier onlyResolver() {
        require(msg.sender == resolver || msg.sender == owner, "ConditionalPayment: not resolver");
        _;
    }

    constructor(address _usdc, address _treasury) {
        owner    = msg.sender;
        usdc     = IERC20(_usdc);
        treasury = _treasury;
    }

    function setResolver(address _resolver) external onlyOwner {
        resolver = _resolver;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    // Lock / Release / Refund

    /**
     * @notice Called by PredictionMarket when a participant enters a position.
     *         Expects USDC to have been transferred to this contract beforehand.
     */
    function lockFee(bytes32 marketId, uint256 amount) external {
        require(amount > 0, "ConditionalPayment: zero amount");
        require(locks[marketId].amount == 0, "ConditionalPayment: already locked");

        locks[marketId] = Lock({
            amount:   amount,
            market:   msg.sender,
            released: false,
            refunded: false
        });

        totalLocked += amount;
        emit FeeLocked(marketId, amount, msg.sender);
    }

    /**
     * @notice Agent prediction was CORRECT — release fee to treasury.
     */
    function releaseFee(bytes32 marketId) external onlyResolver {
        Lock storage lock = locks[marketId];
        require(lock.amount > 0,   "ConditionalPayment: no lock");
        require(!lock.released,    "ConditionalPayment: already released");
        require(!lock.refunded,    "ConditionalPayment: already refunded");

        lock.released  = true;
        totalReleased += lock.amount;

        usdc.transfer(treasury, lock.amount);
        emit FeeReleased(marketId, lock.amount, treasury);
    }

    /**
     * @notice Agent prediction was WRONG — refund fee to the originating market pool.
     */
    function refundFee(bytes32 marketId) external onlyResolver {
        Lock storage lock = locks[marketId];
        require(lock.amount > 0,   "ConditionalPayment: no lock");
        require(!lock.released,    "ConditionalPayment: already released");
        require(!lock.refunded,    "ConditionalPayment: already refunded");

        lock.refunded  = true;
        totalRefunded += lock.amount;

        usdc.transfer(lock.market, lock.amount);
        emit FeeRefunded(marketId, lock.amount, lock.market);
    }

    function getLock(bytes32 marketId)
        external
        view
        returns (uint256 amount, address market, bool released, bool refunded)
    {
        Lock storage lock = locks[marketId];
        return (lock.amount, lock.market, lock.released, lock.refunded);
    }
}
