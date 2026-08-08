import { Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast = ({ message, onClose }: ToastProps) => {
  if (!message) return null;

  return (
    <div className="toast-container" role="alert">
      <div className="toast-content">
        <Info className="toast-icon" size={18} />
        <span className="toast-text">{message}</span>
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
