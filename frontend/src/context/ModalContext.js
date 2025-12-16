import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmationModal from '../components/Common/ConfirmationModal';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showCancel: true,
    onConfirm: null,
    onCancel: null,
    loading: false
  });

  const showConfirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    showCancel = true
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        showCancel,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
        loading: false
      });
    });
  }, []);

  const showAlert = useCallback(({
    title = 'Alert',
    message = '',
    type = 'info',
    confirmText = 'OK',
    showCancel = false
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText: '',
        showCancel: false,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
        loading: false
      });
    });
  }, []);

  const setLoading = useCallback((loading) => {
    setModalState(prev => ({ ...prev, loading }));
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
  };

  const handleCancel = () => {
    if (modalState.onCancel) {
      modalState.onCancel();
    } else {
      closeModal();
    }
  };

  const value = {
    showConfirm,
    showAlert,
    setLoading,
    closeModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
        loading={modalState.loading}
      />
    </ModalContext.Provider>
  );
};

