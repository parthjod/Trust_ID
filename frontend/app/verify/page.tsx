"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ScanLine, Link2, ShieldCheck, Code, Eye, Info } from "lucide-react";
import { useZKVerifier } from "@/hooks/useZKVerifier";

type VerifyState = "idle" | "loading" | "valid" | "invalid";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [proofInput, setProofInput] = useState("");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [extraData, setExtraData] = useState<{ claim?: string, msg?: string, proof?: string } | null>(null);
  const { verifyProof } = useZKVerifier();

  useEffect(() => {
    const proofParam = searchParams.get("proof");
    const nullifierParam = searchParams.get("nullifier");
    const claimParam = searchParams.get("claim");
    const msgParam = searchParams.get("msg");

    if (nullifierParam) {
      setProofInput(nullifierParam);
      setExtraData({
        claim: claimParam || undefined,
        msg: msgParam || undefined,
        proof: proofParam || undefined
      });
      // Auto-verify if nullifier is present in URL
      setTimeout(() => {
        handleVerify(nullifierParam);
      }, 500);
    }
  }, [searchParams]);

  async function handleVerify(overrideInput?: string) {
    const input = overrideInput || proofInput;
    if (!input.trim()) return;
    setVerifyState("loading");
    try {
      const res = await verifyProof(input.trim());
      setResult(res);
      setVerifyState(res.valid === "true" ? "valid" : "invalid");
    } catch {
      setVerifyState("invalid");
    }
  }

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4">
            <ScanLine className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-50">Verify a Proof</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Paste a proof link or nullifier to verify on-chain — no personal data exchanged.
          </p>
        </div>

        <div className="glow-card rounded-2xl bg-surface-900 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Proof Link or Nullifier Hash
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={proofInput}
                onChange={(e) => setProofInput(e.target.value)}
                placeholder="trustid://proof/0x... or paste nullifier"
                className="flex-1 bg-surface-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 font-mono"
              />
              <button
                onClick={() => handleVerify()}
                disabled={!proofInput || verifyState === "loading"}
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center gap-2"
              >
                {verifyState === "loading"
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Link2 className="w-4 h-4" />
                }
                Verify
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex-1 h-px bg-slate-800" />
            or scan QR
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* QR scanner placeholder */}
          <div className="h-48 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-600 hover:border-brand-500/30 transition-colors cursor-pointer">
            <ScanLine className="w-8 h-8" />
            <span className="text-xs">Click to open camera scanner</span>
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {verifyState !== "idle" && verifyState !== "loading" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 rounded-2xl border overflow-hidden ${verifyState === "valid"
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-red-500/5 border-red-500/20"
                }`}
            >
              {verifyState === "valid" ? (
                <div className="p-0">
                  <div className="bg-green-500/10 px-6 py-4 border-b border-green-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-bold text-sm uppercase tracking-wider">Trusted & Verified</span>
                    </div>
                    <div className="text-[10px] font-mono text-green-500/60 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                      On-chain Proof
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-slate-100">{extraData?.claim || "Proof Verified"}</h2>
                      <p className="text-green-400 font-medium">{extraData?.msg || "The cryptographic proof is valid and verified on the blockchain."}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-surface-950/50 rounded-xl p-4 border border-slate-800/50">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Info className="w-3 h-3" /> Verification Details
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Network</span>
                            <span className="text-slate-200 font-medium">{result?.network}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Timestamp</span>
                            <span className="text-slate-200 font-medium">{result?.verifiedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-surface-950/50 rounded-xl p-4 border border-slate-800/50">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Nullifier Hash</div>
                        <div className="text-xs font-mono text-brand-400 break-all">{result?.nullifier}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowJson(!showJson)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all border border-slate-800"
                    >
                      {showJson ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                      {showJson ? "Hide Raw Data" : "View Raw JSON"}
                    </button>

                    <AnimatePresence>
                      {showJson && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <pre className="p-4 bg-black rounded-xl text-[10px] text-brand-500/80 font-mono overflow-x-auto border border-brand-500/20">
                            {JSON.stringify({
                              proof: extraData?.proof || "0x...",
                              nullifier: result?.nullifier,
                              claim: extraData?.claim,
                              message: extraData?.msg,
                              onChain: true,
                              network: result?.network,
                              timestamp: result?.verifiedAt
                            }, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Verification Failed</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      The cryptographic proof could not be verified. It may have expired or been tampered with.
                    </p>
                  </div>
                  <button
                    onClick={() => setVerifyState("idle")}
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    Try again
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen grid-bg flex items-center justify-center px-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}
