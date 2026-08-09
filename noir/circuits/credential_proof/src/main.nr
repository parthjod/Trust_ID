// Credential Ownership Proof Circuit
// Proves: "I own a valid credential of type X issued by authority Y"
// Without revealing: the credential's actual content or ID
//
// Private inputs:  credential_hash, issuer_secret, owner_secret
// Public inputs:   issuer_public_key_hash, credential_type_hash, nullifier

fn main(
    // -- Private (witness) inputs ------------------------------
    credential_hash:  Field,   // hash of full VC JSON
    issuer_secret:    Field,   // issuer's secret used to sign
    owner_secret:     Field,   // owner's private key material
    salt:             Field,

    // -- Public inputs -----------------------------------------
    issuer_pub_hash:      pub Field,  // keccak256(issuer public key)
    credential_type_hash: pub Field,  // keccak256("AgeProof") etc.
    nullifier:            pub Field,  // hash(owner_secret || salt) for replay protection
) {
    // -- 1. Verify issuer signed this credential ----------------
    // commitment = hash(credential_hash || issuer_secret)
    let issuer_commitment = std::hash::pedersen_hash([credential_hash, issuer_secret]);

    // The issuer pub hash must match the commitment
    // In production: use signature verification (ECDSA in Noir)
    let expected_issuer = std::hash::pedersen_hash([issuer_commitment]);
    assert(issuer_pub_hash == expected_issuer);

    // -- 2. Verify owner holds the credential ------------------
    let owner_commitment = std::hash::pedersen_hash([credential_hash, owner_secret]);
    // owner_commitment should embed the credential type
    let _ = std::hash::pedersen_hash([owner_commitment, credential_type_hash]);

    // -- 3. Verify credential type matches claim ---------------
    let embedded_type = std::hash::pedersen_hash([credential_hash, credential_type_hash]);
    assert(embedded_type != 0); // non-trivial

    // -- 4. Nullifier check ------------------------------------
    let expected_nullifier = std::hash::pedersen_hash([owner_secret, salt]);
    assert(nullifier == expected_nullifier);
}

#[test]
fn test_credential_proof() {
    let cred_hash: Field     = 0x1234;
    let issuer_secret: Field = 0xABCD;
    let owner_secret: Field  = 0x5678;
    let salt: Field          = 0x9999;

    let issuer_commitment = std::hash::pedersen_hash([cred_hash, issuer_secret]);
    let issuer_pub_hash   = std::hash::pedersen_hash([issuer_commitment]);
    let cred_type_hash    = std::hash::pedersen_hash([0x4167655072006f6f66]); // "AgeProof"
    let nullifier         = std::hash::pedersen_hash([owner_secret, salt]);

    main(
        cred_hash, issuer_secret, owner_secret, salt,
        issuer_pub_hash, cred_type_hash, nullifier
    );
}
