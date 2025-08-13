import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

// Currency formatter helper
const formatCurrency = (value) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Reusable InputField component
function InputField({ label, value, onChange, placeholder, step = 1, min = 0 }) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type="number"
        className="input input-bordered w-full"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        min={min}
      />
    </div>
  );
}

function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
  });

  const calculateLoan = useCallback(() => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const term = (parseFloat(loanTerm) || 0) * 12;

    if (principal > 0 && rate > 0 && term > 0) {
      const monthlyPayment =
        (principal * rate * Math.pow(1 + rate, term)) /
        (Math.pow(1 + rate, term) - 1);
      const totalPayment = monthlyPayment * term;
      const totalInterest = totalPayment - principal;

      setResults({ monthlyPayment, totalPayment, totalInterest });
    } else {
      setResults({ monthlyPayment: 0, totalPayment: 0, totalInterest: 0 });
    }
  }, [loanAmount, interestRate, loanTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <RiMoneyDollarCircleLine className="w-8 h-8 text-red-400 mb-4" />
            <h3 className="text-lg font-bold text-red-400">
              Loan Calculator
            </h3>
            <p className="text-base-content/70 text-sm mt-2">
              Calculate mortgage payments and loan terms
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <InputField
            label="Loan Amount (₱)"
            value={loanAmount}
            onChange={setLoanAmount}
            placeholder="Enter loan amount"
          />
          <InputField
            label="Interest Rate (%)"
            value={interestRate}
            onChange={setInterestRate}
            placeholder="Enter interest rate"
            step="0.1"
          />
          <InputField
            label="Loan Term (years)"
            value={loanTerm}
            onChange={setLoanTerm}
            placeholder="Enter loan term"
          />

          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <p className="text-lg font-semibold">
              Monthly Payment: ₱{formatCurrency(results.monthlyPayment)}
            </p>
            <p className="text-lg font-semibold">
              Total Payment: ₱{formatCurrency(results.totalPayment)}
            </p>
            <p className="text-sm text-base-content/70 mt-2">
              Total Interest: ₱{formatCurrency(results.totalInterest)}
            </p>
          </div>

          <button className="btn btn-primary w-full mt-4" onClick={calculateLoan}>
            Calculate
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default LoanCalculator;
