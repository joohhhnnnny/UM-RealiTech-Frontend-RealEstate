import { motion } from "framer-motion";
import { useState, useCallback, memo } from "react";
import { RiBarChartBoxLine } from 'react-icons/ri';

const InputField = memo(({ label, value, onChange, name }) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text">{label}</span>
    </label>
    <input
      type="number"
      name={name}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="input input-bordered w-full"
      value={value}
      onChange={onChange}
      min="0"
    />
  </div>
));

const ResultDisplay = memo(({ results }) => (
  <div className="mt-4 p-4 bg-base-200 rounded-lg">
    <p className="text-lg font-semibold">
      Down Payment: ₱{results.downPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </p>
    <p className="text-lg font-semibold">
      Additional Costs: ₱{results.additionalCostsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </p>
    <p className="text-xl font-bold text-primary mt-2">
      Total Cash Needed: ₱{results.totalCashNeeded.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </p>
  </div>
));

function CostCalculator() {
  const [propertyPrice, setPropertyPrice] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState({
    transferFee: '',
    documentaryStamps: '',
    registrationFee: '',
    legalFees: ''
  });

  const [results, setResults] = useState({
    downPayment: 0,
    additionalCostsTotal: 0,
    totalCashNeeded: 0
  });

  const handleAdditionalCostChange = useCallback((e) => {
    const { name, value } = e.target;
    setAdditionalCosts((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const calculateTotal = useCallback(() => {
    const price = parseFloat(propertyPrice) || 0;
    const downPayPercent = parseFloat(downPaymentPercent) || 0;
    const downPayment = price * (downPayPercent / 100);

    const transferFee = parseFloat(additionalCosts.transferFee) || 0;
    const documentaryStamps = parseFloat(additionalCosts.documentaryStamps) || 0;
    const registrationFee = parseFloat(additionalCosts.registrationFee) || 0;
    const legalFees = parseFloat(additionalCosts.legalFees) || 0;

    const additionalCostsTotal = transferFee + documentaryStamps + registrationFee + legalFees;
    const totalCashNeeded = downPayment + additionalCostsTotal;

    setResults({
      downPayment,
      additionalCostsTotal,
      totalCashNeeded
    });
  }, [propertyPrice, downPaymentPercent, additionalCosts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <RiBarChartBoxLine className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-bold text-purple-500">Cost Calculator</h3>
            <p className="text-base-content/70 text-sm mt-2">Estimate total costs including taxes and fees</p>
          </div>
        </div>

        <div className="space-y-4">
          <InputField
            label="Property Price (₱)"
            name="propertyPrice"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(e.target.value)}
          />
          <InputField
            label="Down Payment (%)"
            name="downPaymentPercent"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(e.target.value)}
          />

          <div className="divider">Additional Costs</div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Transfer Fee", name: "transferFee" },
              { label: "Documentary Stamps", name: "documentaryStamps" },
              { label: "Registration Fee", name: "registrationFee" },
              { label: "Legal Fees", name: "legalFees" },
            ].map(({ label, name }) => (
              <InputField
                key={name}
                label={`${label} (₱)`}
                name={name}
                value={additionalCosts[name]}
                onChange={handleAdditionalCostChange}
              />
            ))}
          </div>

          <ResultDisplay results={results} />

          <button
            className="btn btn-primary w-full mt-4"
            onClick={calculateTotal}
          >
            Calculate Total
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default CostCalculator;
