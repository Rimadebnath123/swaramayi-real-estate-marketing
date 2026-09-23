import React, { useState } from 'react';
import { Calculator, IndianRupee, Percent, Calendar } from 'lucide-react';

export default function EMICalculator({ defaultPrice = 7500000 }) {
  const [loanAmount, setLoanAmount] = useState(defaultPrice * 0.8);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  // Calculate EMI
  const calculateEMI = () => {
    const p = parseFloat(loanAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 12 / 100;
    const n = (parseFloat(tenureYears) || 0) * 12;

    if (p <= 0 || r <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    };
  };

  const { emi, totalInterest, totalPayment } = calculateEMI();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-navy-900">Home Loan EMI Calculator</h3>
          <p className="text-xs text-gray-500">Estimate your monthly home loan installment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Loan Amount</span>
              <span className="text-navy-900 font-bold">₹ {Number(loanAmount).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="500000"
              max="50000000"
              step="100000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full accent-gold-500"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Interest Rate (% p.a.)</span>
              <span className="text-navy-900 font-bold">{interestRate} %</span>
            </div>
            <input
              type="range"
              min="6"
              max="15"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full accent-gold-500"
            />
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Tenure (Years)</span>
              <span className="text-navy-900 font-bold">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className="w-full accent-gold-500"
            />
          </div>
        </div>

        {/* Results Box */}
        <div className="bg-navy-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-navy">
          <div>
            <div className="text-xs text-gold-400 font-bold uppercase tracking-wider mb-1">Estimated Monthly EMI</div>
            <div className="text-3xl font-black text-white mb-6">₹ {emi.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-400">/ month</span></div>

            <div className="space-y-3 pt-4 border-t border-gray-800 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Principal Amount:</span>
                <span className="font-semibold text-gray-200">₹ {Number(loanAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Interest Payable:</span>
                <span className="font-semibold text-gold-400">₹ {totalInterest.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount Payable:</span>
                <span className="font-semibold text-white">₹ {totalPayment.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <a
            href="tel:+918902130791"
            className="mt-6 w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-xs rounded-lg text-center transition-colors block"
          >
            Apply for Home Loan Assistance
          </a>
        </div>
      </div>
    </div>
  );
}
