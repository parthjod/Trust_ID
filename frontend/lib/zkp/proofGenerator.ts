/**
 * ZK Proof generation - Mock implementation
 * 
 * Since Nargo/Barretenberg compilation requires WSL or Linux,
 * this provides mock proof generation for testing the UI.
 */

import { ethers } from "ethers";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type AgeProofInputs = {
  birth_year: number;
  birth_month: number;
  birth_day: number;
  salt: string;
  current_year: number;
  current_month: number;
  age_threshold: number;
};

export type GeneratedProof = {
  proof: Uint8Array;
  publicInputs: string[];
  nullifier: string;
  proofLink: string;
  isMock?: boolean;
};

function generateMockProof(inputs: { salt: string; age_threshold?: number }): GeneratedProof {
  const nullifier = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256"],
      [inputs.salt, inputs.age_threshold ?? 18]
    )
  );
  
  const mockProof = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    mockProof[i] = Math.floor(Math.random() * 256);
  }
  
  const appUrl = getAppUrl();
  const proofHex = ethers.hexlify(mockProof);
  const proofLink = `${appUrl}/verify?proof=${proofHex}&nullifier=${nullifier}`;
  
  return {
    proof: mockProof,
    publicInputs: [nullifier],
    nullifier,
    proofLink,
    isMock: true,
  };
}

export async function generateAgeProof(inputs: AgeProofInputs): Promise<GeneratedProof> {
  console.log("Generating mock age proof (Nargo not available)");
  return generateMockProof(inputs);
}

export type CredentialProofInputs = {
  credential_hash: string;
  issuer_secret: string;
  owner_secret: string;
  salt: string;
  issuer_pub_hash: string;
  credential_type_hash: string;
};

export async function generateCredentialProof(
  inputs: CredentialProofInputs
): Promise<GeneratedProof> {
  console.log("Generating mock credential proof (Nargo not available)");
  return generateMockProof(inputs);
}

export async function verifyProofLocally(
  circuitName: string,
  proof: Uint8Array,
  publicInputs: string[]
): Promise<boolean> {
  return true;
}
