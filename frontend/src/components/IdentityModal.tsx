import { X, Shield, Lock, FileCheck, Cpu, CheckCircle2 } from 'lucide-react';

export type ModalType = 'create' | 'verify' | 'get-started' | 'noir-info' | null;

interface IdentityModalProps {
  modalType: ModalType;
  onClose: () => void;
}

export const IdentityModal: React.FC<IdentityModalProps> = ({ modalType, onClose }) => {
  if (!modalType) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {modalType === 'create' && (
          <>
            <div className="modal-header">
              <span className="modal-badge">SOVEREIGN WALLET</span>
              <h3 className="modal-title">Create ZK Identity</h3>
              <p className="modal-desc">
                Generate a cryptographic zero-knowledge proof of your credentials without revealing raw PII data.
              </p>
            </div>

            <div className="modal-body">
              <div className="demo-step">
                <div className="step-icon">
                  <Lock size={18} />
                </div>
                <div className="step-text">
                  <h4>1. Encrypted Storage</h4>
                  <p>Credentials stored locally in your enclave with AES-256 GCM.</p>
                </div>
              </div>

              <div className="demo-step">
                <div className="step-icon">
                  <Cpu size={18} />
                </div>
                <div className="step-text">
                  <h4>2. Noir Circuit Prover</h4>
                  <p>Generates UltraPlonk zero-knowledge proofs client-side in &lt; 400ms.</p>
                </div>
              </div>

              <div className="demo-step">
                <div className="step-icon">
                  <FileCheck size={18} />
                </div>
                <div className="step-text">
                  <h4>3. Verifiable Attestation</h4>
                  <p>Export single-use proof tokens for instant verification anywhere.</p>
                </div>
              </div>
            </div>

            <button className="modal-action-btn" onClick={onClose}>
              Generate Mock Proof Enclave
            </button>
          </>
        )}

        {modalType === 'verify' && (
          <>
            <div className="modal-header">
              <span className="modal-badge">ON-CHAIN VERIFIER</span>
              <h3 className="modal-title">Verify Zero-Knowledge Proof</h3>
              <p className="modal-desc">
                Cryptographically validate any TrustID ZK proof hash against smart contract verifiers.
              </p>
            </div>

            <div className="modal-body">
              <div className="demo-step">
                <div className="step-icon">
                  <Shield size={18} />
                </div>
                <div className="step-text">
                  <h4>Zero Data Leakage</h4>
                  <p>Confirms validity (age &gt; 21, citizenship, accredited status) without disclosing identity details.</p>
                </div>
              </div>

              <div className="demo-step">
                <div className="step-icon">
                  <CheckCircle2 size={18} />
                </div>
                <div className="step-text">
                  <h4>Instant Verification</h4>
                  <p>Deterministic verification time: 100% mathematical certainty.</p>
                </div>
              </div>
            </div>

            <button className="modal-action-btn" onClick={onClose}>
              Start Proof Verifier Demo
            </button>
          </>
        )}

        {modalType === 'get-started' && (
          <>
            <div className="modal-header">
              <span className="modal-badge">GET STARTED</span>
              <h3 className="modal-title">Welcome to TrustID</h3>
              <p className="modal-desc">
                Your sovereign digital identity wallet is ready for setup. Select your preferred environment to begin.
              </p>
            </div>

            <div className="modal-body">
              <div className="demo-step">
                <div className="step-icon">
                  <Shield size={18} />
                </div>
                <div className="step-text">
                  <h4>Browser Extension / Web App</h4>
                  <p>Seamlessly authenticate across Web2 & Web3 platforms.</p>
                </div>
              </div>
            </div>

            <button className="modal-action-btn" onClick={onClose}>
              Launch Demo Wallet
            </button>
          </>
        )}

        {modalType === 'noir-info' && (
          <>
            <div className="modal-header">
              <span className="modal-badge">ZK STACK</span>
              <h3 className="modal-title">Powered by Noir & ZK-SNARKs</h3>
              <p className="modal-desc">
                Noir is a Domain Specific Language for zero-knowledge proofs created by Aztec Labs, enabling privacy-first web applications.
              </p>
            </div>

            <div className="modal-body">
              <div className="demo-step">
                <div className="step-icon">
                  <Cpu size={18} />
                </div>
                <div className="step-text">
                  <h4>UltraPlonk Backend</h4>
                  <p>State-of-the-art proving system with succint proof sizes and ultra-fast verification.</p>
                </div>
              </div>
            </div>

            <button className="modal-action-btn" onClick={onClose}>
              Got It
            </button>
          </>
        )}
      </div>
    </div>
  );
};
