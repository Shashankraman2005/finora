import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Receipt
} from 'lucide-react';

export const TaxPlanner: React.FC = () => {
  // Salary Structure State
  const [grossSalary, setGrossSalary] = useState<number>(1800000); // ₹18,00,000 / yr
  const [basicSalary, setBasicSalary] = useState<number>(900000);  // ₹9,00,000 / yr
  const [rentPaidMonthly, setRentPaidMonthly] = useState<number>(25000); // ₹25,000 / mo
  const [isMetro, setIsMetro] = useState<boolean>(true);

  // Deductions State (Old Regime)
  const [sec80C, setSec80C] = useState<number>(150000); // EPF + PPF + ELSS (Max 1.5L)
  const [sec80D, setSec80D] = useState<number>(45000);  // Health Insurance (Self + Parents)
  const [sec80CCD, setSec80CCD] = useState<number>(50000); // NPS Additional (Max 50k)
  const [sec24b, setSec24b] = useState<number>(180000); // Home Loan Interest (Max 2L)
  const otherDeductions = 25000; // LTA / Savings interest / etc.

  // AI Optimizer Checkbox Toggles
  const [optNps, setOptNps] = useState<boolean>(sec80CCD >= 50000);
  const [opt80D, setOpt80D] = useState<boolean>(sec80D >= 50000);
  const [optElss, setOptElss] = useState<boolean>(sec80C >= 150000);

  const inr = (n: number) => {
    const rounded = Math.round(n);
    return '₹' + rounded.toLocaleString('en-IN');
  };

  // 1. Compute HRA Exemption (Old Regime)
  const computeHRAExemption = () => {
    const actualHraReceived = basicSalary * 0.4; // assume HRA is 40% of basic
    const rentMinus10PercentBasic = Math.max(0, rentPaidMonthly * 12 - basicSalary * 0.1);
    const metroPercentBasic = basicSalary * (isMetro ? 0.5 : 0.4);
    return Math.min(actualHraReceived, rentMinus10PercentBasic, metroPercentBasic);
  };

  const hraExemption = computeHRAExemption();
  const stdDeductionOld = 50000;
  const stdDeductionNew = 75000; // Updated FY 2024-25 Budget standard deduction

  // 2. Old Tax Regime Computation
  const totalOldDeductions = stdDeductionOld + hraExemption + Math.min(150000, sec80C) + Math.min(75000, sec80D) + Math.min(50000, sec80CCD) + Math.min(200000, sec24b) + otherDeductions;
  const taxableIncomeOld = Math.max(0, grossSalary - totalOldDeductions);

  const calculateOldTax = (income: number) => {
    if (income <= 250000) return 0;
    let tax = 0;
    if (income > 250000) tax += (Math.min(income, 500000) - 250000) * 0.05;
    if (income > 500000) tax += (Math.min(income, 1000000) - 500000) * 0.20;
    if (income > 1000000) tax += (income - 1000000) * 0.30;
    
    // Rebate 87A for Old Regime if income <= 5L
    if (income <= 500000) tax = 0;
    
    return tax * 1.04; // 4% Health & Education Cess
  };

  // 3. New Tax Regime Computation (FY 2024-25 / 2025-26 Slabs)
  const taxableIncomeNew = Math.max(0, grossSalary - stdDeductionNew);

  const calculateNewTax = (income: number) => {
    if (income <= 775000) return 0; // Sec 87A rebate covers up to ₹7L + ₹75k std deduction = ₹7.75L zero tax
    let tax = 0;
    // Slabs: 0-3L (0%), 3-7L (5%), 7-10L (10%), 10-12L (15%), 12-15L (20%), >15L (30%)
    if (income > 300000) tax += (Math.min(income, 700000) - 300000) * 0.05;
    if (income > 700000) tax += (Math.min(income, 1000000) - 700000) * 0.10;
    if (income > 1000000) tax += (Math.min(income, 1200000) - 1000000) * 0.15;
    if (income > 1200000) tax += (Math.min(income, 1500000) - 1200000) * 0.20;
    if (income > 1500000) tax += (income - 1500000) * 0.30;

    return tax * 1.04; // 4% Cess
  };

  const oldRegimeTax = calculateOldTax(taxableIncomeOld);
  const newRegimeTax = calculateNewTax(taxableIncomeNew);
  const isNewRegimeBetter = newRegimeTax < oldRegimeTax;
  const taxDifference = Math.abs(oldRegimeTax - newRegimeTax);

  // Take Home Salary Monthly
  const takeHomeOldMonthly = (grossSalary - oldRegimeTax) / 12;
  const takeHomeNewMonthly = (grossSalary - newRegimeTax) / 12;

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> FY 2024-25 / FY 2025-26 Tax Engine
            </span>
            <span className="text-xs font-semibold text-slate-500">Old vs New Tax Regime Comparator</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0E2A1E] tracking-tight">
            AI Tax Planning &amp; Deduction Optimizer
          </h1>
          <p className="text-sm text-[#5D6D66] mt-1 max-w-2xl">
            Simulate your gross income, HRA exemptions, Section 80C/80D/NPS deductions, and find out exactly which regime yields higher take-home pay.
          </p>
        </div>

        {/* BEST REGIME BADGE */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md flex-shrink-0 ${
          isNewRegimeBetter
            ? 'bg-[#0E2A1E] text-white border-[#0E2A1E]'
            : 'bg-[#1F7A52] text-white border-[#1F7A52]'
        }`}>
          <Zap className="w-6 h-6 text-[#34D399] flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">AI Recommended Regime</span>
            <span className="text-lg font-black">{isNewRegimeBetter ? 'New Tax Regime' : 'Old Tax Regime'}</span>
            <span className="text-xs text-[#34D399] font-bold block">Saves {inr(taxDifference)} / year!</span>
          </div>
        </div>
      </div>

      {/* REGIME SIDE BY SIDE COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* OLD REGIME CARD */}
        <div className={`bg-white border rounded-3xl p-6 lg:p-8 shadow-sm space-y-5 transition-all ${
          !isNewRegimeBetter ? 'ring-2 ring-[#1F7A52] border-[#1F7A52]' : 'border-[#E2E5E1]'
        }`}>
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E5E1]">
            <div>
              <span className="text-xs font-bold text-[#5D6D66] uppercase">Tax Regime A</span>
              <h3 className="text-xl font-black text-[#0E2A1E]">Old Tax Regime</h3>
            </div>
            {!isNewRegimeBetter && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Best Choice
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-dashed border-[#E2E5E1]">
              <span className="text-[#5D6D66] font-medium">Gross Annual Salary</span>
              <span className="font-bold text-[#101A15]">{inr(grossSalary)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dashed border-[#E2E5E1]">
              <span className="text-[#5D6D66] font-medium">Standard Deduction</span>
              <span className="font-bold text-emerald-600">-{inr(stdDeductionOld)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dashed border-[#E2E5E1]">
              <span className="text-[#5D6D66] font-medium">HRA Exemption Claimed</span>
              <span className="font-bold text-emerald-600">-{inr(hraExemption)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dashed border-[#E2E5E1]">
              <span className="text-[#5D6D66] font-medium">Total 80C + 80D + NPS + Sec 24</span>
              <span className="font-bold text-emerald-600">-{inr(totalOldDeductions - stdDeductionOld - hraExemption)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-sm text-[#0E2A1E]">
              <span>Taxable Net Income</span>
              <span>{inr(taxableIncomeOld)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#5D6D66]">Annual Tax Liability</span>
              <span className="text-xl font-black text-[#0E2A1E]">{inr(oldRegimeTax)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Monthly In-Hand Salary:</span>
              <strong className="text-[#101A15]">{inr(takeHomeOldMonthly)}/mo</strong>
            </div>
          </div>
        </div>

        {/* NEW REGIME CARD */}
        <div className={`bg-white border rounded-3xl p-6 lg:p-8 shadow-sm space-y-5 transition-all ${
          isNewRegimeBetter ? 'ring-2 ring-[#1F7A52] border-[#1F7A52]' : 'border-[#E2E5E1]'
        }`}>
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E5E1]">
            <div>
              <span className="text-xs font-bold text-[#5D6D66] uppercase">Tax Regime B</span>
              <h3 className="text-xl font-black text-[#0E2A1E]">New Tax Regime (Default)</h3>
            </div>
            {isNewRegimeBetter && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Best Choice
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-dashed border-[#E2E5E1]">
              <span className="text-[#5D6D66] font-medium">Gross Annual Salary</span>
              <span className="font-bold text-[#101A15]">{inr(grossSalary)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dashed border-[#E2E5E1]">
              <span className="text-[#5D6D66] font-medium">Standard Deduction (Budget 2024)</span>
              <span className="font-bold text-emerald-600">-{inr(stdDeductionNew)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dashed border-[#E2E5E1]">
              <span className="text-[#5D6D66] font-medium">HRA &amp; Section 80 Deductions</span>
              <span className="font-bold text-slate-400">Not Allowed (₹0)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dashed border-[#E2E5E1]">
              <span className="text-[#5D6D66] font-medium">Rebate Sec 87A Benefit</span>
              <span className="font-bold text-emerald-600">{taxableIncomeNew <= 775000 ? 'Full 100% Tax Exempt' : 'N/A (>₹7.75L)'}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-sm text-[#0E2A1E]">
              <span>Taxable Net Income</span>
              <span>{inr(taxableIncomeNew)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1F7A52]">Annual Tax Liability</span>
              <span className="text-xl font-black text-[#1F7A52]">{inr(newRegimeTax)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#1F7A52]/80 font-medium">
              <span>Monthly In-Hand Salary:</span>
              <strong className="text-[#0E2A1E]">{inr(takeHomeNewMonthly)}/mo</strong>
            </div>
          </div>
        </div>

      </div>

      {/* INPUT SLIDERS & CONTROLS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT 7 COLS: SALARY & DEDUCTION SLIDERS */}
        <div className="lg:col-span-7 bg-white border border-[#E2E5E1] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#1F7A52]" />
            <h3 className="text-base font-extrabold text-[#0E2A1E]">Salary Structure &amp; Exemption Sliders</h3>
          </div>

          <div className="space-y-5">
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#5D6D66]">Gross Annual Income (CTC / Invoice)</label>
                <span className="text-sm font-extrabold text-[#0E2A1E]">{inr(grossSalary)}</span>
              </div>
              <input
                type="range"
                min="500000"
                max="5000000"
                step="50000"
                value={grossSalary}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGrossSalary(val);
                  setBasicSalary(Math.round(val * 0.5));
                }}
                className="w-full accent-[#1F7A52] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#5D6D66]">Basic Salary (50% CTC)</label>
                  <span className="text-xs font-bold text-[#0E2A1E]">{inr(basicSalary)}</span>
                </div>
                <input
                  type="range"
                  min="200000"
                  max={grossSalary}
                  step="25000"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#5D6D66]">Monthly Rent Paid</label>
                  <span className="text-xs font-bold text-[#0E2A1E]">{inr(rentPaidMonthly)}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="2000"
                  value={rentPaidMonthly}
                  onChange={(e) => setRentPaidMonthly(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F6F6F2] border border-[#E2E5E1]">
              <input
                type="checkbox"
                id="metroCheck"
                checked={isMetro}
                onChange={(e) => setIsMetro(e.target.checked)}
                className="w-4 h-4 accent-[#1F7A52] rounded cursor-pointer"
              />
              <label htmlFor="metroCheck" className="text-xs font-bold text-[#101A15] cursor-pointer">
                Renting in Metro City (Mumbai, Delhi, Kolkata, Chennai - 50% HRA Slab)
              </label>
            </div>

            <hr className="border-[#E2E5E1]" />

            <h4 className="text-xs font-extrabold text-[#0E2A1E] uppercase tracking-wider">Old Regime Section 80 Exemptions</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#5D6D66]">Sec 80C (EPF/PPF/ELSS)</label>
                  <span className="text-xs font-bold text-[#0E2A1E]">{inr(sec80C)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="5000"
                  value={sec80C}
                  onChange={(e) => setSec80C(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#5D6D66]">Sec 80D Health Insurance</label>
                  <span className="text-xs font-bold text-[#0E2A1E]">{inr(sec80D)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="75000"
                  step="2500"
                  value={sec80D}
                  onChange={(e) => setSec80D(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#5D6D66]">Sec 80CCD(1B) NPS</label>
                  <span className="text-xs font-bold text-[#0E2A1E]">{inr(sec80CCD)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="5000"
                  value={sec80CCD}
                  onChange={(e) => setSec80CCD(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#5D6D66]">Sec 24(b) Home Loan Interest</label>
                  <span className="text-xs font-bold text-[#0E2A1E]">{inr(sec24b)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="10000"
                  value={sec24b}
                  onChange={(e) => setSec24b(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT 5 COLS: SMART AI TAX SAVER OPTIMIZER */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#0E2A1E] text-white rounded-3xl p-6 lg:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#34D399]" />
              <h3 className="text-base font-extrabold text-[#34D399]">AI Smart Tax Optimization Checklist</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Toggle these tax reduction strategies to see how much extra tax you can save:
            </p>

            <div className="space-y-3">
              <div 
                onClick={() => {
                  setOptNps(!optNps);
                  setSec80CCD(optNps ? 0 : 50000);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  optNps ? 'bg-white/15 border-[#34D399]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  optNps ? 'bg-[#34D399] border-[#34D399] text-[#0E2A1E]' : 'border-slate-400'
                }`}>
                  {optNps && <CheckCircle2 className="w-4 h-4 font-bold" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold">Invest ₹50,000 in Tier-1 NPS</h4>
                  <p className="text-[11px] text-slate-300">Saves up to ₹15,600 additional tax under Sec 80CCD(1B).</p>
                </div>
              </div>

              <div 
                onClick={() => {
                  setOpt80D(!opt80D);
                  setSec80D(opt80D ? 25000 : 50000);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  opt80D ? 'bg-white/15 border-[#34D399]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  opt80D ? 'bg-[#34D399] border-[#34D399] text-[#0E2A1E]' : 'border-slate-400'
                }`}>
                  {opt80D && <CheckCircle2 className="w-4 h-4 font-bold" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold">Add Parents Health Cover (Sec 80D)</h4>
                  <p className="text-[11px] text-slate-300">Unlocks extra ₹25,000/₹50,000 senior citizen health deduction.</p>
                </div>
              </div>

              <div 
                onClick={() => {
                  setOptElss(!optElss);
                  setSec80C(optElss ? 80000 : 150000);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  optElss ? 'bg-white/15 border-[#34D399]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  optElss ? 'bg-[#34D399] border-[#34D399] text-[#0E2A1E]' : 'border-slate-400'
                }`}>
                  {optElss && <CheckCircle2 className="w-4 h-4 font-bold" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold">Max Out Sec 80C to ₹1.5L Limit</h4>
                  <p className="text-[11px] text-slate-300">Via ELSS Tax Saver Funds or EPF contributions.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs space-y-1">
              <div className="text-slate-300">Calculated Effective Tax Rate:</div>
              <div className="text-2xl font-black text-[#34D399]">
                {((Math.min(oldRegimeTax, newRegimeTax) / grossSalary) * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-300">You retain <strong className="text-white">{((1 - Math.min(oldRegimeTax, newRegimeTax) / grossSalary) * 100).toFixed(1)}%</strong> of your gross salary.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
