import React, { useState } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const FinancialMirrorAndHealthView: React.FC<{ initialTab?: 'mirror' | 'health' | 'networth' }> = ({ initialTab = 'health' }) => {
  const { profile, transactions, stockHoldings, mfHoldings, goals, healthScore } = useFinora();
  const [activeTab, setActiveTab] = useState<'mirror' | 'health' | 'networth'>(initialTab);

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const debits = transactions.filter(t => t.type === 'debit');
  const totalSpending = debits.reduce((acc, t) => acc + t.amount, 0) || profile.monthlyFixedExpenses || 0;
  const totalInvested = stockHoldings.reduce((acc, s) => acc + s.currentValue, 0) + mfHoldings.reduce((acc, m) => acc + m.currentValue, 0) || profile.currentInvestments || 0;
  const totalGoalContrib = goals.reduce((acc, g) => acc + g.monthlyContribution, 0);
  const totalSaved = profile.currentSavings || 0;
  const totalIncome = (profile.monthlyIncome || 0) + (profile.otherIncome || 0);

  const totalAssets = totalSaved + totalInvested;
  const netWorth = totalAssets - (profile.totalDebt || 0);

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER BAND */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Explainable Financial Health Model
            </span>
            <span className="text-xs font-semibold text-slate-500">
              100-Point Algorithmic Framework
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Financial Health Score &amp; Mirror
          </h1>
          <p className="text-sm text-[#5D6D66] mt-1">
            6 core pillars evaluating actual cashflow, debt burden, emergency reserves, and goal trajectory.
          </p>
        </div>

        <div className="flex bg-[#F6F6F2] p-1 rounded-2xl border border-[#E2E5E1]">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'health' ? 'bg-[#0E2A1E] text-white shadow-sm' : 'text-[#5D6D66] hover:text-[#101A15]'
            }`}
          >
            Health Score ({healthScore.isComplete ? `${healthScore.overallScore}/100` : 'Incomplete'})
          </button>
          <button
            onClick={() => setActiveTab('mirror')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'mirror' ? 'bg-[#0E2A1E] text-white shadow-sm' : 'text-[#5D6D66] hover:text-[#101A15]'
            }`}
          >
            Financial Mirror
          </button>
          <button
            onClick={() => setActiveTab('networth')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'networth' ? 'bg-[#0E2A1E] text-white shadow-sm' : 'text-[#5D6D66] hover:text-[#101A15]'
            }`}
          >
            Net Worth Statement
          </button>
        </div>
      </div>

      {/* HEALTH SCORE TAB */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          
          {/* INCOMPLETE ASSESSMENT NOTICE */}
          {!healthScore.isComplete ? (
            <div className="bg-white border border-amber-200 rounded-3xl p-8 shadow-sm space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-amber-950">
                  Complete your financial profile to unlock this insight
                </h3>
                <p className="text-xs text-[#5D6D66] max-w-md mx-auto">
                  Finora does not assign arbitrary or fabricated health scores. We require verified user inputs for: <strong>{healthScore.missingFields.join(', ')}</strong>.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] text-xs text-[#5D6D66] max-w-md mx-auto text-left space-y-1">
                <span className="font-bold text-[#0E2A1E] block">Required baseline figures:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Monthly primary take-home income</li>
                  <li>Monthly fixed household expenses or rent</li>
                  <li>Liquid savings and emergency fund balance</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* SCORE HERO BANNER */}
              <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#1F7A52]">
                    Total Aggregate Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#0E2A1E]">{healthScore.overallScore}</span>
                    <span className="text-slate-400 font-bold text-sm">/ 100</span>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E4F0E9] text-[#1F7A52]">
                      {healthScore.overallScore >= 80 ? 'Excellent Discipline' : healthScore.overallScore >= 65 ? 'Good Progress' : 'Needs Optimization'}
                    </span>
                  </div>
                  {healthScore.scoreChangeReason && (
                    <p className="text-xs text-[#1F7A52] font-semibold">{healthScore.scoreChangeReason}</p>
                  )}
                </div>

                <div className="w-full sm:w-auto p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] text-xs space-y-1 sm:max-w-xs">
                  <span className="font-bold text-[#0E2A1E] block">Top Actionable Recommendation:</span>
                  <p className="text-[#5D6D66]">{healthScore.recommendations[0]}</p>
                </div>
              </div>

              {/* 6 CONFIGURED HEALTH COMPONENTS (100 PTS TOTAL) */}
              <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#0E2A1E]">6-Pillar Score Breakdown</h3>
                  <p className="text-xs text-[#5D6D66]">Deterministic points calculated exclusively from your actual numbers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* 1. Savings Behaviour: 25 pts */}
                  <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-xs text-[#0E2A1E]">1. Savings Behaviour</span>
                      <strong className="text-xs text-[#1F7A52]">{healthScore.savingsScore} / 25 pts</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#1F7A52]" style={{ width: `${(healthScore.savingsScore / 25) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-[#5D6D66]">
                      Evaluates monthly savings rate. 20%+ gets top points.
                    </p>
                  </div>

                  {/* 2. Debt Management: 20 pts */}
                  <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-xs text-[#0E2A1E]">2. Debt Management</span>
                      <strong className="text-xs text-[#1F7A52]">{healthScore.debtScore} / 20 pts</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#1F7A52]" style={{ width: `${(healthScore.debtScore / 20) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-[#5D6D66]">
                      Debt-to-income and credit dues ratio.
                    </p>
                  </div>

                  {/* 3. Emergency Fund: 20 pts */}
                  <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-xs text-[#0E2A1E]">3. Emergency Fund</span>
                      <strong className="text-xs text-[#1F7A52]">{healthScore.emergencyFundScore} / 20 pts</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#1F7A52]" style={{ width: `${(healthScore.emergencyFundScore / 20) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-[#5D6D66]">
                      Liquid runway coverage against fixed expenses.
                    </p>
                  </div>

                  {/* 4. Spending Discipline: 15 pts */}
                  <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-xs text-[#0E2A1E]">4. Spending Discipline</span>
                      <strong className="text-xs text-[#1F7A52]">{healthScore.spendingScore} / 15 pts</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#1F7A52]" style={{ width: `${(healthScore.spendingScore / 15) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-[#5D6D66]">
                      Budget adherence and discretionary spend limits.
                    </p>
                  </div>

                  {/* 5. Investment Diversification: 10 pts */}
                  <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-xs text-[#0E2A1E]">5. Asset Diversification</span>
                      <strong className="text-xs text-[#1F7A52]">{healthScore.diversificationScore} / 10 pts</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#1F7A52]" style={{ width: `${(healthScore.diversificationScore / 10) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-[#5D6D66]">
                      Allocation across equities, funds, gold, and debt.
                    </p>
                  </div>

                  {/* 6. Financial Goal Progress: 10 pts */}
                  <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-xs text-[#0E2A1E]">6. Financial Goal Progress</span>
                      <strong className="text-xs text-[#1F7A52]">{healthScore.goalsScore} / 10 pts</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#1F7A52]" style={{ width: `${(healthScore.goalsScore / 10) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-[#5D6D66]">
                      Active milestones with monthly SIP commitments.
                    </p>
                  </div>

                </div>

                {/* Score Breakdown Observations */}
                <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
                  <span className="text-xs font-bold text-[#0E2A1E] block">Score Observations:</span>
                  <ul className="text-xs text-[#5D6D66] space-y-1 list-disc pl-4">
                    {healthScore.breakdownNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* REGULATORY DISCLAIMER */}
          <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] text-[11px] text-slate-500 leading-relaxed">
            <strong>Regulatory &amp; Analytical Disclaimer:</strong> The Finora Financial Health Score is an algorithmic educational assessment based exclusively on self-reported and connected transaction data. It is not an official statutory credit score (e.g. CIBIL, Experian, Equifax) and does not guarantee financial performance or credit approvals.
          </div>

        </div>
      )}

      {/* FINANCIAL MIRROR TAB */}
      {activeTab === 'mirror' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-4 border-b border-[#E2E5E1]">
              <span className="text-xs font-extrabold uppercase text-[#1F7A52] tracking-wider block">Monthly Narrative</span>
              <h2 className="text-2xl font-black text-[#0E2A1E]">YOUR FINANCIAL MIRROR</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] font-bold text-[#5D6D66] block uppercase">Income</span>
                <strong className="text-lg font-black text-[#0E2A1E]">{inr(totalIncome)}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] font-bold text-[#5D6D66] block uppercase">Spent</span>
                <strong className="text-lg font-black text-rose-600">{inr(totalSpending)}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] font-bold text-[#5D6D66] block uppercase">Invested</span>
                <strong className="text-lg font-black text-[#1F7A52]">{inr(totalInvested)}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] font-bold text-[#5D6D66] block uppercase">Saved</span>
                <strong className="text-lg font-black text-[#0E2A1E]">{inr(totalSaved)}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1]">
                <span className="text-[10px] font-bold text-[#5D6D66] block uppercase">Goal Contrib</span>
                <strong className="text-lg font-black text-amber-600">{inr(totalGoalContrib)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0E2A1E]">
                  <Activity className="w-4 h-4 text-blue-600" /> WHAT CHANGED?
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>Total cash inflow is {inr(totalIncome)}.</li>
                  <li>Total monthly debits tracked: {inr(totalSpending)}.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1F7A52]">
                  <CheckCircle2 className="w-4 h-4" /> WHAT IS GOING WELL?
                </div>
                <ul className="text-xs text-[#1F7A52] space-y-1.5 list-disc pl-4">
                  <li>{goals.length} active financial milestones being tracked.</li>
                  <li>Liquid reserves cover {((totalSaved / Math.max(1, totalSpending))).toFixed(1)} months of expenses.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> WHAT NEEDS ATTENTION?
                </div>
                <ul className="text-xs text-amber-900 space-y-1.5 list-disc pl-4">
                  <li>Ensure all monthly subscriptions are reviewed in Expenses view.</li>
                  <li>Total debt remaining: {inr(profile.totalDebt || 0)}.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NET WORTH STATEMENT TAB */}
      {activeTab === 'networth' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E5E1]">
            <div>
              <h2 className="text-xl font-black text-[#0E2A1E]">Net Worth Statement</h2>
              <p className="text-xs text-[#5D6D66]">Net Worth = Total Assets - Total Liabilities</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[#1F7A52]">{inr(netWorth)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-[#1F7A52]">ASSETS ({inr(totalAssets)})</h3>
              <div className="space-y-2 text-xs text-[#0E2A1E]">
                <div className="flex justify-between py-1 border-b border-[#1F7A52]/20">
                  <span>Liquid Cash &amp; Bank Savings</span>
                  <strong className="font-bold">{inr(totalSaved)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1F7A52]/20">
                  <span>Investment Holdings (Stocks &amp; Mutual Funds)</span>
                  <strong className="font-bold">{inr(totalInvested)}</strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-rose-900">LIABILITIES ({inr(profile.totalDebt || 0)})</h3>
              <div className="space-y-2 text-xs text-rose-900">
                <div className="flex justify-between py-1 border-b border-rose-200">
                  <span>Outstanding Loans &amp; Credit Card Dues</span>
                  <strong className="font-bold">{inr(profile.totalDebt || 0)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
