function getContractAddress(address: string | undefined, fallback: string, name: string): `0x${string}` {
  if (!address) {
    console.warn(`Contract address for ${name} not set, using fallback: ${fallback}`);
    return fallback as `0x${string}`;
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.warn(`Invalid address format: ${address}, using fallback: ${fallback}`);
    return fallback as `0x${string}`;
  }
  return address as `0x${string}`;
}

export const CONTRACT_ADDRESSES = {
  DIDRegistry: getContractAddress(
    process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS,
    "0x0000000000000000000000000000000000000000",
    "DIDRegistry"
  ),
  CredentialRegistry: getContractAddress(
    process.env.NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS,
    "0x0000000000000000000000000000000000000000",
    "CredentialRegistry"
  ),
  ZKVerifier: getContractAddress(
    process.env.NEXT_PUBLIC_ZK_VERIFIER_ADDRESS,
    "0x0000000000000000000000000000000000000000",
    "ZKVerifier"
  ),
} as const;

// ─────────────────────────────────────────────
//  DIDRegistry ABI (minimal)
// ─────────────────────────────────────────────
export const DID_REGISTRY_ABI = [
  {
    name: "createDid",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "didUri", type: "string" },
      { name: "publicKeyHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "getDid",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "didUri", type: "string" },
          { name: "publicKeyHash", type: "bytes32" },
          { name: "createdAt", type: "uint256" },
          { name: "updatedAt", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "isActiveDid",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "revokeDid",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "updateDid",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "newDidUri", type: "string" }],
    outputs: [],
  },
  {
    name: "DidCreated",
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "didUri", type: "string", indexed: false },
      { name: "publicKeyHash", type: "bytes32", indexed: false },
    ],
  },
] as const;

// ─────────────────────────────────────────────
//  CredentialRegistry ABI (minimal)
// ─────────────────────────────────────────────
export const CREDENTIAL_REGISTRY_ABI = [
  {
    name: "issueCredential",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "subject", type: "address" },
      { name: "credType", type: "string" },
      { name: "credHash", type: "bytes32" },
      { name: "expiresAt", type: "uint256" },
    ],
    outputs: [{ name: "credentialId", type: "bytes32" }],
  },
  {
    name: "verifyCredential",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "credentialId", type: "bytes32" }],
    outputs: [
      { name: "valid", type: "bool" },
      {
        name: "cred",
        type: "tuple",
        components: [
          { name: "credentialHash", type: "bytes32" },
          { name: "issuer", type: "address" },
          { name: "subject", type: "address" },
          { name: "credentialType", type: "string" },
          { name: "issuedAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
  },
  {
    name: "getSubjectCredentials",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "subject", type: "address" }],
    outputs: [{ type: "bytes32[]" }],
  },
  {
    name: "revokeCredential",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "credentialId", type: "bytes32" }],
    outputs: [],
  },
] as const;

// ─────────────────────────────────────────────
//  ZKVerifier ABI (minimal)
// ─────────────────────────────────────────────
export const ZK_VERIFIER_ABI = [
  {
    name: "verifyAgeProof",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proof", type: "bytes" },
      { name: "publicInputs", type: "bytes32[]" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "verifyCredentialProof",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proof", type: "bytes" },
      { name: "publicInputs", type: "bytes32[]" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "isProofValid",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "nullifier", type: "bytes32" }],
    outputs: [{ type: "bool" }],
  },
] as const;
