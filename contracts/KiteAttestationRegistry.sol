// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KiteAttestationRegistry
 * @notice Permanent on-chain record of every AI decision made by the agent.
 *         Each attestation stores a content hash, the reasoning IPFS CID,
 *         the attesting agent address, and a timestamp — making every
 *         autonomous decision permanently auditable.
 */
contract KiteAttestationRegistry {
    struct Attestation {
        bytes32 contentHash;    // keccak256 of decision payload
        string  rationaleUri;   // IPFS CID or inline rationale string
        address attestedBy;
        uint256 attestedAt;
        bool    exists;
    }

    mapping(bytes32 => Attestation) private _attestations;
    mapping(address => bool)        public  authorizedAgents;

    address public owner;
    uint256 public totalAttestations;

    event AttestationWritten(
        bytes32 indexed attestationId,
        bytes32 indexed contentHash,
        address indexed attestedBy,
        uint256 attestedAt
    );

    event AgentAuthorized(address indexed agent, bool authorized);

    modifier onlyOwner() {
        require(msg.sender == owner, "KiteRegistry: not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedAgents[msg.sender] || msg.sender == owner, "KiteRegistry: not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedAgents[msg.sender] = true;
    }

    function setAgentAuthorization(address agent, bool authorized) external onlyOwner {
        authorizedAgents[agent] = authorized;
        emit AgentAuthorized(agent, authorized);
    }

    /**
     * @notice Write an AI decision attestation.
     * @param contentHash  keccak256 hash of the full decision JSON
     * @param rationaleUri Short rationale string or IPFS CID for full data
     * @return attestationId  Unique ID for this attestation
     */
    function writeAttestation(
        bytes32 contentHash,
        string calldata rationaleUri
    ) external onlyAuthorized returns (bytes32 attestationId) {
        attestationId = keccak256(abi.encodePacked(
            contentHash,
            msg.sender,
            block.timestamp,
            totalAttestations
        ));

        require(!_attestations[attestationId].exists, "KiteRegistry: duplicate");

        _attestations[attestationId] = Attestation({
            contentHash:  contentHash,
            rationaleUri: rationaleUri,
            attestedBy:   msg.sender,
            attestedAt:   block.timestamp,
            exists:       true
        });

        totalAttestations++;

        emit AttestationWritten(attestationId, contentHash, msg.sender, block.timestamp);
    }

    // Read

    function getAttestation(bytes32 attestationId)
        external
        view
        returns (
            bytes32 contentHash,
            string memory rationaleUri,
            address attestedBy,
            uint256 attestedAt
        )
    {
        Attestation storage a = _attestations[attestationId];
        require(a.exists, "KiteRegistry: not found");
        return (a.contentHash, a.rationaleUri, a.attestedBy, a.attestedAt);
    }

    function attestationExists(bytes32 attestationId) external view returns (bool) {
        return _attestations[attestationId].exists;
    }
}
