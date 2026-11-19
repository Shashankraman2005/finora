import React, { useState } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import type { GoalItem } from '../types/finora';

export const GoalPlanner: React.FC = () => {
  const { goals, addGoal, deleteGoal, updateGoal } = useFinora();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goals[0]?.id || null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GoalItem['category']>('Emergency Fund');
  const [targetAmount, setTargetAmount] = useState<number>(300000);
  const [currentAmount, setCurrentAmount] = useState<number>(50000);
  const [targetDate, setTargetDate] = useState('2027-06-30');
  const [userMonthlyContrib, setUserMonthlyContrib] = useState<number | ''>('');

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || goals[0] || null;

  // Calculate required monthly contribution
  const computeRequiredMonthly = (target: number, current: number, dateStr: string) => {
    const now = new Date();
    const deadline = new Date(dateStr);
    const diffMonths = Math.max(1, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4)));
    const remaining = Math.max(0, target - current);
    return {
      monthsRemaining: diffMonths,
      requiredMonthly: Math.round(remaining / diffMonths),
      remaining
    };
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { monthsRemaining, requiredMonthly } = computeRequiredMonthly(targetAmount, currentAmount, targetDate);

    addGoal({
      name: name || 'New Financial Milestone',
      category,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      targetDate,
      monthlyContribution: userMonthlyContrib ? Number(userMonthlyContrib) : requiredMonthly,
      estimatedCompletionMonths: monthsRemaining
    });

    setShowAddModal(false);
    setName('');
  };

  const handleContribute = (goalId: string, deltaAmount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmt = goal.currentAmount + deltaAmount;
    updateGoal(goalId, { currentAmount: newAmt });
  };

  const totalTargetCorpus = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalAccumulatedSavings = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalMonthlyCommitment = goals.reduce((acc, g) => acc + g.monthlyContribution, 0);

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Smart Financial Goals Engine
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {goals.length} Active Targets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Financial Goals &amp; Life Milestones
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D66] mt-0.5">
            Target corpus planning, deadline calculations, and visual progress indicators.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#34D399]" /> Create Goal
        </button>
      </div>

      {/* SUMMARY KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Total Goal Target Corpus</span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalTargetCorpus > 0 ? inr(totalTargetCorpus) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">Sum of all milestone targets</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Accumulated Capital</span>
          <div className="text-xl sm:text-2xl font-black text-[#1F7A52]">
            {totalAccumulatedSavings > 0 ? inr(totalAccumulatedSavings) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">
            {totalTargetCorpus > 0 ? `${Math.round((totalAccumulatedSavings / totalTargetCorpus) * 100)}% overall funded` : 'No funds accumulated'}
          </span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Monthly Allocation Required</span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalMonthlyCommitment > 0 ? inr(totalMonthlyCommitment) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">Required monthly discipline</span>
        </div>
      </div>

      {/* GOAL CARDS LIST */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const { monthsRemaining, requiredMonthly } = computeRequiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate);

            return (
              <div 
                key={goal.id} 
                className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-[10px] font-bold">
                        {goal.category}
                      </span>
                      <span className="text-[10px] text-[#5D6D66] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {monthsRemaining} months left
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-[#0E2A1E] mt-1">{goal.name}</h3>
                  </div>

                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar & Amounts */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-[#1F7A52]">{inr(goal.currentAmount)}</span>
                    <span className="text-xs font-bold text-[#5D6D66]">Target: {inr(goal.targetAmount)}</span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#1F7A52] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#1F7A52]">{pct}% Completed</span>
                    <span className="text-slate-500">Remaining: {inr(remaining)}</span>
                  </div>
                </div>

                {/* Financial Insights Row */}
                <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#5D6D66]">Target Date:</span>
                    <strong className="text-[#0E2A1E]">{goal.targetDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5D6D66]">Required Monthly Savings:</span>
                    <strong className="text-[#1F7A52]">{inr(requiredMonthly)}/month</strong>
                  </div>
                </div>

                {/* Quick Add Funds Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#E2E5E1]">
                  <span className="text-[11px] font-bold text-[#5D6D66]">Quick Add:</span>
                  <button
                    onClick={() => handleContribute(goal.id, 5000)}
                    className="px-2.5 py-1 rounded-lg border border-[#E2E5E1] bg-[#F6F6F2] hover:bg-[#E4F0E9] text-[11px] font-bold text-[#1F7A52] transition-all cursor-pointer"
                  >
                    +₹5,000
                  </button>
                  <button
                    onClick={() => handleContribute(goal.id, 10000)}
                    className="px-2.5 py-1 rounded-lg border border-[#E2E5E1] bg-[#F6F6F2] hover:bg-[#E4F0E9] text-[11px] font-bold text-[#1F7A52] transition-all cursor-pointer"
                  >
                    +₹10,000
                  </button>
                  <button
                    onClick={() => handleContribute(goal.id, 25000)}
                    className="px-2.5 py-1 rounded-lg border border-[#E2E5E1] bg-[#F6F6F2] hover:bg-[#E4F0E9] text-[11px] font-bold text-[#1F7A52] transition-all cursor-pointer"
                  >
                    +₹25,000
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-12 text-center space-y-4">
          <Target className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[#0E2A1E]">No financial goals created yet</h3>
          <p className="text-xs text-[#5D6D66] max-w-sm mx-auto">
            Set milestone targets like an Emergency Fund, International Travel, Buying a Home, or FIRE Retirement.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold transition-all cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#34D399]" /> Create First Goal
          </button>
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-[#101A15]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-[#0E2A1E]">Create Smart Financial Goal</h3>
                <p className="text-xs text-[#5D6D66]">Set target corpus, deadline, and current savings.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. International Trip, Emergency Fund"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                >
                  <option value="Emergency Fund">Emergency Fund</option>
                  <option value="Car">Buying a Car</option>
                  <option value="House">Buying a House</option>
                  <option value="Higher Education">Higher Education</option>
                  <option value="International Travel">International Travel</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Wealth Creation">Wealth Creation</option>
                  <option value="Debt Repayment">Debt Repayment</option>
                  <option value="Custom">Custom Target</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={targetAmount}
                    onChange={e => setTargetAmount(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Current Savings (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentAmount}
                    onChange={e => setCurrentAmount(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                />
              </div>

              {/* Dynamic Required Monthly Calculation Preview */}
              <div className="p-3.5 rounded-2xl bg-[#E4F0E9] text-[#1F7A52] text-xs space-y-1">
                <span className="font-bold block">Finora Calculation:</span>
                <div>
                  Remaining: <strong>{inr(Math.max(0, targetAmount - currentAmount))}</strong>
                </div>
                <div>
                  Required Monthly Savings: <strong>{inr(computeRequiredMonthly(targetAmount, currentAmount, targetDate).requiredMonthly)}/month</strong>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-black text-xs shadow-md shadow-[#0E2A1E]/20 transition-all cursor-pointer"
              >
                Save Smart Goal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
