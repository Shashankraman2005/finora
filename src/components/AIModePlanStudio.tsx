import React, { useState, useEffect } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  BrainCircuit, 
  CheckCircle2, 
  Sliders, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Target,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const AIModePlanStudio: React.FC = () => {
  const { profile, setProfile, switchMode } = useFinora();

  // Monthly Income State
  const [income, setIncome] = useState<number>(profile.monthlyIncome || 85000);

  // Core Allocation Percentages (Must sum to 100%)
  const [spendingPct, setSpendingPct] = useState<number>(30);    // 30%
  const [investmentPct, setInvestmentPct] = useState<number>(40);  // 40%
  const [savingsPct, setSavingsPct] = useState<number>(20);     // 20%
  const [goalsPct, setGoalsPct] = useState<number>(10);         // 10%

  // Granular Sub-Allocations (Editable Amounts)
  // Spending Subcategories
  const [foodDiningAmt, setFoodDiningAmt] = useState<number>(0);
  const [shoppingAmt, setShoppingAmt] = useState<number>(0);
  const [billsAmt, setBillsAmt] = useState<number>(0);
  const [entertainmentAmt, setEntertainmentAmt] = useState<number>(0);

  // Investments Subcategories
  const [stocksAmt, setStocksAmt] = useState<number>(0);
  const [mutualFundsAmt, setMutualFundsAmt] = useState<number>(0);
  const [goldAmt, setGoldAmt] = useState<number>(0);

  // Goal Subcategories
  const [emergencyGoalAmt, setEmergencyGoalAmt] = useState<number>(0);
  const [fireGoalAmt, setFireGoalAmt] = useState<number>(0);
  const [travelGoalAmt, setTravelGoalAmt] = useState<number>(0);

  const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  // Compute Absolute Amounts from Income & Percentages
  const spendingTotal = Math.round((income * spendingPct) / 100);
  const investmentTotal = Math.round((income * investmentPct) / 100);
  const savingsTotal = Math.round((income * savingsPct) / 100);
  const goalsTotal = Math.round((income * goalsPct) / 100);

  const totalPct = spendingPct + investmentPct + savingsPct + goalsPct;
  const isAllocationValid = totalPct === 100;

  // Auto-sync subcategories when top-level totals change
  useEffect(() => {
    // Spending Subcategories
    setFoodDiningAmt(Math.round(spendingTotal * 0.35));
    setShoppingAmt(Math.round(spendingTotal * 0.25));
    setBillsAmt(Math.round(spendingTotal * 0.25));
    setEntertainmentAmt(Math.round(spendingTotal * 0.15));

    // Investment Subcategories
    setStocksAmt(Math.round(investmentTotal * 0.40));
    setMutualFundsAmt(Math.round(investmentTotal * 0.45));
    setGoldAmt(Math.round(investmentTotal * 0.15));

    // Goals Subcategories
    setEmergencyGoalAmt(Math.round(goalsTotal * 0.50));
    setFireGoalAmt(Math.round(goalsTotal * 0.35));
    setTravelGoalAmt(Math.round(goalsTotal * 0.15));
  }, [income, spendingPct, investmentPct, savingsPct, goalsPct]);

  const handleRegenerateAI = () => {
    // AI Intelligent Allocation based on risk profile
    if (profile.riskPreference === 'Aggressive') {
      setSpendingPct(25);
      setInvestmentPct(50);
      setSavingsPct(15);
      setGoalsPct(10);
    } else if (profile.riskPreference === 'Conservative') {
      setSpendingPct(35);
      setInvestmentPct(25);
      setSavingsPct(30);
      setGoalsPct(10);
    } else {
      setSpendingPct(30);
      setInvestmentPct(40);
      setSavingsPct(20);
      setGoalsPct(10);
    }
    setIsPlanSaved(false);
  };

  const handleAcceptPlan = () => {
    setProfile((prev) => ({
      ...prev,
      monthlyIncome: income,
      monthlyFixedExpenses: spendingTotal,
      mode: 'ai',
    }));
    setIsPlanSaved(true);
    setTimeout(() => setIsPlanSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* BANNER HEADER */}
      <div className="bg-gradient-to-br from-[#0E2A1E] to-[#14372A] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#34D399]/20 text-[#34D399] text-xs font-bold flex items-center gap-1.5 border border-[#34D399]/30">
              <BrainCircuit className="w-3.5 h-3.5" /> AI Mode Financial Allocation Studio
            </span>
            <span className="text-xs text-slate-300 font-medium">Interactive &amp; Fully Editable Plan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Financial Allocation &amp; Plan Customizer
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Finora creates an initial AI allocation based on your income and risk profile. You have 100% full control to tweak, edit, and fine-tune every spending, investment, and savings limit.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleRegenerateAI}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#34D399]" /> Regenerate AI Default
          </button>
          <button
            onClick={() => switchMode('manual')}
            className="px-4 py-2.5 rounded-2xl bg-white text-[#0E2A1E] hover:bg-slate-100 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Sliders className="w-3.5 h-3.5" /> Switch to Manual Mode
          </button>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {isPlanSaved && (
        <div className="p-4 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 text-[#1F7A52] text-xs font-extrabold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#1F7A52]" />
          <span>🎉 AI Financial Plan Successfully Custom-Saved! Command Center and Dashboard metrics updated.</span>
        </div>
      )}

      {/* MONTHLY INCOME HEADER INPUT */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#5D6D66] uppercase block">Step 1: Set Monthly Income Basis</span>
            <h2 className="text-xl font-black text-[#0E2A1E]">Monthly Net Income</h2>
          </div>

          <div className="flex items-center gap-3 bg-[#F6F6F2] p-2 rounded-2xl border border-[#E2E5E1] w-full sm:w-auto">
            <span className="text-sm font-black text-[#1F7A52] pl-2">₹</span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="bg-white border border-[#E2E5E1] rounded-xl px-3 py-2 text-lg font-black text-[#0E2A1E] w-full sm:w-44 focus:outline-none focus:border-[#1F7A52]"
            />
            <span className="text-xs text-slate-500 font-bold pr-2">/month</span>
          </div>
        </div>
      </div>

      {/* ALLOCATION VALIDATION BADGE */}
      {!isAllocationValid && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Total Allocation percentage is {totalPct}% (Must equal exactly 100%). Adjust sliders below.</span>
        </div>
      )}

      {/* TOP-LEVEL EDITABLE ALLOCATION SLIDERS */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E2E5E1]">
          <div>
            <h3 className="text-lg font-black text-[#0E2A1E]">Step 2: Edit Primary Financial Allocation Sliders</h3>
            <p className="text-xs text-[#5D6D66]">Drag sliders to customize how your {inr(income)} monthly income is divided.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-extrabold">
            Total Allocated: {totalPct}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SPENDING SLIDER */}
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-500" />
                <label className="text-xs font-bold text-[#0E2A1E]">Monthly Spending</label>
              </div>
              <span className="text-xs font-black text-rose-600">{spendingPct}% ({inr(spendingTotal)})</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="1"
              value={spendingPct}
              onChange={(e) => setSpendingPct(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">Covers rent, food, bills, travel, and discretionary dining.</p>
          </div>

          {/* INVESTMENT SLIDER */}
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1F7A52]" />
                <label className="text-xs font-bold text-[#0E2A1E]">Monthly Investment</label>
              </div>
              <span className="text-xs font-black text-[#1F7A52]">{investmentPct}% ({inr(investmentTotal)})</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="1"
              value={investmentPct}
              onChange={(e) => setInvestmentPct(Number(e.target.value))}
              className="w-full accent-[#1F7A52] cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">Allocated to stocks, mutual funds SIPs, and gold.</p>
          </div>

          {/* SAVINGS / EMERGENCY SLIDER */}
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <label className="text-xs font-bold text-[#0E2A1E]">Savings / Emergency Fund</label>
              </div>
              <span className="text-xs font-black text-teal-700">{savingsPct}% ({inr(savingsTotal)})</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={savingsPct}
              onChange={(e) => setSavingsPct(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">Liquid cash buffer reserves for safety net.</p>
          </div>

          {/* GOALS SLIDER */}
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <label className="text-xs font-bold text-[#0E2A1E]">Financial Goals Allocation</label>
              </div>
              <span className="text-xs font-black text-amber-600">{goalsPct}% ({inr(goalsTotal)})</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={goalsPct}
              onChange={(e) => setGoalsPct(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">Dedicated contributions for FIRE, home downpayment, or vacation.</p>
          </div>

        </div>
      </div>

      {/* STEP 3: GRANULAR EDITABLE SUB-ALLOCATION BREAKDOWN */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#E2E5E1]">
          <h3 className="text-lg font-black text-[#0E2A1E]">Step 3: Granular Sub-Category Breakdown</h3>
          <p className="text-xs text-[#5D6D66]">Edit exact itemized monthly amounts for each category below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SPENDING BREAKDOWN */}
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E5E1] pb-2">
              <strong className="text-xs font-black text-rose-600 uppercase">🛒 Spending Items ({inr(spendingTotal)})</strong>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Food &amp; Dining</span>
                  <span className="text-[#0E2A1E]">{inr(foodDiningAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={spendingTotal}
                  step="500"
                  value={foodDiningAmt}
                  onChange={(e) => setFoodDiningAmt(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Shopping</span>
                  <span className="text-[#0E2A1E]">{inr(shoppingAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={spendingTotal}
                  step="500"
                  value={shoppingAmt}
                  onChange={(e) => setShoppingAmt(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Bills &amp; Utilities</span>
                  <span className="text-[#0E2A1E]">{inr(billsAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={spendingTotal}
                  step="500"
                  value={billsAmt}
                  onChange={(e) => setBillsAmt(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Entertainment &amp; Travel</span>
                  <span className="text-[#0E2A1E]">{inr(entertainmentAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={spendingTotal}
                  step="500"
                  value={entertainmentAmt}
                  onChange={(e) => setEntertainmentAmt(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* INVESTMENT BREAKDOWN */}
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E5E1] pb-2">
              <strong className="text-xs font-black text-[#1F7A52] uppercase">📈 Investment Items ({inr(investmentTotal)})</strong>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Mutual Funds SIP</span>
                  <span className="text-[#0E2A1E]">{inr(mutualFundsAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={investmentTotal}
                  step="500"
                  value={mutualFundsAmt}
                  onChange={(e) => setMutualFundsAmt(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Direct Equity Stocks</span>
                  <span className="text-[#0E2A1E]">{inr(stocksAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={investmentTotal}
                  step="500"
                  value={stocksAmt}
                  onChange={(e) => setStocksAmt(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Gold / SGB</span>
                  <span className="text-[#0E2A1E]">{inr(goldAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={investmentTotal}
                  step="500"
                  value={goldAmt}
                  onChange={(e) => setGoldAmt(Number(e.target.value))}
                  className="w-full accent-[#1F7A52] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* GOALS BREAKDOWN */}
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E5E1] pb-2">
              <strong className="text-xs font-black text-amber-600 uppercase">🎯 Goal Target Items ({inr(goalsTotal)})</strong>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Emergency Fund Contribution</span>
                  <span className="text-[#0E2A1E]">{inr(emergencyGoalAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={goalsTotal}
                  step="500"
                  value={emergencyGoalAmt}
                  onChange={(e) => setEmergencyGoalAmt(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>FIRE Retirement Target</span>
                  <span className="text-[#0E2A1E]">{inr(fireGoalAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={goalsTotal}
                  step="500"
                  value={fireGoalAmt}
                  onChange={(e) => setFireGoalAmt(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-bold">
                  <span>Travel &amp; Custom Target</span>
                  <span className="text-[#0E2A1E]">{inr(travelGoalAmt)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={goalsTotal}
                  step="500"
                  value={travelGoalAmt}
                  onChange={(e) => setTravelGoalAmt(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ACTION BAR: ACCEPT & APPLY PLAN */}
      <div className="bg-[#0E2A1E] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="text-base font-extrabold text-[#34D399]">Ready to Lock In Your Customized AI Plan?</h4>
          <p className="text-xs text-slate-300 mt-0.5">Applying this plan syncs your income, spending cap ({inr(spendingTotal)}), and investment velocity across Finora.</p>
        </div>

        <button
          onClick={handleAcceptPlan}
          className="px-8 py-3.5 rounded-2xl bg-[#34D399] hover:bg-[#22c55e] text-[#0E2A1E] font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer flex-shrink-0"
        >
          <Check className="w-4 h-4" />
          <span>Accept &amp; Apply AI Financial Plan</span>
        </button>
      </div>

    </div>
  );
};
