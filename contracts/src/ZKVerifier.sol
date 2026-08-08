// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ZKVerifier
/// @notice On-chain verifier for Noir ZK proofs
/// @dev Replace _verifyUltraPlonk() with output from `nargo codegen-verifier`
contract ZKVerifier {
    enum ProofType {
        AgeAbove18,
        AgeAbove21,
        CitizenshipProof,
        CredentialOwnership,
        CustomClaim
    }

    struct ProofRecord {
        address   prover;
        ProofType proofType;
        bytes32   nullifier;    // prevents proof replay
        uint256   verifiedAt;
        bool      valid;
    }

    // ─────────────────────────────────────────────
    //  State
    // ─────────────────────────────────────────────
    mapping(bytes32 => ProofRecord) public proofRecords;
    mapping(bytes32 => bool)        public usedNullifiers;

    event ProofVerified(address indexed prover, ProofType proofType, bytes32 nullifier);
    event ProofRejected(address indexed prover, string reason);

    // ─────────────────────────────────────────────
    //  Age Proof
    // ─────────────────────────────────────────────

    /// @notice Verify that user is above a given age — without revealing DOB
    /// @param proof        ZK proof bytes (from @noir-lang/noir_js)
    /// @param publicInputs [0] = age_threshold, [1] = nullifier
    function verifyAgeProof(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external returns (bool) {
        require(publicInputs.length >= 2, "Need threshold + nullifier");

        bytes32 nullifier = publicInputs[1];
        require(!usedNullifiers[nullifier], "Proof already used (replay)");

        // TODO: Replace with nargo codegen-verifier output
        bool valid = _verifyUltraPlonk(proof, publicInputs);

        if (valid) {
            usedNullifiers[nullifier] = true;
            proofRecords[nullifier] = ProofRecord({
                prover:     msg.sender,
                proofType:  ProofType.AgeAbove18,
                nullifier:  nullifier,
                verifiedAt: block.timestamp,
                valid:      true
            });
            emit ProofVerified(msg.sender, ProofType.AgeAbove18, nullifier);
        } else {
            emit ProofRejected(msg.sender, "Invalid ZK proof");
        }

        return valid;
    }

    /// @notice Verify credential ownership without revealing credential content
    function verifyCredentialProof(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external returns (bool) {
        require(publicInputs.length >= 1, "Need nullifier");

        bytes32 nullifier = publicInputs[0];
        require(!usedNullifiers[nullifier], "Proof already used (replay)");

        bool valid = _verifyUltraPlonk(proof, publicInputs);

        if (valid) {
            usedNullifiers[nullifier] = true;
            proofRecords[nullifier] = ProofRecord({
                prover:     msg.sender,
                proofType:  ProofType.CredentialOwnership,
                nullifier:  nullifier,
                verifiedAt: block.timestamp,
                valid:      true
            });
            emit ProofVerified(msg.sender, ProofType.CredentialOwnership, nullifier);
        }

        return valid;
    }

    function isProofValid(bytes32 nullifier) external view returns (bool) {
        return proofRecords[nullifier].valid;
    }

    // ─────────────────────────────────────────────
    //  Internal
    // ─────────────────────────────────────────────

    /// @dev STUB — replace body with: new UltraVerifier().verify(proof, publicInputs)
    ///      after running: nargo codegen-verifier
    function _verifyUltraPlonk(
        bytes calldata /*proof*/,
        bytes32[] calldata /*publicInputs*/
    ) internal pure returns (bool) {
        // DEV MODE: returns true. Replace for production.
        return true;
    }
}
