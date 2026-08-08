import { ChevronRight, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onCreateIdentityClick: () => void;
  onVerifyProofClick: () => void;
  onPillClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onCreateIdentityClick,
  onVerifyProofClick,
  onPillClick,
}) => {
  return (
    <main className="hero-container">
      {/* Pill Badge */}
      <button className="hero-pill" onClick={onPillClick}>
        <span className="pill-dot"></span>
        <span>Powered by Zero-Knowledge Proofs & Noir</span>
      </button>

      {/* Main Title Heading */}
      <h1 className="hero-title">
        <span className="white-line">Prove who you are.</span>
        <span className="teal-line">Share nothing more.</span>
      </h1>

      {/* Hero Subtitle Description */}
      <p className="hero-description">
        TrustID is a sovereign identity wallet. Store credentials, generate ZK proofs, and verify your identity without exposing personal data.
      </p>

      {/* Centered CTA Buttons */}
      <div className="hero-actions">
        <button className="btn-primary" onClick={onCreateIdentityClick}>
          <span>Create Identity</span>
          <ChevronRight className="btn-arrow" size={18} />
        </button>

        <button className="btn-secondary" onClick={onVerifyProofClick}>
          <ShieldCheck size={18} />
          <span>Verify a Proof</span>
        </button>
      </div>
    </main>
  );
};
