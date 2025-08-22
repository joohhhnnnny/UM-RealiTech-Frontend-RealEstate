import { motion } from "framer-motion";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { 
  RiRobot2Line,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiPriceTag3Line,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckLine
} from 'react-icons/ri';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../config/Firebase';
import { userProfileService } from '../../../services/UserProfileService';

// Memoized progress component to prevent re-renders
const ProgressBar = ({ step }) => {
  const progress = (step / 4) * 100;
  return (
    <div className="w-full mb-8">
      <div className="w-full h-2 bg-base-200 rounded-full">
        <div 
          className="h-2 bg-primary rounded-full transition-all duration-300" 
          style={{width: `${progress}%`}}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className={step >= 1 ? "text-primary" : "text-base-content/50"}>Buyer Type</span>
        <span className={step >= 2 ? "text-primary" : "text-base-content/50"}>Financial Info</span>
        <span className={step >= 3 ? "text-primary" : "text-base-content/50"}>Location & Budget</span>
        <span className={step >= 4 ? "text-primary" : "text-base-content/50"}>Summary</span>
      </div>
    </div>
  );
};

// Memoized buyer type options to prevent re-renders
const BuyerTypeOptions = ({ buyerType, setFormData }) => {
  const options = useMemo(() => [
    { type: 'First Time Buyer', icon: '🏠', description: 'First property purchase' },
    { type: 'OFW', icon: '✈️', description: 'Overseas Filipino Worker' },
    { type: 'Investor', icon: '💼', description: 'Investment property' },
    { type: 'Upgrader', icon: '⭐', description: 'Moving to a better property' }
  ], []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((option) => (
        <div
          key={option.type}
          onClick={() => {
            setFormData(prev => ({ ...prev, buyerType: option.type }));
          }}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            buyerType === option.type
              ? 'border-primary bg-primary/5'
              : 'border-base-200 hover:border-primary/50'
          }`}
        >
          <div className="text-2xl mb-2">{option.icon}</div>
          <h4 className="font-semibold">{option.type}</h4>
          <p className="text-sm text-base-content/70">{option.description}</p>
        </div>
      ))}
    </div>
  );
};

// Memoized input field component to isolate re-renders
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, icon: Icon, isFormatted = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [rawValue, setRawValue] = useState(value || '');

  // Format number with commas and decimal places
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '';
    return Number(num).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Remove formatting to get raw number
  const unformatNumber = (formattedNum) => {
    return formattedNum.replace(/,/g, '');
  };

  const handleFocus = () => {
    if (isFormatted) {
      setIsFocused(true);
      setRawValue(unformatNumber(value || ''));
    }
  };

  const handleBlur = (e) => {
    if (isFormatted) {
      setIsFocused(false);
      const numericValue = unformatNumber(e.target.value);
      setRawValue(numericValue);
      // Trigger onChange with the raw numeric value
      onChange({
        target: {
          name: name,
          value: numericValue,
          type: type
        }
      });
    }
  };

  const handleChange = (e) => {
    if (isFormatted && isFocused) {
      // Only allow numbers and decimal point while typing
      const inputValue = e.target.value.replace(/[^0-9.]/g, '');
      setRawValue(inputValue);
      onChange({
        target: {
          name: name,
          value: inputValue,
          type: type
        }
      });
    } else {
      onChange(e);
    }
  };

  // Determine display value
  const displayValue = isFormatted 
    ? (isFocused ? rawValue : formatNumber(value))
    : value;

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative">
        <input
          type={type === 'number' && isFormatted ? 'text' : type}
          name={name}
          value={type === 'checkbox' ? undefined : displayValue}
          checked={type === 'checkbox' ? value : undefined}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`${type === 'checkbox' ? 'checkbox checkbox-primary' : 'input input-bordered w-full'} ${Icon ? 'pl-10' : ''}`}
        />
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />}
      </div>
    </div>
  );
};

function AIGuide({ profileData, setProfileData, onComplete, isEditMode = false }) {
  const [user, authLoading] = useAuthState(auth);
  const [step, setStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'
  const [isLoading, setIsLoading] = useState(false); // For profile loading only
  const hasLoadedProfile = useRef(false); // Track if we've already loaded profile data
  const [formData, setFormData] = useState(profileData || {
    buyerType: '',
    monthlyIncome: '',
    monthlyDebts: '',
    hasSpouseIncome: false,
    preferredLocation: '',
    budgetRange: ''
  });

  // Load existing profile on component mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      // Prevent multiple loads and infinite loops
      if (hasLoadedProfile.current || authLoading) return;
      
      // Only load if we're in edit mode and don't have complete profile data
      if (isEditMode && (!profileData || !profileData.buyerType) && user) {
        setIsLoading(true);
        hasLoadedProfile.current = true;
        
        try {
          const response = await userProfileService.getProfile();
          if (response.success && response.exists) {
            const existingProfile = response.profileData;
            setFormData({
              buyerType: existingProfile.buyerType || '',
              monthlyIncome: existingProfile.monthlyIncome || '',
              monthlyDebts: existingProfile.monthlyDebts || '',
              hasSpouseIncome: existingProfile.hasSpouseIncome || false,
              preferredLocation: existingProfile.preferredLocation || '',
              budgetRange: existingProfile.budgetRange || ''
            });
            setProfileData(existingProfile);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          setSaveStatus('error');
        } finally {
          setIsLoading(false);
        }
      } else if (profileData && profileData.buyerType && !hasLoadedProfile.current && !authLoading) {
        // If we already have profile data, populate the form once
        hasLoadedProfile.current = true;
        setFormData({
          buyerType: profileData.buyerType || '',
          monthlyIncome: profileData.monthlyIncome || '',
          monthlyDebts: profileData.monthlyDebts || '',
          hasSpouseIncome: profileData.hasSpouseIncome || false,
          preferredLocation: profileData.preferredLocation || '',
          budgetRange: profileData.budgetRange || ''
        });
      }
    };

    loadExistingProfile();
  }, [isEditMode, profileData, setProfileData, user, authLoading]);

  // Reset the loaded flag when edit mode changes
  useEffect(() => {
    hasLoadedProfile.current = false;
    setStep(1);
    setSaveStatus(null);
  }, [isEditMode]);

  // Memoize the handleInputChange to prevent recreating the function
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleNext = useCallback(() => {
    // Clear any error states when moving to next step
    if (saveStatus === 'error') {
      setSaveStatus(null);
    }
    setStep(prev => Math.min(prev + 1, 4));
  }, [saveStatus]);

  const handlePrevious = useCallback(() => {
    // Clear any save states when going back
    setSaveStatus(null);
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleComplete = useCallback(async () => {
    if (formData.buyerType && formData.monthlyIncome && formData.preferredLocation && formData.budgetRange) {
      setSaveStatus('saving');
      
      try {
        // Validate profile data
        const validation = userProfileService.validateProfile(formData);
        if (!validation.isValid) {
          alert(`Please complete the following fields: ${validation.missingFields.join(', ')}`);
          setSaveStatus('error');
          return;
        }

        // Save or update profile to Firestore
        const saveResponse = isEditMode 
          ? await userProfileService.updateProfile(formData)
          : await userProfileService.saveProfile(formData);
        
        if (saveResponse.success) {
          setSaveStatus('success');
          
          // For updates, merge the updated data with existing profile
          const updatedProfileData = isEditMode 
            ? { ...profileData, ...formData, lastUpdatedAt: new Date() }
            : saveResponse.profileData;
            
          setProfileData(updatedProfileData);
          
          // Show success message briefly before completing
          setTimeout(() => {
            // Reset states before completing
            setSaveStatus(null);
            onComplete(updatedProfileData);
          }, 1500);
        } else {
          setSaveStatus('error');
          alert(`Failed to ${isEditMode ? 'update' : 'save'} profile: ${saveResponse.message}`);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        setSaveStatus('error');
        alert(`An error occurred while ${isEditMode ? 'updating' : 'saving'} your profile. Please try again.`);
      }
    } else {
      alert("Please complete all required fields before proceeding");
    }
  }, [formData, onComplete, setProfileData, isEditMode, profileData]);

  const renderBuyerType = useMemo(() => () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-4">What type of buyer are you?</h3>
      <BuyerTypeOptions 
        buyerType={formData.buyerType} 
        setFormData={setFormData} 
      />
    </motion.div>
  ), [formData.buyerType]);

  const renderFinancialInfo = useMemo(() => () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-4">Financial Information</h3>
      <InputField
        label="Monthly Income (₱)"
        name="monthlyIncome"
        value={formData.monthlyIncome}
        onChange={handleInputChange}
        placeholder="Enter your monthly income"
        type="number"
        isFormatted={true}
      />
      <InputField
        label="Monthly Debts/Obligations (₱)"
        name="monthlyDebts"
        value={formData.monthlyDebts}
        onChange={handleInputChange}
        placeholder="Enter your monthly debts"
        type="number"
        isFormatted={true}
      />
      <InputField
        label="I have a spouse with income"
        name="hasSpouseIncome"
        checked={formData.hasSpouseIncome}
        onChange={handleInputChange}
        type="checkbox"
      />
    </motion.div>
  ), [formData.monthlyIncome, formData.monthlyDebts, formData.hasSpouseIncome, handleInputChange]);

  const renderLocationBudget = useMemo(() => () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-4">Location & Budget Preferences</h3>
      <InputField
        label="Preferred Location"
        name="preferredLocation"
        value={formData.preferredLocation}
        onChange={handleInputChange}
        placeholder="Enter preferred location"
        icon={RiMapPinLine}
      />
      <div className="form-control">
        <label className="label">
          <span className="label-text">Budget Range</span>
        </label>
        <div className="relative">
          <select
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleInputChange}
            className="select select-bordered w-full pl-10"
          >
            <option value="">Select budget range</option>
            <option value="1M-3M">₱1M - ₱3M</option>
            <option value="3M-5M">₱3M - ₱5M</option>
            <option value="5M-10M">₱5M - ₱10M</option>
            <option value="10M+">Above ₱10M</option>
          </select>
          <RiPriceTag3Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
        </div>
      </div>
    </motion.div>
  ), [formData.preferredLocation, formData.budgetRange, handleInputChange]);

  const renderSummary = useMemo(() => () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Update Profile Summary' : 'Profile Summary'}
      </h3>
      <div className="bg-base-200 p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-base-content/70">Buyer Type</h4>
            <p>{formData.buyerType || '-'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-base-content/70">Monthly Income</h4>
            <p>₱{Number(formData.monthlyIncome || 0).toLocaleString()}</p>
          </div>
          <div>
            <h4 className="font-semibold text-base-content/70">Monthly Debts</h4>
            <p>₱{Number(formData.monthlyDebts || 0).toLocaleString()}</p>
          </div>
          <div>
            <h4 className="font-semibold text-base-content/70">Has Spouse Income</h4>
            <p>{formData.hasSpouseIncome ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-base-content/70">Preferred Location</h4>
            <p>{formData.preferredLocation || '-'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-base-content/70">Budget Range</h4>
            <p>{formData.budgetRange || '-'}</p>
          </div>
        </div>
      </div>

      {/* Save Status Display */}
      {saveStatus === 'saving' && (
        <div className="alert alert-info">
          <RiLoader4Line className="w-6 h-6 animate-spin" />
          <div>
            <h3 className="font-bold">Saving Profile...</h3>
            <div className="text-sm">Please wait while we save your profile to the cloud.</div>
          </div>
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="alert alert-success">
          <RiCheckLine className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Profile Saved Successfully!</h3>
            <div className="text-sm">Your profile has been saved and you'll be redirected to your recommendations.</div>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="alert alert-error">
          <RiErrorWarningLine className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Save Failed</h3>
            <div className="text-sm">There was an error saving your profile. Please try again.</div>
          </div>
        </div>
      )}

      {formData.buyerType && formData.monthlyIncome && formData.preferredLocation && formData.budgetRange ? (
        <div className="alert alert-success">
          <RiRobot2Line className="w-6 h-6" />
          <div>
            <h3 className="font-bold">AI Profile Complete!</h3>
            <div className="text-sm">Based on your profile, we'll provide personalized recommendations.</div>
          </div>
        </div>
      ) : (
        <div className="alert alert-error">
          <RiRobot2Line className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Profile Incomplete</h3>
            <div className="text-sm">
              Please complete the following required fields:
              <ul className="mt-1 list-disc list-inside">
                {!formData.buyerType && <li>Buyer Type</li>}
                {!formData.monthlyIncome && <li>Monthly Income</li>}
                {!formData.preferredLocation && <li>Preferred Location</li>}
                {!formData.budgetRange && <li>Budget Range</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  ), [formData, saveStatus, isEditMode]);

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-500">
        {isEditMode ? 'Update AI Buyer Profile' : 'AI Buyer Profile Setup'}
      </h2>
      <ProgressBar step={step} />
      
      {(authLoading || isLoading) ? (
        <div className="flex items-center justify-center py-12">
          <RiLoader4Line className="w-8 h-8 animate-spin text-primary mr-3" />
          <span>
            {authLoading ? 'Authenticating...' : 'Loading profile data...'}
          </span>
        </div>
      ) : !user && isEditMode ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RiErrorWarningLine className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-base-content/70">Please log in to edit your profile.</p>
          </div>
        </div>
      ) : (
        <div key={`form-${isEditMode}-${hasLoadedProfile.current}`}>
          {step === 1 && renderBuyerType()}
          {step === 2 && renderFinancialInfo()}
          {step === 3 && renderLocationBudget()}
          {step === 4 && renderSummary()}
          
          <div className="flex justify-between mt-8">
            <button 
              className="btn btn-outline" 
              onClick={handlePrevious}
              disabled={step === 1 || saveStatus === 'saving'}
            >
              Previous
            </button>
            <button 
              className="btn btn-primary gap-2" 
              onClick={step === 4 ? handleComplete : handleNext}
              disabled={saveStatus === 'saving'}
            >
              {(step === 4 && saveStatus === 'saving') ? (
                <>
                  <RiLoader4Line className="w-5 h-5 animate-spin" />
                  {isEditMode ? 'Updating Profile...' : 'Saving Profile...'}
                </>
              ) : step === 4 ? (
                <>
                  <RiRobot2Line className="w-5 h-5" />
                  {isEditMode ? 'Update Profile & View Recommendations' : 'Save Profile & View AI Recommendations'}
                </>
              ) : (
                <>
                  <RiCheckboxCircleLine className="w-5 h-5" />
                  Next
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIGuide;