"use client";

import { useEffect, useState } from "react";
import { Shield, Plus, QrCode, Clock, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCredentials, useRevokeCredential } from "@/hooks/useCredentials";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { ActivityLog } from "@/components/credentials/ActivityLog";
import { DIDCard } from "@/components/wallet/DIDCard";
import { ShareProofModal } from "@/components/zkp/ShareProofModal";
import type { ActivityEvent, Credential } from "@/types";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const getStorageKey = (address?: string) => `trustid_activity_events_${address?.toLowerCase() || "anon"}`;
const getSimulatedCredsKey = (address?: string) => `trustid_simulated_creds_${address?.toLowerCase() || "anon"}`;

function loadActivityEvents(address?: string): ActivityEvent[] {
  if (typeof window === "undefined" || !address) return [];
  try {
    const stored = localStorage.getItem(getStorageKey(address));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
  }
  return [];
}

function saveActivityEvents(address: string | undefined, events: ActivityEvent[]) {
  if (typeof window === "undefined" || !address) return;
  try {
    localStorage.setItem(getStorageKey(address), JSON.stringify(events));
  } catch {
  }
}

function loadSimulatedCredentials(address?: string): Credential[] {
  if (typeof window === "undefined" || !address) return [];
  try {
    const stored = localStorage.getItem(getSimulatedCredsKey(address));
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveSimulatedCredentials(address: string | undefined, creds: Credential[]) {
  if (typeof window === "undefined" || !address) return;
  try {
    localStorage.setItem(getSimulatedCredsKey(address), JSON.stringify(creds));
  } catch {}
}

export default function DashboardPage() {
  const { address } = useAccount();
  const { credentials: onChainCredentials, isLoading: isOnChainLoading, refetch } = useCredentials(address);
  const { revokeCredential } = useRevokeCredential();
  
  const [simulatedCredentials, setSimulatedCredentials] = useState<Credential[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [credHashInput, setCredHashInput] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  
  const [selectedForProof, setSelectedForProof] = useState<Credential | null>(null);

  useEffect(() => {
    if (address) {
      setActivityEvents(loadActivityEvents(address));
      setSimulatedCredentials(loadSimulatedCredentials(address));
    } else {
      setActivityEvents([]);
      setSimulatedCredentials([]);
    }
  }, [address]);

  const allCredentials = [...simulatedCredentials, ...onChainCredentials];
  const isLoading = isOnChainLoading;

  const proofsShared = activityEvents.filter(e => e.type === "proof_shared").length;

  async function handleRevoke(credential: Credential) {
    if (!confirm("Are you sure you want to revoke this credential?")) return;
    setRevokingId(credential.id);

    // If it's a simulated credential, just remove it from local storage
    const isSimulated = simulatedCredentials.some(c => c.id === credential.id);
    
    if (isSimulated) {
      const updated = simulatedCredentials.filter(c => c.id !== credential.id);
      saveSimulatedCredentials(address, updated);
      setSimulatedCredentials(updated);
      toast.success("Credential deleted");
      setRevokingId(null);
      return;
    }

    const toastId = toast.loading("Revoking on-chain...");
    try {
      await revokeCredential(credential.id);

      const events = loadActivityEvents(address);
      events.unshift({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: "credential_revoked",
        label: "Credential revoked",
        detail: credential.type,
      });
      const trimmed = events.slice(0, 100);
      saveActivityEvents(address, trimmed);
      setActivityEvents(trimmed);

      await new Promise((resolve) => setTimeout(resolve, 2000));
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

  async function handleRequestCredential() {
    if (!credHashInput.trim()) {
      toast.error("Please enter a credential hash");
      return;
    }

    setIsRequesting(true);
    try {
      let type = "VerifiableCredential";
      const lastChar = credHashInput.trim().toLowerCase().slice(-1);
      
      if (lastChar === "a") type = "AgeProof";
      else if (lastChar === "c") type = "Citizenship";
      else if (lastChar === "d") type = "Degree";
      else {
        toast.error("Hash must end with 'a', 'c', or 'd'");
        setIsRequesting(false);
        return;
      }

      const newCred: Credential = {
        id: `sim-${Date.now()}`,
        type,
        issuer: "Simulated Issuer",
        subject: address || "0x0",
        hash: credHashInput.trim(),
        issuedAt: Date.now(),
        expiresAt: 0,
        status: "active",
      };

      const updated = [newCred, ...simulatedCredentials];
      saveSimulatedCredentials(address, updated);
      setSimulatedCredentials(updated);

      const events = loadActivityEvents(address);
      events.unshift({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: "credential_added",
        label: "Credential Added",
        detail: type,
      });
      saveActivityEvents(address, events.slice(0, 100));
      setActivityEvents(events.slice(0, 100));

      toast.success(`${type} generated successfully!`);
      setShowRequestModal(false);
      setCredHashInput("");
    } finally {
      setIsRequesting(false);
    }
  }

  const stats = [
    { label: "Credentials", value: allCredentials.length, icon: Shield, color: "text-brand-400" },
    { label: "Proofs Shared", value: proofsShared, icon: CheckCircle, color: "text-green-400" },
  ];

  return (
    <main className="min-h-screen grid-bg">
      {/* Top bar */}
      <header className="border-b border-brand-500/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-brand-400" />
          </div>
          <span className="font-semibold text-slate-100">TrustID</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/verify"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:border-brand-500/40 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" /> Verify
          </Link>
          <ConnectButton showBalance={false} chainStatus="none" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* DID Card */}
        <DIDCard address={address} />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glow-card rounded-xl p-6 bg-surface-900">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className="text-3xl font-bold text-slate-100">{s.value}</div>
              <div className="text-sm text-slate-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Credentials */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              My Credentials
            </h2>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              <Plus className="w-3 h-3" /> Request New
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-surface-900/60 animate-pulse" />
              ))}
            </div>
          ) : allCredentials.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {allCredentials.map((cred) => (
                <CredentialCard
                  key={cred.id}
                  credential={cred}
                  onShare={() => setSelectedForProof(cred)}
                  onRevoke={() => handleRevoke(cred)}
                  isRevoking={revokingId === cred.id}
                />
              ))}
            </div>
          ) : (
            <div className="glow-card rounded-xl p-8 bg-surface-900 text-center">
              <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No credentials yet.</p>
              <p className="text-slate-600 text-xs mt-1">
                Request credentials from an authorized issuer.
              </p>
            </div>
          )}
        </section>

        {/* Activity */}
        <ActivityLog events={activityEvents} />
      </div>

      {/* Request New Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glow-card rounded-2xl bg-surface-900 p-6 border border-brand-500/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-100">Request New Credential</h3>
                <button onClick={() => setShowRequestModal(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
                    Credential Hash
                  </label>
                  <input
                    type="text"
                    value={credHashInput}
                    onChange={(e) => setCredHashInput(e.target.value)}
                    placeholder="Enter credential hash"
                    className="w-full bg-surface-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 italic">
                    Tip: End with 'a' for Age, 'c' for Citizenship, or 'd' for Degree.
                  </p>
                </div>

                <button
                  onClick={handleRequestCredential}
                  disabled={isRequesting || !credHashInput.trim()}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Request Credential
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ZK Proof Modal */}
      {selectedForProof && (
        <ShareProofModal
          credential={selectedForProof}
          onClose={() => setSelectedForProof(null)}
          onProofGenerated={(link) => {
             const events = loadActivityEvents(address);
             events.unshift({
               id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
               timestamp: Date.now(),
               type: "proof_shared",
               label: "ZK Proof generated",
               detail: selectedForProof.type,
             });
             saveActivityEvents(address, events.slice(0, 100));
             setActivityEvents(events.slice(0, 100));
          }}
          autoGenerate={true}
        />
      )}
    </main>
  );
}
