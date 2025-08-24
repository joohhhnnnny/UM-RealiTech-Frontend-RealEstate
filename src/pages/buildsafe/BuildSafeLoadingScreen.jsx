import React from 'react';
import { RiBuildingLine } from 'react-icons/ri';

const BuildSafeLoadingScreen = ({ message = "Loading BuildSafe..." }) => {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <RiBuildingLine className="w-16 h-16 mx-auto text-primary animate-pulse" />
        </div>
        
        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
        
        <h2 className="text-xl font-bold text-base-content mb-2">BuildSafe</h2>
        <p className="text-base-content/70 mb-6">{message}</p>
        
        <div className="flex flex-col items-center space-y-2">
          <div className="w-64 bg-base-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          <p className="text-sm text-base-content/50">Initializing secure connections...</p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-base-200 h-4 rounded animate-pulse"></div>
          <div className="bg-base-200 h-4 rounded animate-pulse delay-75"></div>
          <div className="bg-base-200 h-4 rounded animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default BuildSafeLoadingScreen;
