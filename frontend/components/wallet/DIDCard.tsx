"use client";

import { Shield, Copy, ExternalLink } from "lucide-react";
import { useDID } from "@/hooks/useDIDRegistry";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export function DIDCard({ address }: { address?: string }) {
  const { did, isLoading } = useDID(address);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyDID = () => {
    if (did?.didUri) {
      navigator.clipboard.writeText(did.didUri);
      toast.success("DID copied!");
    }
  };

  if (isLoading && !did) {
    return <div className="h-28 rounded-2xl bg-surface-900/60 animate-pulse" />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-900 to-surface-950 border border-brand-500/20 p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-500 blur-3xl" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
            <Shield className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Decentralized Identifier
            </div>
            <div className="font-mono text-sm text-slate-200 truncate max-w-xs">
              {did?.didUri ?? `did:trustid:${address?.toLowerCase()}`}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-slate-500">
                Active ·{" "}
                Created {did?.createdAt
                  ? new Date(Number(did.createdAt) * 1000).toLocaleDateString()
                  : mounted
                    ? new Date().toLocaleDateString()
                    : "—"
                }
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={copyDID}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={process.env.NEXT_PUBLIC_ETHERSCAN_URL 
              ? `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${address}`
              : `https://sepolia.etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
