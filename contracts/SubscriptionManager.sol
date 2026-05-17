// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title SubscriptionManager
 * @notice Manages tiered USDC subscriptions for NeuronFi.
 *         Plans: FREE (0), BASIC ($29/mo), PRO ($99/mo), INSTITUTIONAL ($499/mo)
 *         Users pay USDC upfront for one period. Grace period allows late renewal.
 */
contract SubscriptionManager {
    IERC20  public immutable usdc;
    address public owner;
    address public treasury;

    struct Plan {
        uint256 pricePerPeriod;   // USDC 6-decimal (e.g. 29 * 1e6 = $29)
        uint256 period;           // seconds (e.g. 30 days)
        uint256 gracePeriod;      // seconds (e.g. 3 days)
        bool    active;
    }

    struct Subscription {
        address subscriber;
        uint8   plan;
        uint256 startedAt;
        uint256 paidUntil;
        uint256 totalPaid;
        bool    cancelled;
    }

    mapping(uint8 => Plan)          public plans;
    mapping(address => Subscription) public subscriptions;

    uint256 public activeSubscribers;
    uint256 public totalRevenue;

    uint8 public constant PLAN_FREE        = 0;
    uint8 public constant PLAN_BASIC       = 1;
    uint8 public constant PLAN_PRO         = 2;
    uint8 public constant PLAN_INSTITUTIONAL = 3;

    event Subscribed(address indexed subscriber, uint8 plan, uint256 paidUntil);
    event Renewed(address indexed subscriber, uint8 plan, uint256 paidUntil);
    event Cancelled(address indexed subscriber, uint8 plan);
    event PlanUpdated(uint8 plan, uint256 price, uint256 period);

    modifier onlyOwner() {
        require(msg.sender == owner, "SubscriptionManager: not owner");
        _;
    }

    constructor(address _usdc, address _treasury) {
        owner    = msg.sender;
        usdc     = IERC20(_usdc);
        treasury = _treasury;

        // Initialise default plans
        plans[PLAN_FREE]          = Plan(0,          30 days, 3 days, true);
        plans[PLAN_BASIC]         = Plan(29 * 1e6,   30 days, 3 days, true);
        plans[PLAN_PRO]           = Plan(99 * 1e6,   30 days, 3 days, true);
        plans[PLAN_INSTITUTIONAL] = Plan(499 * 1e6,  30 days, 7 days, true);
    }

    function setPlan(
        uint8   planId,
        uint256 pricePerPeriod,
        uint256 period,
        uint256 gracePeriod,
        bool    active
    ) external onlyOwner {
        plans[planId] = Plan(pricePerPeriod, period, gracePeriod, active);
        emit PlanUpdated(planId, pricePerPeriod, period);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function withdrawRevenue(uint256 amount) external onlyOwner {
        usdc.transfer(treasury, amount);
    }

    //Subscriber actions

    /**
     * @notice Subscribe to a plan. For FREE plan, no USDC required.
     */
    function subscribe(uint8 planId) external {
        Plan storage plan = plans[planId];
        require(plan.active, "SubscriptionManager: plan not active");

        Subscription storage sub = subscriptions[msg.sender];
        bool isNew = sub.startedAt == 0;

        // Collect payment for paid plans
        if (plan.pricePerPeriod > 0) {
            usdc.transferFrom(msg.sender, address(this), plan.pricePerPeriod);
            totalRevenue += plan.pricePerPeriod;
        }

        uint256 startFrom = (sub.paidUntil > block.timestamp)
            ? sub.paidUntil   // renewing before expiry — extend from current end
            : block.timestamp;

        uint256 newPaidUntil = startFrom + plan.period;

        if (isNew) {
            subscriptions[msg.sender] = Subscription({
                subscriber: msg.sender,
                plan:       planId,
                startedAt:  block.timestamp,
                paidUntil:  newPaidUntil,
                totalPaid:  plan.pricePerPeriod,
                cancelled:  false
            });
            activeSubscribers++;
            emit Subscribed(msg.sender, planId, newPaidUntil);
        } else {
            sub.plan       = planId;
            sub.paidUntil  = newPaidUntil;
            sub.totalPaid += plan.pricePerPeriod;
            sub.cancelled  = false;
            emit Renewed(msg.sender, planId, newPaidUntil);
        }
    }

    function cancel() external {
        Subscription storage sub = subscriptions[msg.sender];
        require(sub.startedAt > 0,  "SubscriptionManager: no subscription");
        require(!sub.cancelled,     "SubscriptionManager: already cancelled");

        sub.cancelled = true;
        if (activeSubscribers > 0) activeSubscribers--;
        emit Cancelled(msg.sender, sub.plan);
    }


    /**
     * @notice Returns true if the account has an active (non-expired, non-cancelled) subscription.
     *         Grace period extends the window by gracePeriod seconds.
     */
    function isActive(address account) external view returns (bool) {
        Subscription storage sub = subscriptions[account];
        if (sub.startedAt == 0 || sub.cancelled) return false;
        Plan storage plan = plans[sub.plan];
        return block.timestamp <= sub.paidUntil + plan.gracePeriod;
    }

    function getSubscription(address account)
        external
        view
        returns (
            uint8   plan,
            uint256 paidUntil,
            uint256 totalPaid,
            bool    cancelled,
            bool    active
        )
    {
        Subscription storage sub = subscriptions[account];
        Plan storage p = plans[sub.plan];
        bool _active = !sub.cancelled && block.timestamp <= sub.paidUntil + p.gracePeriod;
        return (sub.plan, sub.paidUntil, sub.totalPaid, sub.cancelled, _active);
    }
}
