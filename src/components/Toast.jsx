import { useEffect } from 'react';
import { 
  RiCheckboxCircleLine, 
  RiErrorWarningLine,
  RiInformationLine,
  RiAlertLine
} from 'react-icons/ri';

/**
 * Reusable Toast Notification Component
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the toast
 * @param {string} props.message - Toast message text
 * @param {string} props.type - Toast type: 'success', 'error', 'info', 'warning'
 * @param {number} props.duration - Auto-dismiss duration in milliseconds (default: 3000)
 * @param {function} props.onClose - Callback when toast closes
 * @param {string} props.position - Toast position: 'top-right', 'top-left', 'bottom-right', 'bottom-left' (default: 'top-right')
 */
const Toast = ({ 
  show, 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose, 
  position = 'top-right' 
}) => {
  // Auto-dismiss toast after duration
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  // Don't render if not shown
  if (!show) return null;

  // Position classes mapping
  const positionClasses = {
    'top-right': 'toast-top toast-end',
    'top-left': 'toast-top toast-start',
    'bottom-right': 'toast-bottom toast-end',
    'bottom-left': 'toast-bottom toast-start',
    'top-center': 'toast-top toast-center',
    'bottom-center': 'toast-bottom toast-center'
  };

  // Type-specific styling and icons
  const typeConfig = {
    success: {
      alertClass: 'alert-success',
      icon: RiCheckboxCircleLine,
      bgColor: 'bg-success',
      textColor: 'text-success-content'
    },
    error: {
      alertClass: 'alert-error',
      icon: RiErrorWarningLine,
      bgColor: 'bg-error',
      textColor: 'text-error-content'
    },
    warning: {
      alertClass: 'alert-warning',
      icon: RiAlertLine,
      bgColor: 'bg-warning',
      textColor: 'text-warning-content'
    },
    info: {
      alertClass: 'alert-info',
      icon: RiInformationLine,
      bgColor: 'bg-info',
      textColor: 'text-info-content'
    }
  };

  const config = typeConfig[type] || typeConfig.success;
  const IconComponent = config.icon;

  return (
    <div className={`toast ${positionClasses[position] || positionClasses['top-right']}`}>
      <div className={`alert ${config.alertClass} shadow-lg max-w-sm`}>
        <div className="flex items-center gap-2 w-full">
          <IconComponent className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm flex-1">{message}</span>
          {onClose && (
            <button 
              className="btn btn-ghost btn-xs ml-2"
              onClick={onClose}
              aria-label="Close toast"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;
