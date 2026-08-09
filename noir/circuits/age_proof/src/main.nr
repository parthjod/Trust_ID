// Age Proof Circuit
// Proves: "I am older than AGE_THRESHOLD"
// Without revealing: the user's actual date of birth
//
// Private inputs:  birth_year, birth_month, birth_day, salt
// Public inputs:   current_year, current_month, age_threshold, nullifier_hash

// -----------------------------------------------------------------------------
// How it works:
//   1. Compute age from (birth_year, birth_month) vs (current_year, current_month)
//   2. Assert age >= age_threshold
//   3. Emit a nullifier = hash(salt || threshold) so verifier knows this proof
//      can only be used once (replay protection)
// -----------------------------------------------------------------------------

fn compute_age(
    birth_year: u32,
    birth_month: u32,
    current_year: u32,
    current_month: u32,
) -> u32 {
    let mut age = current_year - birth_year;
    // If birthday hasn't happened yet this year, subtract 1
    if current_month < birth_month {
        age = age - 1;
    }
    age
}

fn main(
    // -- Private (witness) inputs ------------------------------
    birth_year:  u32,       // e.g. 1995
    birth_month: u32,       // 1-12
    birth_day:   u32,       // 1-31 (for future day-level precision)
    salt:        Field,     // random salt for nullifier

    // -- Public inputs -----------------------------------------
    current_year:   pub u32,    // from trusted oracle / block timestamp
    current_month:  pub u32,
    age_threshold:  pub u32,    // e.g. 18 or 21
    nullifier_hash: pub Field,  // pedersen(salt, age_threshold) -- for replay protection
) {
    // -- 1. Validate inputs ------------------------------------
    assert(birth_month >= 1);
    assert(birth_month <= 12);
    assert(birth_day >= 1);
    assert(birth_day <= 31);
    assert(current_month >= 1);
    assert(current_month <= 12);
    assert(birth_year <= current_year); // sanity check

    // -- 2. Compute age ----------------------------------------
    let age = compute_age(birth_year, birth_month, current_year, current_month);

    // -- 3. Core ZKP claim: age >= threshold -------------------
    assert(age >= age_threshold);

    // -- 4. Verify nullifier (prevents replay) -----------------
    // nullifier = hash(salt || age_threshold)
    let expected_nullifier = std::hash::pedersen_hash(
        [salt, age_threshold as Field]
    );
    assert(nullifier_hash == expected_nullifier);
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------
#[test]
fn test_age_above_18() {
    // Born 1990, currently 2025 => age = 35 >= 18 ok
    let salt: Field = 42;
    let threshold: u32 = 18;
    let nullifier = std::hash::pedersen_hash([salt, threshold as Field]);

    main(
        1990, 5, 15, salt,   // private: born May 15, 1990
        2025, 8,             // public:  current Aug 2025
        threshold,           // public:  threshold = 18
        nullifier,           // public:  nullifier
    );
}

#[test]
fn test_age_exactly_at_threshold() {
    // Born 2007-08, currently 2025-08 => age = 18 >= 18 ok
    let salt: Field = 99;
    let threshold: u32 = 18;
    let nullifier = std::hash::pedersen_hash([salt, threshold as Field]);

    main(
        2007, 8, 1, salt,
        2025, 8,
        threshold,
        nullifier,
    );
}
