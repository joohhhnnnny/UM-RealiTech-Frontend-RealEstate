import { motion } from "framer-motion";
import { useState } from "react";
import { RiMoneyDollarCircleLine } from 'react-icons/ri';

function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0
  });

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12; // Monthly interest rate
    const term = (parseFloat(loanTerm) || 0) * 12; // Total number of months

    if (principal > 0 && rate > 0 && term > 0) {
      const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      const totalPayment = monthlyPayment * term;
      const totalInterest = totalPayment - principal;

      setResults({
        monthlyPayment,
        totalPayment,
        totalInterest
      });
    } else {
      setResults({
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <RiMoneyDollarCircleLine className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-emerald-500">Loan Calculator</h3>
            <p className="text-base-content/70 text-sm mt-2">
              Calculate mortgage payments and loan terms
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Loan Amount (₱)</span>
            </label>
            <input
              type="number"
              placeholder="Enter loan amount"
              min="0"
              className="input input-bordered w-full"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Interest Rate (%)</span>
            </label>
            <input
              type="number"
              placeholder="Enter interest rate"
              min="0"
              step="0.1"
              className="input input-bordered w-full"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Loan Term (years)</span>
            </label>
            <input
              type="number"
              placeholder="Enter loan term"
              min="0"
              className="input input-bordered w-full"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
            />
          </div>

          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <p className="text-lg font-semibold">
              Monthly Payment: ₱{results.monthlyPayment.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </p>
            <p className="text-lg font-semibold">
              Total Payment: ₱{results.totalPayment.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </p>
            <p className="text-sm text-base-content/70 mt-2">
              Total Interest: ₱{results.totalInterest.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </p>
          </div>

          <button 
            className="btn btn-primary w-full mt-4"
            onClick={calculateLoan}
          >
            Calculate
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default LoanCalculator;