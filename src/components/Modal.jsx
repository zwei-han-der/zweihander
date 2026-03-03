import { useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/components.Modal.css";

function Modal({ isOpen, onClose, onCloseNavigate, children, className = "" }) {
  useEffect(() => {
    const handleClose = () => {
      if (onCloseNavigate) {
        onCloseNavigate();
      } else {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose, onCloseNavigate]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (onCloseNavigate) {
      onCloseNavigate();
    } else {
      onClose();
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className={`modal-content ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
