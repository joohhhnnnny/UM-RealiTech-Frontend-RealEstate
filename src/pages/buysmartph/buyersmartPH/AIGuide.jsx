import { motion } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { 
  RiRobot2Line,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiPriceTag3Line
} from 'react-icons/ri';

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
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, icon: Icon }) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${type === 'checkbox' ? 'checkbox checkbox-primary' : 'input input-bordered w-full'} ${Icon ? 'pl-10' : ''}`}
        />
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />}
      </div>
    </div>
  );
};

function AIGuide({ profileData, setProfileData, onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(profileData || {
    buyerType: '',
    monthlyIncome: '',
    monthlyDebts: '',
    hasSpouseIncome: false,
    preferredLocation: '',
    budgetRange: ''
  });

  // Memoize the handleInputChange to prevent recreating the function
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Memoize the buyer type selection handler
  const handleBuyerTypeSelect = useCallback((type) => {
    setFormData(prev => ({ ...prev, buyerType: type }));
  }, []);

  const handleNext = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 4));
  }, []);

  const handlePrevious = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleComplete = useCallback(() => {
    if (formData.buyerType && formData.monthlyIncome && formData.preferredLocation && formData.budgetRange) {
      setProfileData(formData);
      onComplete(formData);
    } else {
      alert("Please complete all required fields before proceeding");
    }
  }, [formData, onComplete, setProfileData]);

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
      />
      <InputField
        label="Monthly Debts/Obligations (₱)"
        name="monthlyDebts"
        value={formData.monthlyDebts}
        onChange={handleInputChange}
        placeholder="Enter your monthly debts"
        type="number"
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
      <h3 className="text-xl font-semibold mb-4">Profile Summary</h3>
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
  ), [formData]);

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
      <h2 className="text-2xl font-bold mb-4">AI Buyer Profile Setup</h2>
      <ProgressBar step={step} />
      
      {step === 1 && renderBuyerType()}
      {step === 2 && renderFinancialInfo()}
      {step === 3 && renderLocationBudget()}
      {step === 4 && renderSummary()}
      
      <div className="flex justify-between mt-8">
        <button 
          className="btn btn-outline" 
          onClick={handlePrevious}
          disabled={step === 1}
        >
          Previous
        </button>
        <button 
          className="btn btn-primary gap-2" 
          onClick={step === 4 ? handleComplete : handleNext}
        >
          {step === 4 ? (
            <>
              <RiRobot2Line className="w-5 h-5" />
              View AI Recommendations
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
  );
}

export default AIGuide;