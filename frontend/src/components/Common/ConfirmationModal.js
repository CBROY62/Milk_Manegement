import React, { useEffect } from 'react';
import { FiAlertCircle, FiX, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import './Modal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
  loading = false
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus trap - focus on modal when opened
      const modal = document.querySelector('.confirmation-modal-content');
      if (modal) {
        modal.focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    const handleEnter = (e) => {
      if (e.key === 'Enter' && isOpen && !loading && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        onConfirm();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleEnter);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleEnter);
    };
  }, [isOpen, loading, onClose, onConfirm]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FiAlertCircle className="modal-icon danger" />;
      case 'warning':
        return <FiAlertTriangle className="modal-icon warning" />;
      case 'success':
        return <FiCheckCircle className="modal-icon success" />;
      default:
        return <FiInfo className="modal-icon info" />;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div 
      className={`confirmation-modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`confirmation-modal-content ${type}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
        tabIndex={-1}
      >
        <div className="modal-header">
          <div className="modal-icon-container">
            {getIcon()}
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {title && (
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
          )}
          {message && (
            <p id="modal-message" className="modal-message">
              {message}
            </p>
          )}
        </div>

        <div className="modal-footer">
          {showCancel && (
            <button
              className="modal-btn modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`modal-btn modal-btn-confirm ${type}`}
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

