import React, { useState, useMemo } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  CreditCard, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Sliders, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { OFFICIAL_CATEGORIES, type ExpenseCategory } from '../types/finora';

export const BudgetManagementView: React.FC = () => {
  const { transactions, budgets, setCategoryBudget } = useFinora();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [budgetLimitInput, setBudgetLimitInput] = useState<number>(5000);
  const [successMsg, setSuccessMsg] = useState('');

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  // Compute actual spending in current month for each category
  const actualCategorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    transactions
      .filter(t => t.type === 'debit')
      .forEach(t => {
        const d = new Date(t.date);
        if (!isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth) {
          map[t.category] = (map[t.category] || 0) + t.amount;
        } else {
          // Fallback if transaction dates are generic
          map[t.category] = (map[t.category] || 0) + t.amount;
        }
      });

    return map;
  }, [transactions]);

  // Merge official categories with budget limits
  const budgetRows = useMemo(() => {
    return OFFICIAL_CATEGORIES.map(category => {
      const budgetRecord = budgets.find(b => b.category === category);
      const limit = budgetRecord ? budgetRecord.monthlyLimit : 0;
      const spent = actualCategorySpending[category] || 0;
      const remaining = Math.max(0, limit - spent);
      const isOverbudget = limit > 0 && spent > limit;
      const pctUsed = limit > 0 ? Math.min(200, Math.round((spent / limit) * 100)) : 0;
      const isApproaching = limit > 0 && pctUsed >= 80 && pctUsed <= 100;

      return {
        category,
        limit,
        spent,
        remaining,
        pctUsed,
        isOverbudget,
        isApproaching
      };
    });
  }, [budgets, actualCategorySpending]);

  const totalPlannedBudget = budgetRows.reduce((acc, r) => acc + r.limit, 0);
  const totalActualSpent = budgetRows.reduce((acc, r) => acc + r.spent, 0);
  const totalOverbudgetCount = budgetRows.filter(r => r.isOverbudget).length;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setCategoryBudget(editingCategory, Number(budgetLimitInput), currentMonth);
    setSuccessMsg(`Budget for ${editingCategory} set to ${inr(budgetLimitInput)}!`);
    setEditingCategory(null);
    setTimeout(() => setSuccessMsg(''), 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Budget &amp; Cashflow Control
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Month: <strong>{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Monthly Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D66] mt-0.5">
            Set category-specific spending limits, track burn rate, and receive proactive alerts.
          </p>
        </div>

        {totalOverbudgetCount > 0 && (
          <div className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{totalOverbudgetCount} categories over planned limits!</span>
          </div>
        )}
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Total Planned Budget</span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalPlannedBudget > 0 ? inr(totalPlannedBudget) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">Across 13 expense categories</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Actual Total Spent</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {totalActualSpent > 0 ? inr(totalActualSpent) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">Current month transactions</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Remaining Budget Headroom</span>
          <div className={`text-xl sm:text-2xl font-black ${totalPlannedBudget >= totalActualSpent ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
            {totalPlannedBudget >= totalActualSpent ? inr(totalPlannedBudget - totalActualSpent) : `-${inr(totalActualSpent - totalPlannedBudget)}`}
          </div>
          <span className="text-[11px] text-[#5D6D66]">
            {totalPlannedBudget >= totalActualSpent ? 'Within monthly limits' : 'Overall deficit'}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* 13 CATEGORY BUDGET CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetRows.map(row => {
          return (
            <div 
              key={row.category} 
              className={`p-5 rounded-3xl border bg-white transition-all space-y-3 ${
                row.isOverbudget ? 'border-rose-300 shadow-sm' :
                row.isApproaching ? 'border-amber-300 shadow-sm' : 'border-[#E2E5E1]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0E2A1E]">{row.category}</h3>
                  <div className="text-xs text-[#5D6D66] mt-0.5">
                    Budget: <strong>{row.limit > 0 ? inr(row.limit) : 'No limit set'}</strong> • Spent: <strong>{inr(row.spent)}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingCategory(row.category);
                    setBudgetLimitInput(row.limit || 5000);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#E2E5E1] hover:bg-[#F6F6F2] text-[#0E2A1E] text-xs font-bold transition-all cursor-pointer"
                >
                  {row.limit > 0 ? 'Edit Limit' : 'Set Budget'}
                </button>
              </div>

              {/* Progress bar */}
              {row.limit > 0 ? (
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        row.isOverbudget ? 'bg-rose-500' :
                        row.isApproaching ? 'bg-amber-500' : 'bg-[#1F7A52]'
                      }`}
                      style={{ width: `${Math.min(100, row.pctUsed)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className={
                      row.isOverbudget ? 'text-rose-600' :
                      row.isApproaching ? 'text-amber-700' : 'text-[#1F7A52]'
                    }>
                      {row.pctUsed}% used
                    </span>
                    <span className="text-[#5D6D66]">
                      {row.isOverbudget ? (
                        <span className="text-rose-600">Overspent by {inr(row.spent - row.limit)}</span>
                      ) : (
                        <span>Remaining: {inr(row.remaining)}</span>
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#F6F6F2] text-xs text-[#5D6D66] font-medium">
                  Spent {inr(row.spent)} this month. Click "Set Budget" to assign a monthly threshold.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* EDIT BUDGET MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-[#101A15]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-extrabold text-[#0E2A1E]">Set Monthly Budget</h3>
                <p className="text-xs text-[#5D6D66]">{editingCategory}</p>
              </div>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Monthly Spending Limit (₹)</label>
                <input
                  type="number"
                  min="500"
                  step="100"
                  required
                  value={budgetLimitInput}
                  onChange={e => setBudgetLimitInput(Number(e.target.value))}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#E4F0E9] text-[11px] text-[#1F7A52] font-semibold">
                Finora will alert you when spending in <strong>{editingCategory}</strong> exceeds 80% and 100% of {inr(budgetLimitInput)}.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Budget
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
