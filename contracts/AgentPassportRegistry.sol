// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentPassportRegistry
 * @notice On-chain identity registry for autonomous AI agents on Kite Chain.
 *
 *         Each agent registers once with:
 *         - A human-readable name ("NeuronFi DeFi Agent")
 *         - A list of capabilities (e.g. ["trade", "attest", "subscribe"])
 *         - The owner address (the deployer / user who controls the agent)
 *
 *         The registry assigns a unique passportId (bytes32) derived from the
 *         owner address and name. This ID is embedded in every attestation the
 *         agent writes, providing permanent on-chain provenance.
 */
contract AgentPassportRegistry {
    struct AgentPassport {
        bytes32 passportId;
        string  name;
        string[] capabilities;
        address owner;
        address agentWallet;    // hot wallet the agent uses to sign txs
        uint256 registeredAt;
        uint256 lastActiveAt;
        bool    active;
    }

    mapping(bytes32 => AgentPassport) public passports;
    mapping(address => bytes32)       public ownerToPassportId;   // owner → passportId
    mapping(address => bytes32)       public walletToPassportId;  // agent wallet → passportId

    bytes32[] public allPassportIds;

    address public owner;

    event PassportRegistered(
        bytes32 indexed passportId,
        address indexed owner,
        address indexed agentWallet,
        string  name
    );

    event PassportUpdated(bytes32 indexed passportId, uint256 lastActiveAt);
    event PassportDeactivated(bytes32 indexed passportId);

    modifier onlyOwner() {
        require(msg.sender == owner, "AgentPassportRegistry: not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ── Register ──────────────────────────────────────────────────────────

    /**
     * @notice Register an agent. Can only be called once per owner address.
     * @param name         Human-readable agent name
     * @param capabilities List of capability strings e.g. ["trade","attest","subscribe"]
     * @param agentWallet  The agent's hot wallet address (used to sign on-chain actions)
     * @return passportId  Unique ID for this agent
     */
    function register(
        string calldata  name,
        string[] calldata capabilities,
        address agentWallet
    ) external returns (bytes32 passportId) {
        require(bytes(name).length > 0, "AgentPassportRegistry: empty name");
        require(agentWallet != address(0), "AgentPassportRegistry: zero wallet");

        // Allow re-registration if the previous one is deactivated
        bytes32 existing = ownerToPassportId[msg.sender];
        if (existing != bytes32(0)) {
            require(!passports[existing].active, "AgentPassportRegistry: already registered");
        }

        passportId = keccak256(abi.encodePacked(msg.sender, name, block.timestamp));

        passports[passportId] = AgentPassport({
            passportId:    passportId,
            name:          name,
            capabilities:  capabilities,
            owner:         msg.sender,
            agentWallet:   agentWallet,
            registeredAt:  block.timestamp,
            lastActiveAt:  block.timestamp,
            active:        true
        });

        ownerToPassportId[msg.sender]  = passportId;
        walletToPassportId[agentWallet] = passportId;
        allPassportIds.push(passportId);

        emit PassportRegistered(passportId, msg.sender, agentWallet, name);
    }

    /**
     * @notice Ping to update lastActiveAt — called by agent on each cycle.
     */
    function ping(bytes32 passportId) external {
        AgentPassport storage p = passports[passportId];
        require(p.active, "AgentPassportRegistry: not active");
        require(
            msg.sender == p.owner || msg.sender == p.agentWallet,
            "AgentPassportRegistry: not authorized"
        );
        p.lastActiveAt = block.timestamp;
        emit PassportUpdated(passportId, block.timestamp);
    }

    /**
     * @notice Update the agent's hot wallet address.
     */
    function updateAgentWallet(bytes32 passportId, address newWallet) external {
        AgentPassport storage p = passports[passportId];
        require(msg.sender == p.owner, "AgentPassportRegistry: not owner");
        require(newWallet != address(0), "AgentPassportRegistry: zero wallet");

        delete walletToPassportId[p.agentWallet];
        p.agentWallet = newWallet;
        walletToPassportId[newWallet] = passportId;
    }

    function deactivate(bytes32 passportId) external {
        AgentPassport storage p = passports[passportId];
        require(msg.sender == p.owner || msg.sender == owner, "AgentPassportRegistry: not authorized");
        p.active = false;
        emit PassportDeactivated(passportId);
    }

    // ── View ──────────────────────────────────────────────────────────────

    function getPassportId(address _owner) external view returns (bytes32) {
        return ownerToPassportId[_owner];
    }

    function getPassportByWallet(address wallet) external view returns (bytes32) {
        return walletToPassportId[wallet];
    }

    function getPassport(bytes32 passportId)
        external
        view
        returns (
            string memory name,
            address _owner,
            address agentWallet,
            bool active,
            uint256 registeredAt,
            uint256 lastActiveAt
        )
    {
        AgentPassport storage p = passports[passportId];
        return (p.name, p.owner, p.agentWallet, p.active, p.registeredAt, p.lastActiveAt);
    }

    function getCapabilities(bytes32 passportId) external view returns (string[] memory) {
        return passports[passportId].capabilities;
    }

    function totalAgents() external view returns (uint256) {
        return allPassportIds.length;
    }
}
