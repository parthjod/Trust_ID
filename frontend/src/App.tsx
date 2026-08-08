import { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Toast } from './components/Toast';
import './index.css';

export function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToBeImplemented = (featureName?: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const message = featureName 
      ? `"${featureName}" — To be implemented` 
      : 'To be implemented';
    
    setToastMessage(message);

    timerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <>
      {/* Dynamic Dark Ambient Grid Background */}
      <div className="bg-grid-container" aria-hidden="true">
        <div className="bg-grid"></div>
        <div className="bg-radial-glow"></div>
        <div className="bg-secondary-glow"></div>
      </div>

      {/* Navigation Bar */}
      <Navbar
        onVerifyClick={() => showToBeImplemented('Verify')}
        onGetStartedClick={() => showToBeImplemented('Get Started')}
      />

      {/* Centered Hero Section */}
      <Hero
        onCreateIdentityClick={() => showToBeImplemented('Create Identity')}
        onVerifyProofClick={() => showToBeImplemented('Verify a Proof')}
        onPillClick={() => showToBeImplemented('Zero-Knowledge Proofs & Noir')}
      />

      {/* Toast Feedback Banner */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </>
  );
}

export default App;
