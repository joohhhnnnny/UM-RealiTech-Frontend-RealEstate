import React, { useState, useEffect } from 'react';
import { RiWifiLine, RiWifiOffLine, RiAlertLine } from 'react-icons/ri';
import { testFirebaseConnection } from '../utils/firebaseTestUtils';

function FirebaseStatus({ className = "" }) {
  const [status, setStatus] = useState('checking'); // checking, connected, error
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        const isConnected = await testFirebaseConnection();
        setStatus(isConnected ? 'connected' : 'error');
        setLastChecked(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Firebase connection check failed:', error);
        setStatus('error');
        setLastChecked(new Date().toLocaleTimeString());
      }
    };

    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <RiWifiLine className="w-4 h-4" />,
          text: 'Firebase Connected',
          classes: 'badge-success text-success-content',
          tooltip: `Last checked: ${lastChecked}`
        };
      case 'error':
        return {
          icon: <RiWifiOffLine className="w-4 h-4" />,
          text: 'Firebase Error',
          classes: 'badge-error text-error-content',
          tooltip: `Connection failed at: ${lastChecked}`
        };
      default:
        return {
          icon: <RiAlertLine className="w-4 h-4" />,
          text: 'Checking...',
          classes: 'badge-warning text-warning-content',
          tooltip: 'Checking Firebase connection'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div 
      className={`badge gap-1 ${statusConfig.classes} ${className}`}
      title={statusConfig.tooltip}
    >
      {statusConfig.icon}
      <span className="text-xs font-medium">{statusConfig.text}</span>
    </div>
  );
}

export default FirebaseStatus;
