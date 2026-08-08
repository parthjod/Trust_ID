import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useAccount } from "wagmi";
import { CONTRACT_ADDRESSES, CREDENTIAL_REGISTRY_ABI } from "@/lib/blockchain/contracts";
import type { Credential } from "@/types";

import { useEffect, useState } from "react";

const getCredStorageKey = (address?: string) =>
  address ? `trustid_local_credentials_${address.toLowerCase()}` : "trustid_local_credentials";

function loadLocalCredentials(address?: string): Credential[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getCredStorageKey(address);
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { }
  return [];
}

function saveLocalCredentials(address: string | undefined, creds: Credential[]) {
  if (typeof window === "undefined") return;
  try {
    const key = getCredStorageKey(address);
    localStorage.setItem(key, JSON.stringify(creds));
  } catch { }
}

// ─────────────────────────────────────────────
//  Fetch all credential IDs for a subject, then
//  hydrate each one into a full Credential object
// ─────────────────────────────────────────────
export function useCredentials(address?: string) {
  const { data: ids, isLoading: loadingIds, refetch: refetchIds } = useReadContract({
    address: CONTRACT_ADDRESSES.CredentialRegistry as `0x${string}`,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: "getSubjectCredentials",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  const validIds = (ids as `0x${string}`[]) ?? [];

  const { data: allData, isLoading: loadingAll, refetch: refetchDetails } = useReadContracts({
    contracts: validIds.map(id => ({
      address: CONTRACT_ADDRESSES.CredentialRegistry as `0x${string}`,
      abi: CREDENTIAL_REGISTRY_ABI,
      functionName: "credentials",
      args: [id],
    })),
    query: { enabled: validIds.length > 0 },
  });

  const [localCreds, setLocalCreds] = useState<Credential[]>([]);

  useEffect(() => {
    setLocalCreds(loadLocalCredentials(address));
  }, [address]);

  const fetchedCredentials: Credential[] = validIds.map((id, index) => {
    const res = allData?.[index]?.result as any[] | undefined;
    if (!res) return null;
    return {
      id: id,
      type: res[3] || "VerifiableCredential",
      issuer: res[1],
      subject: res[2],
      hash: res[0],
      issuedAt: Number(res[4]) * 1000,
      expiresAt: Number(res[5]) * 1000,
      status: Number(res[6]) === 0 ? "active" : Number(res[6]) === 1 ? "revoked" : "expired",
    };
  }).filter(Boolean) as Credential[];

  // Update local storage whenever we fetch new on-chain data to ensure it stays in sync
  useEffect(() => {
    if (fetchedCredentials.length > 0) {
      saveLocalCredentials(address, fetchedCredentials);
      setLocalCreds(fetchedCredentials);
    }
  }, [JSON.stringify(fetchedCredentials), address]);

  const credentials = fetchedCredentials.length > 0 ? fetchedCredentials : localCreds;

  const refetch = async () => {
    await refetchIds();
    await refetchDetails();
  };

  return {
    credentials,
    isLoading: (loadingIds || loadingAll) && credentials.length === 0,
    refetch,
  };
}

// ─────────────────────────────────────────────
//  Write: issue a credential
// ─────────────────────────────────────────────
export function useIssueCredential() {
  const { writeContractAsync, data: txHash } = useWriteContract();
  const publicClient = usePublicClient();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  async function issueCredential(subject: string, credType: string) {
    if (!subject) return;
    const credHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CredentialRegistry as `0x${string}`,
      abi: CREDENTIAL_REGISTRY_ABI,
      functionName: "issueCredential",
      args: [subject as `0x${string}`, credType, credHash as `0x${string}`, BigInt(0)],
    });

    if (publicClient) {
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        throw new Error("Transaction reverted on-chain");
      }
    }

    return hash;
  }

  return { issueCredential, isConfirming, isSuccess };
}

// ─────────────────────────────────────────────
//  Write: revoke a credential
// ─────────────────────────────────────────────
export function useRevokeCredential() {
  const { writeContractAsync, data: txHash } = useWriteContract();
  const publicClient = usePublicClient();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  async function revokeCredential(credentialId: string) {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CredentialRegistry as `0x${string}`,
      abi: CREDENTIAL_REGISTRY_ABI,
      functionName: "revokeCredential",
      args: [credentialId as `0x${string}`],
    });

    if (publicClient) {
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        throw new Error("Transaction reverted on-chain");
      }
    }

    return hash;
  }

  return { revokeCredential, isConfirming, isSuccess };
}

// ─────────────────────────────────────────────
//  Read: verify a single credential
// ─────────────────────────────────────────────
export function useVerifyCredential(credentialId?: string) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.CredentialRegistry as `0x${string}`,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: "verifyCredential",
    args: credentialId ? [credentialId as `0x${string}`] : undefined,
    query: { enabled: !!credentialId },
  });

  return {
    isValid: data?.[0] as boolean | undefined,
    credential: data?.[1] as any,
    isLoading,
    error,
  };
}
