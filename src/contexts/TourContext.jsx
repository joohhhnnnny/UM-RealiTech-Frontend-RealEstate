import React, { createContext, useContext, useState } from 'react';

const TourContext = createContext();

export function useTour() {
  return useContext(TourContext);
}

export function TourProvider({ children }) {
  const [tourData, setTourData] = useState({
    isActive: false,
    currentStep: 0,
    userRole: 'buyer'
  });

  const startTour = (userRole = 'buyer') => {
    setTourData({
      isActive: true,
      currentStep: 0,
      userRole
    });
  };

  const endTour = () => {
    setTourData(prev => ({
      ...prev,
      isActive: false,
      currentStep: 0
    }));
  };

  const nextStep = () => {
    setTourData(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  };

  const previousStep = () => {
    setTourData(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  };

  const value = {
    ...tourData,
    startTour,
    endTour,
    nextStep,
    previousStep
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export default TourProvider;
