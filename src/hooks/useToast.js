import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications
 * 
 * @param {Object} defaultConfig - Default configuration for toasts
 * @returns {Object} { toast, showToast, hideToast, ToastComponent }
 */
const useToast = (defaultConfig = {}) => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    duration: 3000,
    position: 'top-right',
    ...defaultConfig
  });

  // Function to show toast
  const showToast = useCallback((message, options = {}) => {
    const config = {
      show: true,
      message,
      type: 'success',
      duration: 3000,
      position: 'top-right',
      ...defaultConfig,
      ...options
    };

    setToast(config);
  }, [defaultConfig]);

  // Function to hide toast
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback((message, options = {}) => {
    showToast(message, { ...options, type: 'success' });
  }, [showToast]);

  const showError = useCallback((message, options = {}) => {
    showToast(message, { ...options, type: 'error' });
  }, [showToast]);

  const showWarning = useCallback((message, options = {}) => {
    showToast(message, { ...options, type: 'warning' });
  }, [showToast]);

  const showInfo = useCallback((message, options = {}) => {
    showToast(message, { ...options, type: 'info' });
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useToast;
