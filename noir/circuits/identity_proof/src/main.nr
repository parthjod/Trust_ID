// Identity Ownership Proof Circuit
// Proves: "I am the owner of DID X" (controls the private key)
// Without revealing: the private key itself
//
// This is used for DID authentication flows -- proving you control
// an identity without signing a transaction on-chain.

fn main(
    // -- Private inputs ----------------------------------------
    private_key:  Field,   // user's private key
    did_salt:     Field,   // per-session salt

    // -- Public inputs -----------------------------------------
    did_public_hash: pub Field,  // keccak256(public_key) registered on-chain
    session_nullifier: pub Field, // hash(private_key || did_salt || session_id)
    session_id:      pub Field,
) {
    // -- 1. Derive public key hash from private key -------------
    // In a real system, use ECDSA/Schnorr key derivation
    // Noir has std::ecdsa_secp256k1 for this
    let derived_pub_hash = std::hash::pedersen_hash([private_key]);
    assert(did_public_hash == derived_pub_hash);

    // -- 2. Verify session nullifier (prevents session replay) --
    let expected_nullifier = std::hash::pedersen_hash(
        [private_key, did_salt, session_id]
    );
    assert(session_nullifier == expected_nullifier);
}

#[test]
fn test_identity_proof() {
    let priv_key: Field = 0xDEAD;
    let salt: Field     = 0xBEEF;
    let session: Field  = 0x0001;

    let pub_hash   = std::hash::pedersen_hash([priv_key]);
    let nullifier  = std::hash::pedersen_hash([priv_key, salt, session]);

    main(priv_key, salt, pub_hash, nullifier, session);
}
