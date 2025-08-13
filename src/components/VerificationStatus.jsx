import React from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaExclamationTriangle, FaFileUpload } from 'react-icons/fa';

const VerificationStatus = ({ status, onStartVerification, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: FaCheckCircle,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success',
          title: 'Verified',
          message: 'Your account is verified and all features are available.',
          showButton: false
        };
      case 'pending':
        return {
          icon: FaClock,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning',
          title: 'Verification Pending',
          message: 'Your documents are being reviewed. This usually takes 24-48 hours.',
          showButton: false
        };
      case 'rejected':
        return {
          icon: FaTimesCircle,
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error',
          title: 'Verification Rejected',
          message: 'Your verification was rejected. Please resubmit with correct documents.',
          showButton: true,
          buttonText: 'Resubmit Documents',
          buttonClass: 'btn-error'
        };
      case 'not_submitted':
      default:
        return {
          icon: FaFileUpload,
          color: 'text-info',
          bgColor: 'bg-info/10',
          borderColor: 'border-info',
          title: 'Verification Required',
          message: 'Complete verification to unlock all platform features and start earning.',
          showButton: true,
          buttonText: 'Start Verification',
          buttonClass: 'btn-primary'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`alert ${config.bgColor} ${config.borderColor} border-2 ${className}`}>
      <IconComponent className={`w-6 h-6 ${config.color}`} />
      <div className="flex-1">
        <div className="font-semibold">{config.title}</div>
        <div className="text-sm opacity-80">{config.message}</div>
      </div>
      {config.showButton && (
        <button 
          className={`btn btn-sm ${config.buttonClass}`}
          onClick={onStartVerification}
        >
          {config.buttonText}
        </button>
      )}
    </div>
  );
};

export default VerificationStatus;
