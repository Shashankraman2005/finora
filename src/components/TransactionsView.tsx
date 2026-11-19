import React, { useState, useMemo } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { OFFICIAL_CATEGORIES, type ExpenseCategory } from '../types/finora';
import { BankStatementImporter } from './BankStatementImporter';

export const TransactionsView: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    updateTransaction,
    learnCategoryOverride 
  } = useFinora();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'debit' | 'credit'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  // Add form fields
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [txType, setTxType] = useState<'debit' | 'credit'>('debit');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [merchant, setMerchant] = useState('Starbucks');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubscription, setIsSubscription] = useState(false);

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesType = selectedType === 'all' || t.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchQuery, selectedCategory, selectedType]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      date: txDate,
      description: desc || 'Manual Transaction',
      amount: Number(amount),
      type: txType,
      category,
      subcategory: 'General Expenses',
      merchant: merchant || 'Merchant',
      isSubscription,
      isEssential: category === 'Rent' || category === 'Utilities' || category === 'Healthcare' || category === 'Groceries' || category === 'EMIs & Loans'
    });
    setShowAddModal(false);
    setDesc('');
    setMerchant('');
  };

  const handleInlineCategoryChange = (id: string, description: string, newCat: ExpenseCategory) => {
    updateTransaction(id, { category: newCat });
    learnCategoryOverride(description, newCat);
  };

  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Financial Ledger
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {transactions.length} Total Verified Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Transactions &amp; Cashflow Activity
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D66] mt-0.5">
            Real user transactions with automated 13-category classification and statement import.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImporter(true)}
            className="px-4 py-2.5 rounded-2xl border border-[#E2E5E1] bg-[#F6F6F2] hover:bg-slate-200 text-[#0E2A1E] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1F7A52]" />
            <span>Import Statement</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Total Inflow (Credits)</span>
          <div className="text-xl sm:text-2xl font-black text-[#1F7A52]">
            {totalCredits > 0 ? inr(totalCredits) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">{transactions.filter(t => t.type === 'credit').length} credit events</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Total Outflow (Debits)</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {totalDebits > 0 ? inr(totalDebits) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">{transactions.filter(t => t.type === 'debit').length} debit events</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Net Ledger Flow</span>
          <div className={`text-xl sm:text-2xl font-black ${totalCredits >= totalDebits ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
            {totalCredits >= totalDebits ? '+' : ''}{inr(totalCredits - totalDebits)}
          </div>
          <span className="text-[11px] text-[#5D6D66]">Inflow minus outflow</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Recurring Charges</span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {transactions.filter(t => t.isSubscription).length}
          </div>
          <span className="text-[11px] text-[#5D6D66]">Subscriptions &amp; bills</span>
        </div>
      </div>

      {/* FILTER BAR & SEARCH */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search descriptions, merchants..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-bold text-[#0E2A1E] focus:outline-none focus:border-[#1F7A52]"
            >
              <option value="all">All Categories</option>
              {OFFICIAL_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as any)}
              className="bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-bold text-[#0E2A1E] focus:outline-none focus:border-[#1F7A52]"
            >
              <option value="all">All Types</option>
              <option value="debit">Debits Only</option>
              <option value="credit">Credits Only</option>
            </select>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        {filteredTransactions.length > 0 ? (
          <div className="border border-[#E2E5E1] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F6F2] border-b border-[#E2E5E1] text-[#5D6D66] font-bold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Merchant</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Category (13 Models)</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5E1]">
                {filteredTransactions.map(t => {
                  const isCredit = t.type === 'credit';
                  return (
                    <tr key={t.id} className="hover:bg-[#F6F6F2]/50 transition-all">
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-black text-xs text-[#0E2A1E] block">{t.description}</span>
                        <span className="text-[10px] text-[#5D6D66]">Merchant: {t.merchant} {t.isSubscription && '• Subscription'}</span>
                      </td>
                      <td className="py-3 px-4 font-bold whitespace-nowrap">
                        <span className={isCredit ? 'text-[#1F7A52]' : 'text-rose-600'}>
                          {isCredit ? '+' : '-'}{inr(t.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={t.category}
                          onChange={e => handleInlineCategoryChange(t.id, t.description, e.target.value as ExpenseCategory)}
                          className="bg-white border border-[#E2E5E1] rounded-lg px-2 py-1 text-xs font-semibold text-[#0E2A1E] focus:outline-none focus:border-[#1F7A52]"
                        >
                          {OFFICIAL_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCredit ? 'bg-[#E4F0E9] text-[#1F7A52]' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#0E2A1E]">No transactions found</h4>
            <p className="text-xs text-[#5D6D66] max-w-sm mx-auto">
              Add a manual transaction or import your PDF/Excel bank statement to populate your ledger.
            </p>
          </div>
        )}
      </div>

      {/* ADD TRANSACTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-[#101A15]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-[#0E2A1E]">Add Transaction</h3>
                <p className="text-xs text-[#5D6D66]">Manual entry with intelligent categorization.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks Latte, Swiggy Dinner, Airtel Bill"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Transaction Type</label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value as any)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  >
                    <option value="debit">Debit (Expense)</option>
                    <option value="credit">Credit (Income)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                >
                  {OFFICIAL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Merchant</label>
                  <input
                    type="text"
                    placeholder="e.g. Starbucks, Amazon"
                    value={merchant}
                    onChange={e => setMerchant(e.target.value)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sub_check"
                  checked={isSubscription}
                  onChange={e => setIsSubscription(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F7A52]"
                />
                <label htmlFor="sub_check" className="text-xs font-bold text-[#0E2A1E] cursor-pointer">
                  Recurring Monthly Subscription
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-black text-xs shadow-md shadow-[#0E2A1E]/20 transition-all cursor-pointer"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BANK STATEMENT IMPORTER */}
      <BankStatementImporter
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
      />

    </div>
  );
};
