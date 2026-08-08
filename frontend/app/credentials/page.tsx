"use client";

import { useState } from "react";
import { Shield, Download, Share2, Trash2, Eye, EyeOff, Plus, X, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useCredentials, useRevokeCredential, useIssueCredential } from "@/hooks/useCredentials";
import { ShareProofModal } from "@/components/zkp/ShareProofModal";
import type { Credential, ActivityEvent } from "@/types";
import toast from "react-hot-toast";

const STORAGE_KEY = "trustid_activity_events";

function addActivityEvent(event: Omit<ActivityEvent, "id" | "timestamp">) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const events: ActivityEvent[] = stored ? JSON.parse(stored) : [];
    events.unshift({
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    });
    const trimmed = events.slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
  }
}

export default function CredentialsPage() {
  const { address } = useAccount();
  const { credentials, refetch } = useCredentials(address);
  const { revokeCredential } = useRevokeCredential();
  const { issueCredential } = useIssueCredential();

  const [selected, setSelected] = useState<Credential | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCredType, setNewCredType] = useState("AgeProof");
  const [isProcessing, setIsProcessing] = useState(false);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleAddCredential() {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }
    const toastId = toast.loading("Issuing credential on-chain...");
    setIsProcessing(true);
    try {
      await issueCredential(address, newCredType);

      addActivityEvent({
        type: "credential_added",
        label: "Credential Issued",
        detail: newCredType,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for network
      await refetch();

      toast.dismiss(toastId);
      toast.success("Credential Issued successfully!");
      setShowAdd(false);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to issue. Did you create your DID first?");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRevoke(credential: Credential) {
    if (!confirm("Are you sure you want to revoke this credential?")) return;
    setRevokingId(credential.id);
    const toastId = toast.loading("Revoking on-chain...");
    try {
      await revokeCredential(credential.id);
      addActivityEvent({
        type: "credential_revoked",
        label: "Credential revoked",
        detail: credential.type,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // allow RPC propagation
      await refetch();

      toast.dismiss(toastId);
      toast.success("Credential revoked");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to revoke credential");
      console.error(err);
    } finally {
      setRevokingId(null);
    }
  }

  function handleProofGenerated(proofLink: string, credentialType: string) {
    addActivityEvent({
      type: "proof_shared",
      label: "ZK Proof generated",
      detail: credentialType,
    });
  }

  return (
    <main className="min-h-screen grid-bg max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Credentials</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your verifiable credentials and generate ZK proofs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Credential
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs">
            <Shield className="w-3 h-3" />
            {credentials?.length ?? 0} credentials
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="glow-card rounded-xl bg-surface-900 p-5 mb-6 border border-brand-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Issue New Credential</h3>
            <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Credential Type</label>
              <select
                value={newCredType}
                onChange={e => setNewCredType(e.target.value)}
                className="w-full bg-surface-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50"
              >
                <option value="AgeProof">Age Proof (Age &gt;= 18)</option>
                <option value="Citizenship">Citizenship Proof</option>
                <option value="Degree">University Degree</option>
              </select>
            </div>
            <button
              onClick={handleAddCredential}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Issue on-chain
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(credentials ?? []).map((cred) => (
          <div key={cred.id} className="glow-card rounded-xl bg-surface-900 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-sm">{cred.type}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    issued - {new Date(cred.issuedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cred.status === "active"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                {cred.status}
              </span>
            </div>

            {/* Credential hash (hidden by default) */}
            <div className="mt-4 p-3 rounded-lg bg-surface-950 border border-slate-800 font-mono text-xs text-slate-500">
              {revealedId === cred.id
                ? cred.hash
                : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
              }
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setRevealedId(revealedId === cred.id ? null : cred.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                {revealedId === cred.id
                  ? <><EyeOff className="w-3 h-3" /> Hide</>
                  : <><Eye className="w-3 h-3" /> Reveal Hash</>
                }
              </button>

              <button
                onClick={() => { setSelected(cred); setShowShare(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-brand-400 border border-brand-500/30 hover:border-brand-500/60 transition-colors"
              >
                <Share2 className="w-3 h-3" /> Generate ZK Proof
              </button>


              <button
                onClick={() => handleRevoke(cred)}
                disabled={revokingId === cred.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors ml-auto disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" /> {revokingId === cred.id ? "Revoking..." : "Revoke"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showShare && selected && (
        <ShareProofModal
          credential={selected}
          onClose={() => setShowShare(false)}
          onProofGenerated={(link) => handleProofGenerated(link, selected.type)}
        />
      )}
    </main>
  );
}
