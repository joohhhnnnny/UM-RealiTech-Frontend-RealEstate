import { motion } from "framer-motion";
import { useState } from "react";
import { RiBarChartBoxLine } from 'react-icons/ri';

function CostCalculator() {
  const [propertyPrice, setPropertyPrice] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState({
    transferFee: '',
    documentaryStamps: '',
    registrationFee: '',
    legalFees: ''
  });

  const calculateTotal = () => {
    const price = parseFloat(propertyPrice) || 0;
    const downPayPercent = parseFloat(downPaymentPercent) || 0;
    const downPayment = price * (downPayPercent / 100);
    
    const transferFee = parseFloat(additionalCosts.transferFee) || 0;
    const documentaryStamps = parseFloat(additionalCosts.documentaryStamps) || 0;
    const registrationFee = parseFloat(additionalCosts.registrationFee) || 0;
    const legalFees = parseFloat(additionalCosts.legalFees) || 0;

    const additionalCostsTotal = transferFee + documentaryStamps + registrationFee + legalFees;
    const totalCashNeeded = downPayment + additionalCostsTotal;

    return {
      downPayment,
      additionalCostsTotal,
      totalCashNeeded
    };
  };

  const results = calculateTotal();

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
          <div className="form-control">
            <label className="label">
              <span className="label-text">Property Price (₱)</span>
            </label>
            <input
              type="number"
              placeholder="Enter property price"
              className="input input-bordered w-full"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
              min="0"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Down Payment (%)</span>
            </label>
            <input
              type="number"
              placeholder="Enter down payment percentage"
              className="input input-bordered w-full"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(e.target.value)}
              min="0"
              max="100"
            />
          </div>

          <div className="divider">Additional Costs</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Transfer Fee (₱)</span>
              </label>
              <input
                type="number"
                placeholder="Enter transfer fee"
                className="input input-bordered w-full"
                value={additionalCosts.transferFee}
                onChange={(e) => setAdditionalCosts({...additionalCosts, transferFee: e.target.value})}
                min="0"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Documentary Stamps (₱)</span>
              </label>
              <input
                type="number"
                placeholder="Enter documentary stamps"
                className="input input-bordered w-full"
                value={additionalCosts.documentaryStamps}
                onChange={(e) => setAdditionalCosts({...additionalCosts, documentaryStamps: e.target.value})}
                min="0"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Registration Fee (₱)</span>
              </label>
              <input
                type="number"
                placeholder="Enter registration fee"
                className="input input-bordered w-full"
                value={additionalCosts.registrationFee}
                onChange={(e) => setAdditionalCosts({...additionalCosts, registrationFee: e.target.value})}
                min="0"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Legal Fees (₱)</span>
              </label>
              <input
                type="number"
                placeholder="Enter legal fees"
                className="input input-bordered w-full"
                value={additionalCosts.legalFees}
                onChange={(e) => setAdditionalCosts({...additionalCosts, legalFees: e.target.value})}
                min="0"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <p className="text-lg font-semibold">Down Payment: ₱{results.downPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-lg font-semibold">Additional Costs: ₱{results.additionalCostsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xl font-bold text-primary mt-2">
              Total Cash Needed: ₱{results.totalCashNeeded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

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