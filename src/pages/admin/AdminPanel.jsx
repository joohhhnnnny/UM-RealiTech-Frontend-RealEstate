import React, { useState } from 'react';
import { initializeBuildSafe } from '../../scripts/initializeBuildSafe.js';
import { testFirebaseConnection, addSampleData } from '../../utils/firebaseTestUtils.js';
import { FiDatabase, FiPlay, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

const AdminPanel = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    addLog('Testing Firebase connection...', 'info');
    
    try {
      const isConnected = await testFirebaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      addLog(isConnected ? '✅ Firebase connected' : '❌ Firebase connection failed', 
             isConnected ? 'success' : 'error');
    } catch (error) {
      setConnectionStatus('failed');
      addLog(`❌ Connection error: ${error.message}`, 'error');
    }
  };

  const addSampleDataOnly = async () => {
    setIsInitializing(true);
    addLog('Adding sample data to Firebase...', 'info');
    
    try {
      const result = await addSampleData();
      addLog('✅ Sample data added successfully!', 'success');
      addLog(`Created: ${JSON.stringify(result, null, 2)}`, 'info');
    } catch (error) {
      addLog(`❌ Error adding sample data: ${error.message}`, 'error');
    } finally {
      setIsInitializing(false);
    }
  };

  const runFullInitialization = async () => {
    setIsInitializing(true);
    setLogs([]);
    
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    // Capture console outputs
    console.log = (...args) => {
      addLog(args.join(' '), 'info');
      originalConsoleLog(...args);
    };
    
    console.error = (...args) => {
      addLog(args.join(' '), 'error');
      originalConsoleError(...args);
    };
    
    try {
      const success = await initializeBuildSafe();
      if (success) {
        addLog('🎉 Full initialization completed!', 'success');
      } else {
        addLog('❌ Initialization failed', 'error');
      }
    } catch (error) {
      addLog(`❌ Initialization error: ${error.message}`, 'error');
    } finally {
      // Restore console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      setIsInitializing(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <FiRefreshCw className="animate-spin text-blue-500" />;
      case 'connected':
        return <FiCheck className="text-green-500" />;
      case 'failed':
        return <FiX className="text-red-500" />;
      default:
        return <FiDatabase className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-6">
              <FiDatabase className="mr-2" />
              BuildSafe Admin Panel
            </h1>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button 
                className="btn btn-primary"
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
              >
                <FiRefreshCw className={connectionStatus === 'testing' ? 'animate-spin' : ''} />
                Test Connection
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={addSampleDataOnly}
                disabled={isInitializing}
              >
                <FiDatabase />
                Add Sample Data
              </button>
              
              <button 
                className="btn btn-accent"
                onClick={runFullInitialization}
                disabled={isInitializing}
              >
                <FiPlay />
                Full Initialize
              </button>
            </div>

            {/* Logs Section */}
            <div className="divider">Console Logs</div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Activity Log</h3>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={clearLogs}
              >
                Clear Logs
              </button>
            </div>
            
            <div className="bg-base-300 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  No logs yet. Run an action to see output.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`mb-1 ${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'success' ? 'text-green-400' : 
                      'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>

            {/* Instructions */}
            <div className="alert alert-warning mt-6">
              <div>
                <h4 className="font-bold">Instructions:</h4>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>First, test the Firebase connection</li>
                  <li>If connected, run "Add Sample Data" to populate the database</li>
                  <li>Or use "Full Initialize" to run the complete setup process</li>
                  <li>Check the logs for any errors or success messages</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
