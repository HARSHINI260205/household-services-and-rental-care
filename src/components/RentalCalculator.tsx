import React, { useState } from 'react';
import { Tool } from '../types';
import { Calculator, ShieldCheck, AlertTriangle, CheckCircle, RefreshCcw, DollarSign } from 'lucide-react';

interface RentalCalculatorProps {
  tools: Tool[];
  preselectedTool?: Tool;
  onSelectToolForRent: (tool: Tool) => void;
}

export const RentalCalculator: React.FC<RentalCalculatorProps> = ({
  tools,
  preselectedTool,
  onSelectToolForRent
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(preselectedTool?.id || tools[0]?.id || 1);
  const [rentalDays, setRentalDays] = useState<number>(3);
  const [overdueDays, setOverdueDays] = useState<number>(0);
  const [damageCharge, setDamageCharge] = useState<number>(0);

  const currentTool = tools.find(t => t.id === Number(selectedToolId)) || tools[0];

  // Mathematical Formulations
  const baseDailyRate = currentTool.dailyRate;
  const originalDeposit = currentTool.securityDeposit;
  const rentalAmount = baseDailyRate * rentalDays;

  // Late fee: 1.5x daily rate for every overdue day
  const lateFeeRate = baseDailyRate * 1.5;
  const totalLateFee = overdueDays * lateFeeRate;

  // Total deductions from security deposit
  const totalDeductions = totalLateFee + damageCharge;

  // Net refundable deposit: max(0, originalDeposit - (lateFee + damageCharge))
  const refundableDeposit = Math.max(0, originalDeposit - totalDeductions);

  // Total initial customer outlay
  const initialPayable = rentalAmount + originalDeposit;

  // Final net cost to customer after return
  const netFinalCost = rentalAmount + Math.min(originalDeposit, totalDeductions);

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Transparent Equipment Escrow Engine
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Tool Deposit & Settlement Simulator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify exact rental fees, security deposits, overdue penalties (1.5x daily rate), and net refund calculations in real time.
            </p>
          </div>

          <button
            onClick={() => {
              setRentalDays(3);
              setOverdueDays(0);
              setDamageCharge(0);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left, Receipt Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
            
            {/* Tool Selection */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                1. Select Equipment Model
              </label>
              <select
                value={selectedToolId}
                onChange={e => setSelectedToolId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {tools.map(tool => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} (₹{tool.dailyRate}/day · ₹{tool.securityDeposit} deposit)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Tool Mini Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              <img
                src={currentTool.imageUrl}
                alt={currentTool.name}
                className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-200"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-900 block text-sm">{currentTool.name}</span>
                <span className="text-slate-500 block">{currentTool.category} · {currentTool.powerSource}</span>
                <div className="text-slate-700 font-num pt-1">
                  Daily Rate: <span className="font-bold text-slate-900">₹{currentTool.dailyRate}</span> · Security Deposit: <span className="font-bold text-amber-600">₹{currentTool.securityDeposit}</span>
                </div>
              </div>
            </div>

            {/* Rental Duration Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Planned Rental Duration:
                </label>
                <span className="text-base font-extrabold text-amber-600 font-num">
                  {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={rentalDays}
                onChange={e => setRentalDays(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-600 font-num mt-1">
                <span>1 Day</span>
                <span>7 Days (1 Week)</span>
                <span>14 Days (2 Weeks)</span>
              </div>
            </div>

            {/* Overdue / Late Days Slider */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>3. Overdue Return Simulator:</span>
                </label>
                <span className={`text-sm font-bold font-num ${overdueDays > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                  {overdueDays === 0 ? 'On-Time Return (0 days overdue)' : `+${overdueDays} Days Late`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={overdueDays}
                onChange={e => setOverdueDays(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-600 mt-1">
                Late fee formula: 1.5 × Daily Rate (₹{baseDailyRate}) = ₹{lateFeeRate}/day overdue penalty.
              </p>
            </div>

            {/* Damage Fee input */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                4. Tool Physical Damage Deduction (Optional Assessment):
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    max={originalDeposit}
                    value={damageCharge}
                    onChange={e => setDamageCharge(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-num text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="flex gap-1.5">
                  {[0, 50, 100, 200].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDamageCharge(val)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-num"
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Deductions are assessed by technicians upon return inspection.
              </p>
            </div>

          </div>
        </div>

        {/* Real-Time Mathematical Settlement Ledger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
            
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Official Settlement Statement
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Financial Breakdown
              </h3>
            </div>

            {/* Upfront charges */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Phase 1: Initial Handover Deposit
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Rental Fee ({rentalDays} days × ₹{baseDailyRate})</span>
                <span className="font-num text-white">₹{rentalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Refundable Security Deposit Escrow</span>
                <span className="font-num text-emerald-400">₹{originalDeposit}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                <span>Total Upfront Outlay</span>
                <span className="font-num text-amber-400 text-sm">₹{initialPayable}</span>
              </div>
            </div>

            {/* Return Deductions */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Phase 2: Post-Return Adjustments
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Overdue Late Fee ({overdueDays} days × ₹{lateFeeRate})</span>
                <span className={`font-num ${overdueDays > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                  - ₹{totalLateFee}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Equipment Damage / Deep Wash Deduction</span>
                <span className={`font-num ${damageCharge > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  - ₹{damageCharge}
                </span>
              </div>
            </div>

            {/* Net Refund Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/30 text-center space-y-1">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                Net Refund Returned to Customer Account
              </span>
              <div className="text-3xl font-black text-emerald-400 font-num">
                ₹{refundableDeposit}
              </div>
              <div className="text-[10px] text-slate-300">
                {refundableDeposit === originalDeposit
                  ? '✓ 100% Full deposit refunded with zero deductions.'
                  : `₹${totalDeductions} deducted for late fee or damage penalty.`}
              </div>
            </div>

            {/* Quick Action */}
            <div className="pt-2">
              <button
                onClick={() => onSelectToolForRent(currentTool)}
                className="w-full py-3 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow-md transition-all active:scale-95"
              >
                Proceed to Lease {currentTool.name.split(' ')[0]}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
