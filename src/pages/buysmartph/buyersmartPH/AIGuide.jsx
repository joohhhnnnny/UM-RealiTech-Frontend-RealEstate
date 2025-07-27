import { motion } from "framer-motion";
import { useState } from "react";
import { 
  RiRobot2Line,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiPriceTag3Line
} from 'react-icons/ri';

function AIGuide() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    buyerType: '',
    monthlyIncome: '',
    monthlyDebts: '',
    hasSpouseIncome: false,
    preferredLocation: '',
    budgetRange: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const renderProgress = () => {
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

  const renderBuyerType = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-4">What type of buyer are you?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { type: 'First Time Buyer', icon: '🏠', description: 'First property purchase' },
          { type: 'OFW', icon: '✈️', description: 'Overseas Filipino Worker' },
          { type: 'Investor', icon: '💼', description: 'Investment property' },
          { type: 'Upgrader', icon: '⭐', description: 'Moving to a better property' }
        ].map((option) => (
          <div
            key={option.type}
            onClick={() => {
              setFormData(prev => ({ ...prev, buyerType: option.type }));
            }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.buyerType === option.type
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
    </motion.div>
  );

  const renderFinancialInfo = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-4">Financial Information</h3>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Monthly Income (₱)</span>
        </label>
        <input
          type="number"
          name="monthlyIncome"
          value={formData.monthlyIncome}
          onChange={handleInputChange}
          placeholder="Enter your monthly income"
          className="input input-bordered w-full"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Monthly Debts/Obligations (₱)</span>
        </label>
        <input
          type="number"
          name="monthlyDebts"
          value={formData.monthlyDebts}
          onChange={handleInputChange}
          placeholder="Enter your monthly debts"
          className="input input-bordered w-full"
        />
      </div>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">I have a spouse with income</span>
          <input
            type="checkbox"
            name="hasSpouseIncome"
            checked={formData.hasSpouseIncome}
            onChange={handleInputChange}
            className="checkbox checkbox-primary"
          />
        </label>
      </div>
    </motion.div>
  );

  const renderLocationBudget = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-4">Location & Budget Preferences</h3>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Preferred Location</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="preferredLocation"
            value={formData.preferredLocation}
            onChange={handleInputChange}
            placeholder="Enter preferred location"
            className="input input-bordered w-full pl-10"
          />
          <RiMapPinLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
        </div>
      </div>
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
  );

  const renderSummary = () => (
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
      <div className="alert alert-success">
        <RiRobot2Line className="w-6 h-6" />
        <div>
          <h3 className="font-bold">AI Profile Complete!</h3>
          <div className="text-sm">Based on your profile, we'll provide personalized recommendations.</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
      <h2 className="text-2xl font-bold mb-4">AI Buyer Profile Setup</h2>
      {renderProgress()}
      
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
          onClick={handleNext}
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