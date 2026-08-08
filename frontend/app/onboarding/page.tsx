"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useCreateDid } from "@/hooks/useDIDRegistry";
import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const steps = [
  { id: 1, title: "Connect Wallet",    desc: "Link your Web3 wallet to anchor your identity." },
  { id: 2, title: "Generate DID",      desc: "Create your Decentralized Identifier on-chain." },
  { id: 3, title: "Secure Keys",       desc: "Your private key never leaves your device." },
  { id: 4, title: "Identity Ready",    desc: "Start collecting and sharing credentials." },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { createDid, isConfirming } = useCreateDid();
  const router = useRouter();
  const { address, isConnected } = useAccount();

  async function handleCreateDid() {
    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }
    
    setLoading(true);
    try {
      await createDid();
      setCurrentStep(3);
      setTimeout(() => setCurrentStep(4), 1500);
    } catch (err) {
      console.error("Failed to create DID:", err);
      alert("Failed to create DID. Make sure you don't already have one.");
    } finally {
      setLoading(false);
    }
  }

  function handleConnectWallet() {
    if (isConnected) {
      setCurrentStep(2);
    }
  }

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4">
            <Shield className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-50">Create Your Identity</h1>
          <p className="text-slate-400 mt-2 text-sm">4 steps to sovereign identity</p>
        </div>

        {/* Stepper */}
        <div className="space-y-3 mb-8">
          {steps.map((step) => {
            const done = step.id < currentStep;
            const active = step.id === currentStep;
            return (
              <div
                key={step.id}
                className={`glow-card rounded-xl p-4 bg-surface-900 flex items-center gap-4 transition-all duration-300 ${
                  active ? "border-brand-500/50" : done ? "border-brand-500/20 opacity-70" : "opacity-40"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-brand-500 text-white" :
                  active ? "bg-brand-500/20 border border-brand-500 text-brand-400" :
                           "bg-surface-800 text-slate-600"
                }`}>
                  {done
                    ? <CheckCircle className="w-4 h-4" />
                    : <span className="text-xs font-bold">{step.id}</span>
                  }
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">{step.title}</div>
                  <div className="text-xs text-slate-500">{step.desc}</div>
                </div>
                {active && <ArrowRight className="w-4 h-4 text-brand-400 ml-auto animate-pulse" />}
              </div>
            );
          })}
        </div>

        {/* Action Area */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-center mb-4">
                <ConnectButton />
              </div>
              {isConnected && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-all"
                >
                  Continue to Step 2
                </button>
              )}
              <p className="text-center text-xs text-slate-500 mt-3">
                Works with MetaMask, WalletConnect, Coinbase Wallet
              </p>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={handleCreateDid}
                disabled={loading || isConfirming}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading || isConfirming
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating DID…</>
                  : <><Key className="w-4 h-4" /> Generate My DID</>
                }
              </button>
              <p className="text-center text-xs text-slate-500 mt-3">
                This creates a transaction on-chain. Gas fees apply.
              </p>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="text-brand-400 text-4xl mb-4">⚙️</div>
              <p className="text-slate-300">Processing your identity...</p>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-brand-400 text-5xl mb-4">✓</div>
              <p className="text-slate-300 mb-6">Your sovereign identity is live.</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-all"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
