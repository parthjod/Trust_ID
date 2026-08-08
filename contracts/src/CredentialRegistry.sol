// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DIDRegistry.sol";

/// @title CredentialRegistry
/// @notice Issues and manages Verifiable Credentials (hashes only — no raw PII on-chain)
contract CredentialRegistry {
    enum CredentialStatus { Active, Revoked, Expired }

    struct Credential {
        bytes32 credentialHash;
        address issuer;
        address subject;
        string credentialType;
        uint256 issuedAt;
        uint256 expiresAt;
        CredentialStatus status;
    }

    DIDRegistry public immutable DID_REGISTRY;

    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) public subjectCredentials;
    mapping(address => bool) public authorizedIssuers;
    address public owner;

    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed issuer,
        address indexed subject,
        string credentialType
    );
    event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    error NotAuthorizedIssuer();
    error CredentialNotFound();
    error NotCredentialIssuer();
    error NotIssuerOrSubject();
    error SubjectHasNoDid();

    constructor(address _didRegistry) {
        DID_REGISTRY = DIDRegistry(_didRegistry);
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        if (!authorizedIssuers[msg.sender]) revert NotAuthorizedIssuer();
        _;
    }

    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    function issueCredential(
        address subject,
        string calldata credType,
        bytes32 credHash,
        uint256 expiresAt
    ) external onlyAuthorizedIssuer returns (bytes32 credentialId) {
        if (!DID_REGISTRY.isActiveDid(subject)) revert SubjectHasNoDid();

        credentialId = keccak256(abi.encodePacked(
            msg.sender, subject, credHash, block.timestamp
        ));

        credentials[credentialId] = Credential({
            credentialHash: credHash,
            issuer: msg.sender,
            subject: subject,
            credentialType: credType,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            status: CredentialStatus.Active
        });

        subjectCredentials[subject].push(credentialId);

        emit CredentialIssued(credentialId, msg.sender, subject, credType);
    }

    function revokeCredential(bytes32 credentialId) external {
        Credential storage cred = credentials[credentialId];
        if (cred.issuedAt == 0) revert CredentialNotFound();
        if (cred.issuer != msg.sender && cred.subject != msg.sender) revert NotIssuerOrSubject();

        cred.status = CredentialStatus.Revoked;
        emit CredentialRevoked(credentialId, msg.sender);
    }

    function verifyCredential(bytes32 credentialId)
        external view
        returns (bool valid, Credential memory cred)
    {
        cred = credentials[credentialId];
        if (cred.issuedAt == 0) return (false, cred);

        valid = (
            cred.status == CredentialStatus.Active &&
            (cred.expiresAt == 0 || cred.expiresAt > block.timestamp)
        );
    }

    function getSubjectCredentials(address subject) external view returns (bytes32[] memory) {
        return subjectCredentials[subject];
    }
}
