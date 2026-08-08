import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, DID_REGISTRY_ABI } from "@/lib/blockchain/contracts";

export function useDID(address?: string) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.DIDRegistry as `0x${string}`,
    abi: DID_REGISTRY_ABI,
    functionName: "getDid",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  return {
    did: data as any,
    isLoading,
    error,
  };
}

export function useCreateDid() {
  const { address } = useAccount();
  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  async function createDid() {
    if (!address) throw new Error("Wallet not connected");

    const didUri = `did:trustid:${address.toLowerCase()}`;
    const publicKeyHash = ethers.keccak256(ethers.toUtf8Bytes(address));

    await writeContractAsync({
      address: CONTRACT_ADDRESSES.DIDRegistry as `0x${string}`,
      abi: DID_REGISTRY_ABI,
      functionName: "createDid",
      args: [didUri, publicKeyHash as `0x${string}`],
    });
  }

  return { createDid, isConfirming, isSuccess };
}

export function useRevokeDid() {
  const { writeContractAsync } = useWriteContract();

  async function revokeDid() {
    await writeContractAsync({
      address: CONTRACT_ADDRESSES.DIDRegistry as `0x${string}`,
      abi: DID_REGISTRY_ABI,
      functionName: "revokeDid",
      args: [],
    });
  }

  return { revokeDid };
}
