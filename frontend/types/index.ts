// ─────────────────────────────────────────────
//  Core Domain Types
// ─────────────────────────────────────────────

export type CredentialStatus = "active" | "revoked" | "expired";

export interface Credential {
  id:        string;   // bytes32 on-chain ID
  type:      string;   // "AgeProof" | "Citizenship" | "Degree" | ...
  issuer:    string;   // issuer address or friendly name
  subject:   string;   // holder address
  hash:      string;   // bytes32 keccak256 of full VC JSON
  issuedAt:  number;   // unix ms
  expiresAt: number;   // unix ms, 0 = never
  status:    CredentialStatus;
  metadata?: Record<string, string>; // off-chain IPFS metadata (encrypted)
}

export interface DIDDocument {
  owner:         string;
  didURI:        string;
  publicKeyHash: string;
  createdAt:     bigint;
  updatedAt:     bigint;
  active:        boolean;
}

// ─────────────────────────────────────────────
//  ZK Proof Types
// ─────────────────────────────────────────────

export type ProofType =
  | "age_above_18"
  | "age_above_21"
  | "citizenship"
  | "credential_ownership"
  | "custom";

export interface ZKProof {
  type:        ProofType;
  proof:       Uint8Array;
  publicInputs: string[];
  nullifier:   string;
  proofLink:   string;
  generatedAt: number;
  expiresAt:   number;  // proofs expire after 24h for QR sharing
}

export interface ProofVerificationResult {
  valid:      boolean;
  nullifier:  string;
  proofType?: ProofType;
  prover?:    string;
  verifiedAt?: string;
  network:    string;
}

// ─────────────────────────────────────────────
//  Activity / Audit Log
// ─────────────────────────────────────────────

export type ActivityType =
  | "did_created"
  | "credential_added"
  | "credential_revoked"
  | "proof_shared"
  | "proof_verified"
  | "alert";

export interface ActivityEvent {
  id:        string;
  type:      ActivityType;
  label:     string;
  detail:    string;
  timestamp: number;
  txHash?:   string;
}

// ─────────────────────────────────────────────
//  Issuer
// ─────────────────────────────────────────────

export interface Issuer {
  address:  string;
  name:     string;
  logoUrl?: string;
  verified: boolean;
}
