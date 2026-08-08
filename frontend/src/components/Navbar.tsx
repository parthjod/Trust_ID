interface NavbarProps {
  onVerifyClick: () => void;
  onGetStartedClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onVerifyClick, onGetStartedClick }) => {
  return (
    <nav className="navbar">
      <button className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        {/* Custom Shield SVG matching the exact logo in the screenshot */}
        <svg
          className="logo-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
        <span>TrustID</span>
      </button>

      <div className="nav-actions">
        <button className="nav-link" onClick={onVerifyClick}>
          Verify
        </button>
        <button className="btn-get-started" onClick={onGetStartedClick}>
          Get Started
        </button>
      </div>
    </nav>
  );
};
