import { useState }                                        from "react";
import { useWriteContract }                                from "wagmi";
import { generateAgeProof, generateCredentialProof }      from "@/lib/zkp/proofGenerator";
import { CONTRACT_ADDRESSES, ZK_VERIFIER_ABI }            from "@/lib/blockchain/contracts";
import type { Credential }                                 from "@/types";

export type BirthDateInput = {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
};

// ─────────────────────────────────────────────
//  Generate a ZK proof for a given credential
// ─────────────────────────────────────────────
import type { GeneratedProof } from "@/lib/zkp/proofGenerator";

export function useGenerateProof() {
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateProof(
    credential: Credential,
    proofType:  "age_above_18" | "age_above_21" | "credential_ownership",
    birthDate?: BirthDateInput
  ): Promise<GeneratedProof> {
    setIsGenerating(true);
    try {
      const now  = new Date();
      const salt = `0x${Math.floor(Math.random() * 1e15).toString(16).padStart(64, "0")}`;

      if (proofType === "age_above_18" || proofType === "age_above_21") {
        if (!birthDate) {
          throw new Error("Birth date is required for age proofs");
        }
        const result = await generateAgeProof({
          birth_year:    birthDate.birthYear,
          birth_month:   birthDate.birthMonth,
          birth_day:     birthDate.birthDay,
          salt,
          current_year:  now.getFullYear(),
          current_month: now.getMonth() + 1,
          age_threshold: proofType === "age_above_18" ? 18 : 21,
        });
        return result;

      } else {
        const result = await generateCredentialProof({
          credential_hash:      credential.hash,
          issuer_secret:        salt,
          owner_secret:         salt,
          salt,
          issuer_pub_hash:      credential.hash,
          credential_type_hash: `0x${Buffer.from(credential.type).toString("hex").padStart(64, "0")}`,
        });
        return result;
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return { generateProof, isGenerating };
}

// ─────────────────────────────────────────────
//  Submit proof on-chain via ZKVerifier contract
// ─────────────────────────────────────────────
export function useSubmitProof() {
  const { writeContractAsync, isPending } = useWriteContract();

  async function submitAgeProof(proof: Uint8Array, publicInputs: `0x${string}`[]) {
    return writeContractAsync({
      address:      CONTRACT_ADDRESSES.ZKVerifier as `0x${string}`,
      abi:          ZK_VERIFIER_ABI,
      functionName: "verifyAgeProof",
      args:         [`0x${Buffer.from(proof).toString("hex")}`, publicInputs],
    });
  }

  async function submitCredentialProof(proof: Uint8Array, publicInputs: `0x${string}`[]) {
    return writeContractAsync({
      address:      CONTRACT_ADDRESSES.ZKVerifier as `0x${string}`,
      abi:          ZK_VERIFIER_ABI,
      functionName: "verifyCredentialProof",
      args:         [`0x${Buffer.from(proof).toString("hex")}`, publicInputs],
    });
  }

  return { submitAgeProof, submitCredentialProof, isPending };
}
