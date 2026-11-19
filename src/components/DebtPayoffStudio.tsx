import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingDown, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Snowflake,
  ArrowRight
} from 'lucide-react';

export interface DebtItem {
  id: string;
  name: string;
  category: 'credit_card' | 'personal_loan' | 'home_loan' | 'car_loan';
  balance: number;
  aprPercent: number;
  minimumPayment: number;
}

const INITIAL_DEBTS: DebtItem[] = [
  {
    id: 'd1',
    name: 'HDFC Regalia Credit Card',
    category: 'credit_card',
    balance: 85000,
    aprPercent: 36, // 36% p.a.
    minimumPayment: 4500,
  },
  {
    id: 'd2',
    name: 'ICICI Personal Loan',
    category: 'personal_loan',
    balance: 320000,
    aprPercent: 14.5,
    minimumPayment: 9800,
  },
  {
    id: 'd3',
    name: 'SBI Auto Loan (Creta)',
    category: 'car_loan',
    balance: 480000,
    aprPercent: 8.8,
    minimumPayment: 11200,
  },
  {
    id: 'd4',
    name: 'Axis Home Loan EMI',
    category: 'home_loan',
    balance: 3800000,
    aprPercent: 8.5,
    minimumPayment: 32500,
  },
];

export const DebtPayoffStudio: React.FC = () => {
  const [debts, setDebts] = useState<DebtItem[]>(INITIAL_DEBTS);
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(10000); // ₹10,000 extra/mo

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCat, setNewCat] = useState<DebtItem['category']>('credit_card');
  const [newBalance, setNewBalance] = useState<number>(50000);
  const [newApr, setNewApr] = useState<number>(18);
  const [newMinPay, setNewMinPay] = useState<number>(2500);

  const inr = (n: number) => {
    const rounded = Math.round(n);
    return '₹' + rounded.toLocaleString('en-IN');
  };

  const totalBalance = debts.reduce((acc, d) => acc + d.balance, 0);
  const totalMinPayment = debts.reduce((acc, d) => acc + d.minimumPayment, 0);
  const totalMonthlyFund = totalMinPayment + extraMonthlyPayment;

  // Payoff Simulation Logic
  const simulatePayoff = (strat: 'avalanche' | 'snowball') => {
    let debtList = debts.map((d) => ({ ...d }));
    if (strat === 'avalanche') {
      debtList.sort((a, b) => b.aprPercent - a.aprPercent);
    } else {
      debtList.sort((a, b) => a.balance - b.balance);
    }

    let month = 0;
    let totalInterestPaid = 0;
    const maxMonths = 360; // 30 yrs cap

    while (debtList.some((d) => d.balance > 0) && month < maxMonths) {
      month++;
      let extraAvailable = extraMonthlyPayment;

      // 1. Accrue monthly interest & pay min payment
      debtList.forEach((d) => {
        if (d.balance > 0) {
          const monthlyInterest = (d.balance * (d.aprPercent / 100)) / 12;
          d.balance += monthlyInterest;
          totalInterestPaid += monthlyInterest;

          const pay = Math.min(d.balance, d.minimumPayment);
          d.balance -= pay;
        }
      });

      // 2. Apply extra payment to target debt (first active in sorted list)
      for (const d of debtList) {
        if (d.balance > 0 && extraAvailable > 0) {
          const payExtra = Math.min(d.balance, extraAvailable);
          d.balance -= payExtra;
          extraAvailable -= payExtra;
        }
      }
    }

    return {
      months: month,
      totalInterestPaid,
      payoffDate: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    };
  };

  const baselinePayoff = simulatePayoff('snowball'); // Baseline min payments
  const currentPayoff = simulatePayoff(strategy);

  const interestSaved = Math.max(0, baselinePayoff.totalInterestPaid - currentPayoff.totalInterestPaid);
  const monthsSaved = Math.max(0, baselinePayoff.months - currentPayoff.months);

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const d: DebtItem = {
      id: `d_${Date.now()}`,
      name: newName || 'New Loan Account',
      category: newCat,
      balance: Number(newBalance),
      aprPercent: Number(newApr),
      minimumPayment: Number(newMinPay),
    };
    setDebts([...debts, d]);
    setShowModal(false);
    setNewName('');
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" /> Debt Snowball vs Avalanche Engine
            </span>
            <span className="text-xs font-semibold text-slate-500">Accelerated Payoff Simulator</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0E2A1E] tracking-tight">
            Debt Payoff &amp; Loan Acceleration Studio
          </h1>
          <p className="text-sm text-[#5D6D66] mt-1 max-w-2xl">
            Simulate paying off loans, credit cards, and mortgages faster. Compare interest savings between interest-first (Avalanche) and balance-first (Snowball) strategies.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-bold text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Debt Account
        </button>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#5D6D66] uppercase block mb-1">Total Outstanding Debt</span>
          <div className="text-2xl font-black text-red-600">{inr(totalBalance)}</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{debts.length} active liability accounts</p>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#5D6D66] uppercase block mb-1">Projected Debt-Free Date</span>
          <div className="text-2xl font-black text-[#0E2A1E]">{currentPayoff.payoffDate}</div>
          <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {currentPayoff.months} months remaining
          </p>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#5D6D66] uppercase block mb-1">Total Interest Saved</span>
          <div className="text-2xl font-black text-[#1F7A52]">{inr(interestSaved)}</div>
          <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Via extra monthly payments
          </p>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#5D6D66] uppercase block mb-1">Total Monthly Budget</span>
          <div className="text-2xl font-black text-[#0E2A1E]">{inr(totalMonthlyFund)}<span className="text-xs font-medium text-slate-500">/mo</span></div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {inr(totalMinPayment)} min + {inr(extraMonthlyPayment)} extra
          </p>
        </div>

      </div>

      {/* STRATEGY SWITCHER & SLIDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT 7 COLS: DEBT LIST & CONTROLS */}
        <div className="lg:col-span-7 bg-white border border-[#E2E5E1] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E5E1]">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Choose Payoff Strategy</h3>
              <p className="text-xs text-[#5D6D66]">Select how extra monthly funds are distributed across debts</p>
            </div>

            <div className="flex bg-[#F6F6F2] p-1.5 rounded-2xl border border-[#E2E5E1] w-full sm:w-auto">
              <button
                onClick={() => setStrategy('avalanche')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  strategy === 'avalanche' ? 'bg-[#0E2A1E] text-white shadow-sm' : 'text-[#5D6D66] hover:text-[#101A15]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Avalanche (Highest APR)
              </button>
              <button
                onClick={() => setStrategy('snowball')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  strategy === 'snowball' ? 'bg-[#0E2A1E] text-white shadow-sm' : 'text-[#5D6D66] hover:text-[#101A15]'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5 text-blue-400" /> Snowball (Lowest Balance)
              </button>
            </div>
          </div>

          {/* EXTRA PAYMENT SLIDER */}
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#5D6D66]">Extra Monthly Payoff Booster</label>
              <span className="text-sm font-extrabold text-[#1F7A52]">+{inr(extraMonthlyPayment)}/month</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={extraMonthlyPayment}
              onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
              className="w-full accent-[#1F7A52] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
              <span>₹0 (Minimum only)</span>
              <span>₹25,000/mo extra</span>
              <span>₹50,000/mo extra</span>
            </div>
          </div>

          {/* DEBT ACCOUNTS LIST */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#0E2A1E] uppercase tracking-wider">Active Debt Accounts ({debts.length})</h4>

            {debts.map((d, idx) => (
              <div key={d.id} className="p-4 rounded-2xl bg-white border border-[#E2E5E1] hover:border-[#1F7A52]/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F6F6F2] text-[#0E2A1E] flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#0E2A1E]">{d.name}</h5>
                    <span className="text-[11px] text-[#5D6D66] font-semibold">{d.aprPercent}% APR interest rate</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between">
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-red-600">{inr(d.balance)}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Min: {inr(d.minimumPayment)}/mo</span>
                  </div>

                  <button
                    onClick={() => handleDeleteDebt(d.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT 5 COLS: STRATEGY COMPARISON & AI ADVISOR */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#0E2A1E] text-white rounded-3xl p-6 lg:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#34D399]" />
              <h3 className="text-base font-extrabold text-[#34D399]">AI Debt Payoff Recommendation</h3>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {strategy === 'avalanche' ? (
                <>
                  "The <strong className="text-[#34D399]">Avalanche Method</strong> targets high-interest debt first. By directing your {inr(extraMonthlyPayment)} extra payment to the {debts[0]?.name || 'Credit Card'} ({debts[0]?.aprPercent}% APR), you save an estimated <strong className="text-white underline">{inr(interestSaved)}</strong> in interest fees!"
                </>
              ) : (
                <>
                  "The <strong className="text-[#34D399]">Snowball Method</strong> clears smaller debt balances quickly. This builds psychological momentum by knocking out {debts.length} debt accounts in quick succession."
                </>
              )}
            </p>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Baseline Payoff Time:</span>
                <span className="font-bold">{baselinePayoff.months} Months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Accelerated Payoff Time:</span>
                <span className="font-bold text-[#34D399]">{currentPayoff.months} Months</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/15">
                <span className="text-slate-300">Total Months Saved:</span>
                <span className="font-black text-[#34D399]">-{monthsSaved} Months Faster!</span>
              </div>
            </div>

            <button
              onClick={() => setExtraMonthlyPayment((prev) => prev + 5000)}
              className="w-full py-3 rounded-xl bg-[#1F7A52] hover:bg-[#279464] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" /> Add +₹5,000/mo Extra Payment Booster
            </button>
          </div>

        </div>

      </div>

      {/* ADD DEBT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-md w-full p-6 lg:p-8 shadow-2xl space-y-5 text-[#101A15]">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-[#0E2A1E]">Add Debt Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Credit Card"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Debt Type</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as DebtItem['category'])}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                >
                  <option value="credit_card">Credit Card (High APR)</option>
                  <option value="personal_loan">Personal Unsecured Loan</option>
                  <option value="car_loan">Car / Vehicle Loan</option>
                  <option value="home_loan">Home Loan / Mortgage</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Current Balance</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="5000"
                    value={newBalance}
                    onChange={(e) => setNewBalance(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Annual APR %</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    step="0.5"
                    value={newApr}
                    onChange={(e) => setNewApr(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Minimum Monthly Payment</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={newMinPay}
                  onChange={(e) => setNewMinPay(Number(e.target.value))}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <span>Add Debt Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
