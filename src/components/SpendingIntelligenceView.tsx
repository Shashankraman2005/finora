import React, { useState, useMemo } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileSpreadsheet, 
  Flame,
  Zap,
  AlertTriangle,
  TrendingDown,
  Repeat,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OFFICIAL_CATEGORIES, type ExpenseCategory } from '../types/finora';
import { CategorizerService } from '../services/categorizerService';
import { BankStatementImporter } from './BankStatementImporter';

export const SpendingIntelligenceView: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    updateTransaction,
    learnCategoryOverride 
  } = useFinora();

  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'unusual' | 'subscriptions'>('overview');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Manual Expense Add Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [merchant, setMerchant] = useState('Local Merchant');

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const debits = useMemo(() => transactions.filter(t => t.type === 'debit'), [transactions]);
  const totalSpending = useMemo(() => debits.reduce((acc, t) => acc + t.amount, 0), [debits]);

  // Category Totals across all 13 categories
  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    OFFICIAL_CATEGORIES.forEach(c => { map[c] = 0; });
    debits.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [debits]);

  // Essential vs Discretionary
  const essentialSpending = useMemo(() => {
    return debits.filter(t => t.isEssential).reduce((acc, t) => acc + t.amount, 0);
  }, [debits]);
  const discretionarySpending = totalSpending - essentialSpending;

  // Recurring Subscriptions & Dormant Charges
  const recurringSubscriptions = useMemo(() => {
    return CategorizerService.detectRecurringSubscriptions(transactions);
  }, [transactions]);

  // Unusual Spending Outliers
  const unusualSpendingOutliers = useMemo(() => {
    return CategorizerService.detectUnusualSpending(transactions);
  }, [transactions]);

  // Spending Patterns Insights
  const spendingInsights = useMemo(() => {
    return CategorizerService.analyzeSpendingPatterns(transactions);
  }, [transactions]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: desc || 'Manual Expense',
      amount: Number(amount),
      type: 'debit',
      category,
      subcategory: 'General Expenses',
      merchant: merchant || 'Local Merchant',
      isEssential: category === 'Rent' || category === 'Utilities' || category === 'Healthcare' || category === 'Groceries' || category === 'EMIs & Loans',
    });
    setShowAddForm(false);
    setDesc('');
  };

  const handleReclassify = (id: string, description: string, newCat: ExpenseCategory) => {
    updateTransaction(id, { category: newCat });
    learnCategoryOverride(description, newCat);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER BAND */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Spending Intelligence &amp; Categorisation Engine
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Total Outflow: <strong className="text-rose-600 font-bold">{inr(totalSpending)}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Expenses &amp; Pattern Intelligence
          </h1>
          <p className="text-sm text-[#5D6D66] mt-1">
            Intelligent 13-category transaction engine, recurring charge audits, and outlier spend alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 rounded-2xl border border-[#E2E5E1] bg-[#F6F6F2] hover:bg-slate-200 text-[#0E2A1E] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1F7A52]" /> Import Statement
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#34D399]" /> Add Expense
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Essential Outflow</span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {inr(essentialSpending)}
          </div>
          <span className="text-[11px] text-[#5D6D66]">
            {totalSpending > 0 ? `${Math.round((essentialSpending / totalSpending) * 100)}% of total spend` : 'Fixed survival expenses'}
          </span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Discretionary Spend</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {inr(discretionarySpending)}
          </div>
          <span className="text-[11px] text-[#5D6D66]">
            {totalSpending > 0 ? `${Math.round((discretionarySpending / totalSpending) * 100)}% lifestyle spend` : 'Dining, entertainment, shopping'}
          </span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Recurring Subscriptions</span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {recurringSubscriptions.length}
          </div>
          <span className="text-[11px] text-[#5D6D66]">
            ~{inr(recurringSubscriptions.reduce((a, b) => a + b.amount, 0))}/month
          </span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Unusual Spend Spikes</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {unusualSpendingOutliers.length}
          </div>
          <span className="text-[11px] text-[#5D6D66]">Outliers exceeding 2.5x mean</span>
        </div>
      </div>

      {/* AI SPENDING PATTERNS CARD */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1F7A52]" />
          <h3 className="text-base font-extrabold text-[#0E2A1E]">AI Spending Observations</h3>
        </div>
        <div className="space-y-2">
          {spendingInsights.map((insight, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] text-xs text-[#101A15] leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          ))}
        </div>
      </div>

      {/* 4 TABS */}
      <div className="flex border-b border-[#E2E5E1] gap-6 text-xs font-black">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          13 Categories Distribution
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'subscriptions' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          <span>Recurring Subscriptions Audit</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {recurringSubscriptions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('unusual')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'unusual' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          <span>Unusual Spending Outliers</span>
          {unusualSpendingOutliers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {unusualSpendingOutliers.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: 13 CATEGORIES DISTRIBUTION */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_CATEGORIES.map(cat => {
            const amount = categoryMap[cat] || 0;
            const pct = totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0;
            return (
              <div key={cat} className="p-4 rounded-3xl border border-[#E2E5E1] bg-white space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-xs text-[#0E2A1E]">{cat}</span>
                  <span className="text-xs font-black text-[#0E2A1E]">{inr(amount)}</span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1F7A52] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-[#5D6D66]">
                  <span>{pct}% of spending</span>
                  <span>{debits.filter(t => t.category === cat).length} debits</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: RECURRING SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#0E2A1E]">Detected Recurring Subscriptions &amp; Bills</h3>
            <p className="text-xs text-[#5D6D66]">Audit monthly streaming, gym memberships, and ISP utilities to eliminate waste.</p>
          </div>

          {recurringSubscriptions.length > 0 ? (
            <div className="border border-[#E2E5E1] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F6F2] border-b border-[#E2E5E1] text-[#5D6D66] font-bold">
                  <tr>
                    <th className="py-3 px-4">Merchant / Provider</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Occurrences</th>
                    <th className="py-3 px-4">Last Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E1]">
                  {recurringSubscriptions.map((sub, i) => (
                    <tr key={i} className="hover:bg-[#F6F6F2]/50">
                      <td className="py-3 px-4 font-black text-[#0E2A1E]">
                        {sub.merchant}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-600">
                        {inr(sub.amount)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {sub.frequency}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {sub.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {sub.occurrences} detected
                      </td>
                      <td className="py-3 px-4 text-[#5D6D66]">
                        {sub.lastPaymentDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Repeat className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-[#5D6D66]">No recurring subscriptions detected in your transactions.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UNUSUAL SPEND OUTLIERS */}
      {activeTab === 'unusual' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#0E2A1E]">Unusual Spending Anomalies</h3>
            <p className="text-xs text-[#5D6D66]">Transactions that significantly deviate from your average category spend.</p>
          </div>

          {unusualSpendingOutliers.length > 0 ? (
            <div className="space-y-3">
              {unusualSpendingOutliers.map(t => (
                <div key={t.id} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-[#0E2A1E] block">{t.description}</span>
                      <span className="text-[11px] text-amber-900">
                        Category: <strong>{t.category}</strong> • Date: {t.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-rose-600 block">{inr(t.amount)}</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                      Outlier &gt; 2.5x mean
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#1F7A52] mx-auto" />
              <p className="text-xs font-bold text-[#0E2A1E]">No unusual spending anomalies detected</p>
              <p className="text-[11px] text-[#5D6D66]">All debits conform to expected category expenditure ranges.</p>
            </div>
          )}
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 text-[#101A15]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-[#0E2A1E]">Add Manual Expense</h3>
                <p className="text-xs text-[#5D6D66]">Log a single expense entry.</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Lunch, Movie Tickets"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {OFFICIAL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Merchant (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, PVR"
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0E2A1E] text-white font-bold text-xs hover:bg-[#14372A] transition-all cursor-pointer shadow-md"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BANK STATEMENT IMPORTER */}
      <BankStatementImporter
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

    </div>
  );
};
