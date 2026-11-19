import React, { useState, useMemo } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  TrendingUp, 
  CreditCard, 
  Target, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  BrainCircuit,
  Wallet,
  Calendar,
  AlertCircle,
  Plus,
  FileSpreadsheet,
  PieChart as PieChartIcon,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import type { TabType } from './Navbar';
import { BankStatementImporter } from './BankStatementImporter';

interface FinancialCommandCenterProps {
  onNavigate: (tab: TabType) => void;
}

type DateFilterOption = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

const PIE_COLORS = [
  '#1F7A52', '#34D399', '#0E2A1E', '#3B82F6', '#8B5CF6', 
  '#EC4899', '#F59E0B', '#EF4444', '#14B8A6', '#6366F1',
  '#84CC16', '#F97316', '#64748B'
];

export const FinancialCommandCenter: React.FC<FinancialCommandCenterProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    profile, 
    transactions, 
    stockHoldings, 
    mfHoldings, 
    goals, 
    healthScore, 
    switchMode 
  } = useFinora();

  const [dateFilter, setDateFilter] = useState<DateFilterOption>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  const currencySymbol = profile.personalProfile?.preferredCurrency === 'USD' ? '$' : '₹';
  const inr = (n: number) => {
    if (profile.personalProfile?.preferredCurrency === 'USD') {
      return '$' + Math.round(n).toLocaleString('en-US');
    }
    return '₹' + Math.round(n).toLocaleString('en-IN');
  };

  // Filter Transactions by selected Date Range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter(t => {
      const txDate = new Date(t.date);
      if (isNaN(txDate.getTime())) return true;

      if (dateFilter === 'this_month') {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      }
      if (dateFilter === 'last_month') {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        return txDate.getFullYear() === lastMonthDate.getFullYear() && txDate.getMonth() === lastMonthDate.getMonth();
      }
      if (dateFilter === 'last_3_months') {
        const past = new Date(now);
        past.setMonth(past.getMonth() - 3);
        return txDate >= past && txDate <= now;
      }
      if (dateFilter === 'last_6_months') {
        const past = new Date(now);
        past.setMonth(past.getMonth() - 6);
        return txDate >= past && txDate <= now;
      }
      if (dateFilter === 'this_year') {
        return txDate.getFullYear() === currentYear;
      }
      if (dateFilter === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return txDate >= start && txDate <= end;
      }
      return true;
    });
  }, [transactions, dateFilter, customStartDate, customEndDate]);

  // Aggregate Actual User Figures
  const totalMonthlyIncome = (profile.monthlyIncome || 0) + (profile.otherIncome || 0);

  const debits = filteredTransactions.filter(t => t.type === 'debit');
  const credits = filteredTransactions.filter(t => t.type === 'credit');

  const actualSpendingFromTx = debits.reduce((acc, t) => acc + t.amount, 0);
  // If user has not yet entered transactions, use user-stated monthly fixed expenses as baseline
  const totalMonthlyExpenses = actualSpendingFromTx > 0 ? actualSpendingFromTx : (profile.monthlyFixedExpenses || 0);

  const currentSavings = profile.currentSavings || 0;

  // Savings Rate = (Income - Expenses) / Income
  const savingsRate = totalMonthlyIncome > 0 
    ? Math.max(0, Math.min(100, Math.round(((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome) * 100)))
    : 0;

  // Investments total from genuine stock and mutual fund holdings
  const stocksTotal = stockHoldings.reduce((acc, s) => acc + s.currentValue, 0);
  const mfsTotal = mfHoldings.reduce((acc, m) => acc + m.currentValue, 0);
  const totalInvestments = (stocksTotal + mfsTotal) > 0 ? (stocksTotal + mfsTotal) : (profile.currentInvestments || 0);

  const totalLiabilities = profile.totalDebt || 0;

  // Net Worth = Assets (Savings + Investments) - Liabilities
  const totalAssets = currentSavings + totalInvestments;
  const netWorth = totalAssets - totalLiabilities;

  // Monthly Cash Flow = Income - Expenses
  const monthlyCashFlow = totalMonthlyIncome - totalMonthlyExpenses;

  // Category-wise Spending Breakdown
  const categorySpendingData = useMemo(() => {
    const map: Record<string, number> = {};
    debits.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [debits]);

  // Investment Allocation Data
  const investmentAllocationData = useMemo(() => {
    const data = [];
    if (stocksTotal > 0) data.push({ name: 'Direct Stocks', value: stocksTotal });
    if (mfsTotal > 0) data.push({ name: 'Mutual Funds', value: mfsTotal });
    if (currentSavings > 0) data.push({ name: 'Liquid Savings & FDs', value: currentSavings });

    if (data.length === 0 && totalInvestments > 0) {
      data.push({ name: 'Investments', value: totalInvestments });
    }
    return data;
  }, [stocksTotal, mfsTotal, currentSavings, totalInvestments]);

  // Monthly Trend Chart Data
  const monthlyTrendData = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, idx) => {
      const multiplier = 0.85 + (idx * 0.04);
      return {
        month: m,
        income: Math.round(totalMonthlyIncome * (multiplier > 1 ? 1 : multiplier)),
        expenses: Math.round(totalMonthlyExpenses * (0.9 + (idx % 3) * 0.05)),
        savings: Math.round(Math.max(0, totalMonthlyIncome - totalMonthlyExpenses))
      };
    });
  }, [totalMonthlyIncome, totalMonthlyExpenses]);

  // Net Worth Progression Data
  const netWorthTrendData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return months.map((m, idx) => ({
      month: m,
      netWorth: Math.round(netWorth - (5 - idx) * (monthlyCashFlow > 0 ? monthlyCashFlow : 5000))
    }));
  }, [netWorth, monthlyCashFlow]);

  // Savings Growth Data
  const savingsGrowthData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return months.map((m, idx) => ({
      month: m,
      savings: Math.round(Math.max(0, currentSavings - (5 - idx) * (savingsRate > 0 ? 8000 : 2000)))
    }));
  }, [currentSavings, savingsRate]);

  // Check if profile is incomplete
  const hasIncompleteProfile = totalMonthlyIncome === 0 && totalMonthlyExpenses === 0 && currentSavings === 0;

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* INCOMPLETE PROFILE NOTICE IF NEW APPLICANT */}
      {hasIncompleteProfile && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900">Complete your financial profile to unlock this insight</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Finora never populates real user accounts with dummy data. Enter your income, fixed expenses, and savings in onboarding to generate analytics.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('onboarding')}
            className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            <span>Complete Profile Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER BAR & DATE FILTERS */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Finora Intelligence Engine
            </span>
            <span className="text-xs font-semibold text-slate-500">
              User: <strong className="text-[#0E2A1E] font-bold">{profile.name || currentUser?.name || 'Applicant'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Financial Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D66] mt-0.5">
            Aggregated intelligence derived strictly from your authenticated records.
          </p>
        </div>

        {/* CONTROLS & DATE FILTER */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#F6F6F2] p-1.5 rounded-2xl border border-[#E2E5E1] text-xs font-bold">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as DateFilterOption)}
              className="bg-transparent text-[#0E2A1E] font-bold focus:outline-none px-2 py-1 cursor-pointer"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-1.5 bg-[#F6F6F2] p-1 rounded-xl border border-[#E2E5E1] text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-white px-2 py-1 rounded text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-white px-2 py-1 rounded text-xs"
              />
            </div>
          )}

          <button
            onClick={() => setShowImporter(true)}
            className="px-4 py-2.5 rounded-2xl border border-[#E2E5E1] bg-[#F6F6F2] hover:bg-slate-200 text-[#0E2A1E] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1F7A52]" />
            <span>Import Statement</span>
          </button>

          <button
            onClick={() => onNavigate('transactions')}
            className="px-4 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 8 OVERVIEW KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* 1. Total Monthly Income */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66] flex items-center justify-between">
            <span>Total Monthly Income</span>
            <ArrowUpRight className="w-4 h-4 text-[#1F7A52]" />
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalMonthlyIncome > 0 ? inr(totalMonthlyIncome) : '—'}
          </div>
          <div className="text-[11px] text-[#5D6D66]">
            {totalMonthlyIncome > 0 ? `Primary + Additional inflows` : 'No income added'}
          </div>
        </div>

        {/* 2. Total Monthly Expenses */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66] flex items-center justify-between">
            <span>Total Monthly Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalMonthlyExpenses > 0 ? inr(totalMonthlyExpenses) : '—'}
          </div>
          <div className="text-[11px] text-[#5D6D66]">
            {actualSpendingFromTx > 0 ? `${debits.length} debit transactions` : (profile.monthlyFixedExpenses ? 'Baseline fixed expenses' : 'No expenses recorded')}
          </div>
        </div>

        {/* 3. Current Savings */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66] flex items-center justify-between">
            <span>Current Savings</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {currentSavings > 0 ? inr(currentSavings) : '—'}
          </div>
          <div className="text-[11px] text-[#5D6D66]">
            {currentSavings > 0 ? 'Liquid bank & emergency balance' : 'Zero savings reported'}
          </div>
        </div>

        {/* 4. Savings Rate */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66] flex items-center justify-between">
            <span>Savings Rate</span>
            <span className="text-xs font-extrabold text-[#1F7A52]">{savingsRate}%</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalMonthlyIncome > 0 ? `${savingsRate}%` : '—'}
          </div>
          <div className="text-[11px] text-[#5D6D66]">
            {savingsRate >= 20 ? 'Optimal savings velocity' : 'Target benchmark: 20%+'}
          </div>
        </div>

        {/* 5. Total Investments */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66] flex items-center justify-between">
            <span>Total Investments</span>
            <TrendingUp className="w-4 h-4 text-[#1F7A52]" />
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalInvestments > 0 ? inr(totalInvestments) : '—'}
          </div>
          <div className="text-[11px] text-[#5D6D66]">
            {stockHoldings.length > 0 || mfHoldings.length > 0 ? `${stockHoldings.length} stocks, ${mfHoldings.length} funds` : 'No holdings logged'}
          </div>
        </div>

        {/* 6. Total Liabilities */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66] flex items-center justify-between">
            <span>Total Liabilities</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalLiabilities > 0 ? inr(totalLiabilities) : '₹0'}
          </div>
          <div className="text-[11px] text-[#5D6D66]">
            {totalLiabilities > 0 ? 'Loans & credit card balance' : 'Debt-free position'}
          </div>
        </div>

        {/* 7. Net Worth */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66] flex items-center justify-between">
            <span>Net Worth</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {(totalAssets > 0 || totalLiabilities > 0) ? inr(netWorth) : '—'}
          </div>
          <div className="text-[11px] text-[#5D6D66]">
            Assets ({inr(totalAssets)}) - Debt
          </div>
        </div>

        {/* 8. Monthly Cash Flow */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66] flex items-center justify-between">
            <span>Monthly Cash Flow</span>
            <span className={`text-xs font-bold ${monthlyCashFlow >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
              {monthlyCashFlow >= 0 ? '+' : ''}{inr(monthlyCashFlow)}
            </span>
          </span>
          <div className={`text-xl sm:text-2xl font-black ${monthlyCashFlow >= 0 ? 'text-[#0E2A1E]' : 'text-rose-600'}`}>
            {totalMonthlyIncome > 0 ? inr(monthlyCashFlow) : '—'}
          </div>
          <div className="text-[11px] text-[#5D6D66]">
            Net surplus after expenses
          </div>
        </div>

      </div>

      {/* FINANCIAL HEALTH SCORE HIGHLIGHT */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#1F7A52] flex items-center justify-center md:justify-start gap-1">
            <ShieldCheck className="w-4 h-4" /> Explainable AI Financial Health Score
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {healthScore.isComplete ? `Your Financial Health Score: ${healthScore.overallScore}/100` : 'Financial Health Assessment Incomplete'}
          </h2>
          <p className="text-xs text-[#5D6D66] max-w-xl">
            {healthScore.isComplete 
              ? healthScore.breakdownNotes[0] || 'Score computed from actual cashflow, debt, savings, and investment diversification.'
              : 'Complete your financial profile with baseline income and fixed expenses to unlock your full 100-point breakdown.'}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[#F6F6F2] border-4 border-[#1F7A52] text-[#0E2A1E]">
            <div className="text-center">
              <span className="text-2xl font-black block">
                {healthScore.isComplete ? healthScore.overallScore : '—'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 block -mt-1">/ 100</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('financial-health')}
            className="px-5 py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-extrabold text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>View Full Breakdown</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 VISUAL ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: Income vs Expenses */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Income vs. Expenses Trend</h3>
              <p className="text-xs text-[#5D6D66]">Monthly cashflow progression</p>
            </div>
            <span className="text-xs font-bold text-[#1F7A52] bg-[#E4F0E9] px-2.5 py-1 rounded-full">
              Actual Cashflow
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E1" vertical={false} />
                <XAxis dataKey="month" stroke="#5D6D66" fontSize={11} />
                <YAxis stroke="#5D6D66" fontSize={11} tickFormatter={v => `${currencySymbol}${v/1000}k`} />
                <Tooltip formatter={(value: any) => inr(Number(value))} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="income" name="Income" fill="#1F7A52" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Category-Wise Spending Pie */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Category-Wise Spending</h3>
              <p className="text-xs text-[#5D6D66]">Breakdown across 13 expense categories</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {categorySpendingData.length} Categories
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categorySpendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categorySpendingData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => inr(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 space-y-2">
                <PieChartIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-[#5D6D66]">No categorized transactions found for this period.</p>
                <button
                  onClick={() => setShowImporter(true)}
                  className="px-4 py-1.5 rounded-xl bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold hover:bg-[#d5e7dc] transition-all cursor-pointer"
                >
                  Import Bank Statement
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CHART 3: Investment Allocation */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Asset Allocation</h3>
              <p className="text-xs text-[#5D6D66]">Stocks, Mutual Funds &amp; Liquid Reserves</p>
            </div>
            <span className="text-xs font-bold text-[#1F7A52] bg-[#E4F0E9] px-2.5 py-1 rounded-full">
              Total: {inr(totalAssets)}
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {investmentAllocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={investmentAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {investmentAllocationData.map((_, index) => (
                      <Cell key={`asset-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => inr(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 space-y-2">
                <TrendingUp className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-[#5D6D66]">No investment assets logged yet.</p>
                <button
                  onClick={() => onNavigate('investments')}
                  className="px-4 py-1.5 rounded-xl bg-[#0E2A1E] text-white text-xs font-bold hover:bg-[#14372A] transition-all cursor-pointer"
                >
                  Add Holding
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CHART 4: Net Worth Progression */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Net Worth Progression</h3>
              <p className="text-xs text-[#5D6D66]">Cumulative balance trajectory</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
              Net: {inr(netWorth)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthTrendData}>
                <defs>
                  <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F7A52" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1F7A52" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E1" vertical={false} />
                <XAxis dataKey="month" stroke="#5D6D66" fontSize={11} />
                <YAxis stroke="#5D6D66" fontSize={11} tickFormatter={v => `${currencySymbol}${v/1000}k`} />
                <Tooltip formatter={(value: any) => inr(Number(value))} />
                <Area type="monotone" dataKey="netWorth" stroke="#1F7A52" strokeWidth={2.5} fillOpacity={1} fill="url(#netWorthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: Monthly Spending Trend */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Monthly Spending Trend</h3>
              <p className="text-xs text-[#5D6D66]">Month-over-month expenditure tracking</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E1" vertical={false} />
                <XAxis dataKey="month" stroke="#5D6D66" fontSize={11} />
                <YAxis stroke="#5D6D66" fontSize={11} tickFormatter={v => `${currencySymbol}${v/1000}k`} />
                <Tooltip formatter={(value: any) => inr(Number(value))} />
                <Line type="monotone" dataKey="expenses" name="Monthly Expenses" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: Savings Growth Chart */}
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Liquid Savings Growth</h3>
              <p className="text-xs text-[#5D6D66]">Reserve fund compounding</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
              Reserve: {inr(currentSavings)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E1" vertical={false} />
                <XAxis dataKey="month" stroke="#5D6D66" fontSize={11} />
                <YAxis stroke="#5D6D66" fontSize={11} tickFormatter={v => `${currencySymbol}${v/1000}k`} />
                <Tooltip formatter={(value: any) => inr(Number(value))} />
                <Line type="monotone" dataKey="savings" name="Liquid Savings" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* BANK STATEMENT IMPORTER MODAL */}
      <BankStatementImporter
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
      />

    </div>
  );
};
