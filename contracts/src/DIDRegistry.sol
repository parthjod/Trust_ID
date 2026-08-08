// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DIDRegistry
/// @notice Decentralized Identifier registry — maps addresses to DID documents
contract DIDRegistry {
    struct DidDocument {
        address owner;
        string didUri;
        bytes32 publicKeyHash;
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
    }

    mapping(address => DidDocument) public dids;
    mapping(bytes32 => address) public didHashToOwner;
    uint256 public totalDids;

    event DidCreated(address indexed owner, string didUri, bytes32 publicKeyHash);
    event DidUpdated(address indexed owner, string newDidUri);
    event DidRevoked(address indexed owner);

    error DidAlreadyExists();
    error DidNotFound();
    error DidIsRevoked();

    function createDid(string calldata didUri, bytes32 publicKeyHash) external {
        if (dids[msg.sender].createdAt != 0) revert DidAlreadyExists();

        dids[msg.sender] = DidDocument({
            owner: msg.sender,
            didUri: didUri,
            publicKeyHash: publicKeyHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            active: true
        });

        didHashToOwner[publicKeyHash] = msg.sender;
        totalDids++;

        emit DidCreated(msg.sender, didUri, publicKeyHash);
    }

    function updateDid(string calldata newDidUri) external {
        DidDocument storage doc = dids[msg.sender];
        if (doc.createdAt == 0) revert DidNotFound();
        if (!doc.active) revert DidIsRevoked();

        doc.didUri = newDidUri;
        doc.updatedAt = block.timestamp;

        emit DidUpdated(msg.sender, newDidUri);
    }

    function revokeDid() external {
        DidDocument storage doc = dids[msg.sender];
        if (doc.createdAt == 0) revert DidNotFound();

        doc.active = false;
        doc.updatedAt = block.timestamp;

        emit DidRevoked(msg.sender);
    }

    function getDid(address owner) external view returns (DidDocument memory) {
        if (dids[owner].createdAt == 0) revert DidNotFound();
        return dids[owner];
    }

    function isActiveDid(address owner) external view returns (bool) {
        return dids[owner].active;
    }
}
