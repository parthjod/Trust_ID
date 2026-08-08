"use client";

import { useState } from "react";
import { Shield, GraduationCap, Globe, User, Share2, Trash2, Eye, EyeOff } from "lucide-react";
import type { Credential } from "@/types";

const ICONS: Record<string, React.ElementType> = {
  AgeProof: Shield,
  Citizenship: Globe,
  Degree: GraduationCap,
  default: Shield,
};

export function CredentialCard({
  credential,
  onShare,
  onRevoke,
  isRevoking,
}: {
  credential: Credential;
  onShare?: () => void;
  onRevoke?: () => void;
  isRevoking?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const Icon = ICONS[credential.type] ?? ICONS.default;

  return (
    <div className="rounded-2xl bg-[#0a121d] p-6 border border-slate-800/60 relative overflow-hidden group w-full">
      {/* Top Row: Icon, Title, Date and Status */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#111927] border border-slate-800 flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#14b8a6]" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-xl tracking-tight">{credential.type}</div>
            <div className="text-sm text-slate-500 mt-1">
              issued - {new Date(credential.issuedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          credential.status === "active"
            ? "bg-[#064e3b]/30 text-[#10b981] border border-[#10b981]/20"
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {credential.status}
        </span>
      </div>

      {/* Hash/Dots Box */}
      <div className="mb-6 p-4 rounded-xl bg-[#060b13] border border-slate-800/60 font-mono text-sm text-slate-400 break-all min-h-[56px] flex items-center tracking-[0.2em]">
        {revealed ? credential.hash : "................................................................"}
      </div>

      {/* Bottom Row: Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-600 hover:bg-slate-800/30 transition-all"
          >
            {revealed ? <><EyeOff className="w-4 h-4" /> Hide Hash</> : <><Eye className="w-4 h-4" /> Reveal Hash</>}
          </button>

          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#10b981] border border-[#10b981]/30 hover:border-[#10b981]/60 hover:bg-[#10b981]/5 transition-all"
            >
              <Share2 className="w-4 h-4" /> Generate ZK Proof
            </button>
          )}
        </div>

        {onRevoke && (
          <button
            onClick={onRevoke}
            disabled={isRevoking}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#ef4444] border border-[#ef4444]/20 hover:border-[#ef4444]/40 hover:bg-[#ef4444]/5 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> {isRevoking ? "Revoking..." : "Revoke"}
          </button>
        )}
      </div>
    </div>
  );
}
