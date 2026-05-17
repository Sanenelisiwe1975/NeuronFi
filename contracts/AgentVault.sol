// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title AgentVault
 * @notice Holds the agent's USDC capital. The owner funds the vault;
 *         the authorised agent address may withdraw up to the daily limit
 *         to fund trades. Auto-top-up threshold triggers an event so the
 *         agent can pull capital from the vault before each cycle.
 */
contract AgentVault {
    IERC20 public immutable usdc;

    address public owner;
    address public agent;

    uint256 public dailyLimitUsdc;          // 6-decimal USDC
    uint256 public dailyUsedUsdc;
    uint256 public lastResetDay;

    uint256 public autoTopUpThreshold;      // agent requests top-up below this balance
    uint256 public autoTopUpAmount;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event AgentUpdated(address indexed newAgent);
    event DailyLimitUpdated(uint256 newLimit);
    event AutoTopUpTriggered(address indexed agent, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "AgentVault: not owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner, "AgentVault: not agent");
        _;
    }

    constructor(
        address _usdc,
        address _agent,
        uint256 _dailyLimitUsdc,       // e.g. 10_000 * 1e6 = $10,000 / day
        uint256 _autoTopUpThreshold,   // e.g. 50 * 1e6 = $50
        uint256 _autoTopUpAmount       // e.g. 500 * 1e6 = $500
    ) {
        owner              = msg.sender;
        usdc               = IERC20(_usdc);
        agent              = _agent;
        dailyLimitUsdc     = _dailyLimitUsdc;
        autoTopUpThreshold = _autoTopUpThreshold;
        autoTopUpAmount    = _autoTopUpAmount;
        lastResetDay       = _today();
    }

    function deposit(uint256 amount) external onlyOwner {
        usdc.transferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
        emit AgentUpdated(_agent);
    }

    function setDailyLimit(uint256 _limit) external onlyOwner {
        dailyLimitUsdc = _limit;
        emit DailyLimitUpdated(_limit);
    }

    function setAutoTopUp(uint256 threshold, uint256 amount) external onlyOwner {
        autoTopUpThreshold = threshold;
        autoTopUpAmount    = amount;
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        usdc.transfer(owner, amount);
        emit Withdrawn(owner, amount);
    }


    /**
     * @notice Agent calls this to pull USDC for a trade.
     *         Enforces daily withdrawal limit and resets at UTC midnight.
     */
    function withdraw(uint256 amount) external onlyAgent {
        _resetDailyIfNeeded();
        require(dailyUsedUsdc + amount <= dailyLimitUsdc, "AgentVault: daily limit exceeded");
        require(usdcBalance() >= amount, "AgentVault: insufficient balance");

        dailyUsedUsdc += amount;
        usdc.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Agent calls this when its wallet balance drops below autoTopUpThreshold.
     *         Transfers autoTopUpAmount to the agent address.
     */
    function triggerAutoTopUp(address agentWallet) external onlyAgent {
        require(
            IERC20(address(usdc)).balanceOf(agentWallet) < autoTopUpThreshold,
            "AgentVault: top-up not needed"
        );
        require(usdcBalance() >= autoTopUpAmount, "AgentVault: insufficient vault balance");

        _resetDailyIfNeeded();
        dailyUsedUsdc += autoTopUpAmount;
        usdc.transfer(agentWallet, autoTopUpAmount);
        emit AutoTopUpTriggered(agentWallet, autoTopUpAmount);
    }


    function usdcBalance() public view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    function remainingDailyUsdc() public view returns (uint256) {
        if (_today() != lastResetDay) return dailyLimitUsdc;
        uint256 used = dailyUsedUsdc;
        return used >= dailyLimitUsdc ? 0 : dailyLimitUsdc - used;
    }


    function _today() internal view returns (uint256) {
        return block.timestamp / 86400;
    }

    function _resetDailyIfNeeded() internal {
        uint256 today = _today();
        if (today != lastResetDay) {
            dailyUsedUsdc = 0;
            lastResetDay  = today;
        }
    }
}
