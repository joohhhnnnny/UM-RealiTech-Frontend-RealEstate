import React, { useState } from 'react';
import { populateFirestoreAgents } from '../scripts/populateAgents';

const FirestorePopulateButton = () => {
  const [isPopulating, setIsPopulating] = useState(false);

  const handlePopulate = async () => {
    if (isPopulating) return;
    
    const confirmed = window.confirm(
      '🔥 Populate Firestore with Agent Data?\n\n' +
      'This will add enhanced agent data to your Firestore database.\n' +
      'The process may take a few moments.\n\n' +
      'Continue?'
    );
    
    if (!confirmed) return;

    setIsPopulating(true);
    try {
      await populateFirestoreAgents();
      alert('✅ Firestore populated successfully!\n\nRefresh the page to see real agent data.');
      window.location.reload(); // Refresh to show new data
    } catch (error) {
      console.error('Error populating Firestore:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handlePopulate}
        disabled={isPopulating}
        className={`btn btn-primary gap-2 ${isPopulating ? 'loading' : ''}`}
        title="Populate Firestore with agent data"
      >
        {isPopulating ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Populating...
          </>
        ) : (
          <>
            🔥 Populate Firestore
          </>
        )}
      </button>
    </div>
  );
};

export default FirestorePopulateButton;
