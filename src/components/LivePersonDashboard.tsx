import React, { useState } from 'react';
import { 
  User, 
  Plus, 
  Edit3, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  PieChart as PieChartIcon, 
  ShieldCheck, 
  Sparkles,
  Save,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { MOCK_FINANCIAL_DATABASE, Account, Transaction } from '../data/mockDatabase';

interface LivePersonDashboardProps {
  dbState: typeof MOCK_FINANCIAL_DATABASE;
  setDbState: React.Dispatch<React.SetStateAction<typeof MOCK_FINANCIAL_DATABASE>>;
}

export const LivePersonDashboard: React.FC<LivePersonDashboardProps> = ({
  dbState,
  setDbState,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // New Transaction Form State
  const [newTxDesc, setNewTxDesc] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxCategory, setNewTxCategory] = useState<Transaction['category']>('Discretionary');
  const [newTxType, setNewTxType] = useState<'debit' | 'credit'>('debit');

  // New Account Form State
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('Savings');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccInst, setNewAccInst] = useState('');

  // Profile Form State
  const [profileName, setProfileName] = useState(dbState.userProfile.name);
  const [profileAge, setProfileAge] = useState(dbState.userProfile.age);
  const [profileIncome, setProfileIncome] = useState(dbState.userProfile.monthlyGrossIncome);
  const [profileExpenses, setProfileExpenses] = useState(dbState.userProfile.monthlyExpenses);

  // Live Calculated Metrics
  const totalAccountBalances = dbState.accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalHoldingValue = dbState.holdings.reduce((acc, h) => acc + h.marketValue, 0);
  const totalLiabilities = dbState.liabilities.reduce((acc, l) => acc + l.principalRemaining, 0);
  const totalMonthlyDebtPayments = dbState.liabilities.reduce((acc, l) => acc + l.minimumMonthlyPayment, 0);

  const totalAssets = totalAccountBalances + totalHoldingValue;
  const netWorth = totalAssets - totalLiabilities;
  const netMonthlyCashflow = dbState.userProfile.monthlyGrossIncome - dbState.userProfile.monthlyExpenses - totalMonthlyDebtPayments;
  const savingsRate = dbState.userProfile.monthlyGrossIncome > 0 
    ? Math.round((netMonthlyCashflow / dbState.userProfile.monthlyGrossIncome) * 100)
    : 0;

  const emergencyMonths = dbState.userProfile.monthlyExpenses > 0
    ? (totalAccountBalances / dbState.userProfile.monthlyExpenses).toFixed(1)
    : '0';

  // Currency Formatter
  const fmt = (n: number) => {
    return '$' + Math.round(n).toLocaleString();
  };

  // Profile Preset Selectors
  const applyPresetProfile = (preset: 'arjun' | 'shashank' | 'priya') => {
    if (preset === 'arjun') {
      setDbState({
        ...dbState,
        userProfile: {
          id: 'usr_arjun',
          name: 'Arjun Patel',
          age: 29,
          targetRetirementAge: 50,
          monthlyGrossIncome: 9500,
          monthlyExpenses: 4200,
          riskTolerance: 'Aggressive',
          currency: 'USD',
        },
        accounts: [
          { id: 'acc_a1', name: 'High Yield Savings', type: 'Savings', institution: 'Marcus', balance: 28500, yieldRate: 4.75 },
          { id: 'acc_a2', name: 'Primary Checking', type: 'Checking', institution: 'Chase', balance: 8400 },
          { id: 'acc_a3', name: 'Growth Brokerage', type: 'Brokerage', institution: 'Robinhood', balance: 85000 },
        ],
        holdings: [
          { id: 'h_a1', ticker: 'NVDA', name: 'NVIDIA Corp', assetClass: 'Tech Equity', quantity: 200, avgCostBasis: 55, currentPrice: 122.5, marketValue: 24500, unrealizedGainLoss: 13500, annualDividendYield: 0.08 },
          { id: 'h_a2', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', assetClass: 'US Equity', quantity: 150, avgCostBasis: 380, currentPrice: 510, marketValue: 76500, unrealizedGainLoss: 19500, annualDividendYield: 1.35 },
        ],
        liabilities: [
          { id: 'l_a1', name: 'Car Loan', category: 'Auto Loan', principalRemaining: 14200, interestRatePct: 4.8, minimumMonthlyPayment: 420, termMonthsRemaining: 36 }
        ],
      });
    } else if (preset === 'shashank') {
      setDbState({
        ...dbState,
        userProfile: {
          id: 'usr_shashank',
          name: 'Shashank Raman',
          age: 34,
          targetRetirementAge: 55,
          monthlyGrossIncome: 14500,
          monthlyExpenses: 6800,
          riskTolerance: 'Aggressive',
          currency: 'USD',
        },
        accounts: [
          { id: 'acc_01', name: 'High Yield Savings', type: 'Savings', institution: 'Marcus Goldman', balance: 45000, yieldRate: 4.85 },
          { id: 'acc_02', name: 'Primary Checking', type: 'Checking', institution: 'Chase Bank', balance: 12500 },
          { id: 'acc_03', name: 'Individual Brokerage', type: 'Brokerage', institution: 'Fidelity', balance: 215000 },
          { id: 'acc_04', name: 'Tech Employer 401(k)', type: '401(k)', institution: 'Fidelity', balance: 180000 },
        ],
        holdings: [
          { id: 'h_01', ticker: 'VTI', name: 'Vanguard Total Stock ETF', assetClass: 'US Equity', quantity: 650, avgCostBasis: 195.0, currentPrice: 275.4, marketValue: 179010, unrealizedGainLoss: 52260, annualDividendYield: 1.45 },
          { id: 'h_03', ticker: 'NVDA', name: 'NVIDIA Corporation', assetClass: 'Tech Equity', quantity: 350, avgCostBasis: 48.0, currentPrice: 122.5, marketValue: 42875, unrealizedGainLoss: 26075, annualDividendYield: 0.08 },
        ],
        liabilities: [
          { id: 'l_01', name: 'Home Mortgage', category: 'Mortgage', principalRemaining: 340000, interestRatePct: 4.25, minimumMonthlyPayment: 2150, termMonthsRemaining: 288 }
        ],
      });
    } else if (preset === 'priya') {
      setDbState({
        ...dbState,
        userProfile: {
          id: 'usr_priya',
          name: 'Priya Sharma',
          age: 41,
          targetRetirementAge: 52,
          monthlyGrossIncome: 22000,
          monthlyExpenses: 9200,
          riskTolerance: 'Aggressive' as const,
          currency: 'USD',
        },
        accounts: [
          { id: 'acc_p1', name: 'Family Emergency Fund', type: 'Savings', institution: 'Ally Bank', balance: 85000, yieldRate: 4.6 },
          { id: 'acc_p2', name: 'Joint Checking', type: 'Checking', institution: 'Wells Fargo', balance: 24000 },
          { id: 'acc_p3', name: 'Vanguard Wealth Brokerage', type: 'Brokerage', institution: 'Vanguard', balance: 540000 },
          { id: 'acc_p4', name: 'Exec Mega Backdoor Roth', type: 'Roth IRA', institution: 'Fidelity', balance: 320000 },
        ],
        holdings: [
          { id: 'h_p1', ticker: 'MSFT', name: 'Microsoft Corp', assetClass: 'Tech Equity', quantity: 600, avgCostBasis: 240, currentPrice: 445, marketValue: 267000, unrealizedGainLoss: 123000, annualDividendYield: 0.7 },
          { id: 'h_p2', ticker: 'VT', name: 'Vanguard Total World Stock', assetClass: 'Intl Equity', quantity: 1200, avgCostBasis: 88, currentPrice: 112, marketValue: 134400, unrealizedGainLoss: 28800, annualDividendYield: 2.1 },
        ],
        liabilities: [
          { id: 'l_p1', name: 'San Jose Property Mortgage', category: 'Mortgage', principalRemaining: 480000, interestRatePct: 3.5, minimumMonthlyPayment: 2950, termMonthsRemaining: 216 }
        ],
      });
    }
  };

  // Add Transaction Handler
  const handleAddTransaction = () => {
    if (!newTxDesc || !newTxAmount) return;
    const amountNum = parseFloat(newTxAmount);
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: newTxCategory,
      amount: amountNum,
      description: newTxDesc,
      type: newTxType,
    };

    setDbState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      userProfile: {
        ...prev.userProfile,
        monthlyExpenses: newTxType === 'debit' 
          ? prev.userProfile.monthlyExpenses + amountNum 
          : prev.userProfile.monthlyExpenses
      }
    }));

    setNewTxDesc('');
    setNewTxAmount('');
    setShowAddTxModal(false);
  };

  // Add Account Handler
  const handleAddAccount = () => {
    if (!newAccName || !newAccBalance) return;
    const balanceNum = parseFloat(newAccBalance);
    const newAcc: Account = {
      id: `acc_${Date.now()}`,
      name: newAccName,
      type: newAccType,
      institution: newAccInst || 'Bank',
      balance: balanceNum,
    };

    setDbState(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAcc]
    }));

    setNewAccName('');
    setNewAccBalance('');
    setNewAccInst('');
    setShowAddAccountModal(false);
  };

  // Save Profile Edits
  const handleSaveProfile = () => {
    setDbState(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        name: profileName,
        age: profileAge,
        monthlyGrossIncome: profileIncome,
        monthlyExpenses: profileExpenses,
      }
    }));
    setIsEditingProfile(false);
  };

  return (
    <div className="bg-[#F6F6F2] border border-[#E2E5E1] rounded-3xl p-6 lg:p-8 shadow-sm text-[#101A15] space-y-8">
      {/* HEADER BAR & PRESETS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E2E5E1]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E2A1E] text-white flex items-center justify-center shadow-md shadow-[#0E2A1E]/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-[#0E2A1E] tracking-tight">{dbState.userProfile.name}'s Financial Profile</h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#E4F0E9] text-[#1F7A52] border border-[#1F7A52]/20">
                  Live Reactive Sync ⚡
                </span>
              </div>
              <p className="text-xs text-[#5D6D66] font-medium mt-0.5">
                Age: {dbState.userProfile.age} | Retirement Goal: Age {dbState.userProfile.targetRetirementAge} | Risk Profile: {dbState.userProfile.riskTolerance}
              </p>
            </div>
          </div>
        </div>

        {/* QUICK PRESET SELECTORS & ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#5D6D66] font-semibold mr-1">Switch Profile Preset:</span>
          <button
            onClick={() => applyPresetProfile('shashank')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dbState.userProfile.name.includes('Shashank') 
                ? 'bg-[#0E2A1E] text-white shadow-sm' 
                : 'bg-white text-[#101A15] border border-[#E2E5E1] hover:bg-[#E4F0E9]'
            }`}
          >
            👤 Shashank ($14.5k/mo)
          </button>
          <button
            onClick={() => applyPresetProfile('arjun')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dbState.userProfile.name.includes('Arjun') 
                ? 'bg-[#0E2A1E] text-white shadow-sm' 
                : 'bg-white text-[#101A15] border border-[#E2E5E1] hover:bg-[#E4F0E9]'
            }`}
          >
            👨‍💼 Arjun ($9.5k/mo)
          </button>
          <button
            onClick={() => applyPresetProfile('priya')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dbState.userProfile.name.includes('Priya') 
                ? 'bg-[#0E2A1E] text-white shadow-sm' 
                : 'bg-white text-[#101A15] border border-[#E2E5E1] hover:bg-[#E4F0E9]'
            }`}
          >
            👩‍💻 Priya ($22k/mo)
          </button>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1F7A52] hover:bg-[#17593C] text-white text-xs font-bold transition-all ml-2 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingProfile ? 'Close Editor' : 'Edit Person Data'}
          </button>
        </div>
      </div>

      {/* EDIT PROFILE DRAWER FORM */}
      {isEditingProfile && (
        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-6 space-y-4 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-[#E2E5E1]">
            <h3 className="text-sm font-bold text-[#0E2A1E] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1F7A52]" /> Edit Person Financial Demographics
            </h3>
            <span className="text-xs text-[#5D6D66]">Dashboard updates live on save</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#5D6D66] block mb-1">Person Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5D6D66] block mb-1">Age</label>
              <input
                type="number"
                value={profileAge}
                onChange={(e) => setProfileAge(Number(e.target.value))}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5D6D66] block mb-1">Monthly Gross Income ($)</label>
              <input
                type="number"
                value={profileIncome}
                onChange={(e) => setProfileIncome(Number(e.target.value))}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#1F7A52] focus:outline-none focus:border-[#1F7A52]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5D6D66] block mb-1">Monthly Expenses ($)</label>
              <input
                type="number"
                value={profileExpenses}
                onChange={(e) => setProfileExpenses(Number(e.target.value))}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#B4523F] focus:outline-none focus:border-[#1F7A52]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold shadow-md transition-all"
            >
              <Save className="w-4 h-4" /> Save Person Profile Updates
            </button>
          </div>
        </div>
      )}

      {/* LIVE KPIS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* TOTAL NET WORTH */}
        <div className="p-5 rounded-2xl bg-[#0E2A1E] text-white border border-[#14372A] relative overflow-hidden shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#CFE0D6] font-semibold">Total Net Worth</span>
            <span className="p-2 rounded-xl bg-white/10 text-white">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">{fmt(netWorth)}</div>
          <div className="flex items-center gap-1 text-[#7FBE9D] text-xs font-bold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Assets {fmt(totalAssets)}</span>
          </div>
        </div>

        {/* MONTHLY CASHFLOW */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E5E1] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#5D6D66] font-semibold">Net Monthly Cash Flow</span>
            <span className="p-2 rounded-xl bg-[#E4F0E9] text-[#1F7A52]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#101A15] mt-2 font-mono">{fmt(netMonthlyCashflow)}</div>
          <div className="flex items-center gap-1 text-[#5D6D66] text-xs font-semibold mt-2">
            <span>Income {fmt(dbState.userProfile.monthlyGrossIncome)}/mo</span>
          </div>
        </div>

        {/* SAVINGS RATE */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E5E1] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#5D6D66] font-semibold">Savings & Invest Rate</span>
            <span className="p-2 rounded-xl bg-amber-50 text-[#C98A2B]">
              <PieChartIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#101A15] mt-2 font-mono">{savingsRate}%</div>
          <div className="text-xs text-[#5D6D66] font-semibold mt-2">
            {savingsRate >= 25 ? '⚡ High Compounding Velocity' : 'On Track'}
          </div>
        </div>

        {/* EMERGENCY RUNWAY */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E5E1] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#5D6D66] font-semibold">Emergency Runway</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#101A15] mt-2 font-mono">{emergencyMonths} Mos</div>
          <div className="text-xs text-[#5D6D66] font-semibold mt-2">
            Cash: {fmt(totalAccountBalances)}
          </div>
        </div>
      </div>

      {/* DETAILED LIVE TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACCOUNTS LIST WITH INLINE EDIT */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E5E1] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-[#0E2A1E] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#1F7A52]" /> Bank & Investment Accounts ({dbState.accounts.length})
            </h3>
            <button
              onClick={() => setShowAddAccountModal(true)}
              className="flex items-center gap-1 text-xs font-bold text-[#1F7A52] bg-[#E4F0E9] hover:bg-[#d5e7dc] px-3 py-1.5 rounded-lg border border-[#1F7A52]/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Account
            </button>
          </div>

          <div className="space-y-2.5">
            {dbState.accounts.map((acc) => (
              <div key={acc.id} className="flex justify-between items-center p-3 rounded-xl bg-[#F6F6F2] border border-[#E2E5E1] hover:border-[#1F7A52]/30 transition-all">
                <div>
                  <div className="text-xs font-bold text-[#101A15]">{acc.name}</div>
                  <div className="text-[11px] text-[#5D6D66]">{acc.institution} · <span className="text-[#1F7A52] font-semibold">{acc.type}</span></div>
                </div>
                <div className="text-right">
                  <input
                    type="number"
                    value={acc.balance}
                    onChange={(e) => {
                      const newBal = Number(e.target.value);
                      setDbState(prev => ({
                        ...prev,
                        accounts: prev.accounts.map(a => a.id === acc.id ? { ...a, balance: newBal } : a)
                      }));
                    }}
                    className="bg-white border border-[#E2E5E1] rounded px-2.5 py-1 text-xs font-mono font-bold text-[#1F7A52] text-right w-28 focus:outline-none focus:border-[#1F7A52]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STOCK & FUND HOLDINGS LIST */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E5E1] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-[#0E2A1E] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1F7A52]" /> Portfolio Holdings ({dbState.holdings.length})
            </h3>
            <span className="text-xs text-[#5D6D66] font-mono font-bold">Total: {fmt(totalHoldingValue)}</span>
          </div>

          <div className="space-y-2.5">
            {dbState.holdings.map((h) => (
              <div key={h.id} className="flex justify-between items-center p-3 rounded-xl bg-[#F6F6F2] border border-[#E2E5E1] hover:border-[#1F7A52]/30 transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1F7A52]">{h.ticker}</span>
                    <span className="text-xs font-semibold text-[#101A15]">{h.name}</span>
                  </div>
                  <div className="text-[11px] text-[#5D6D66]">{h.quantity} shares @ ${h.currentPrice}/sh</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#101A15]">{fmt(h.marketValue)}</div>
                  <div className={`text-[11px] font-mono font-semibold ${h.unrealizedGainLoss >= 0 ? 'text-[#1F7A52]' : 'text-[#B4523F]'}`}>
                    {h.unrealizedGainLoss >= 0 ? `+${fmt(h.unrealizedGainLoss)}` : `-${fmt(Math.abs(h.unrealizedGainLoss))}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE TRANSACTIONS LOG & QUICK ADD */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
              Recent Transactions ({dbState.transactions.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Adding a transaction recalculates monthly expenses & liquid cash balance instantly</p>
          </div>
          <button
            onClick={() => setShowAddTxModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Log New Transaction
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {dbState.transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center py-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{tx.description}</div>
                  <div className="text-[11px] text-slate-400">{tx.date} · <span className="text-indigo-400">{tx.category}</span></div>
                </div>
              </div>
              <div className={`text-xs font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                {tx.type === 'credit' ? `+${fmt(tx.amount)}` : `-${fmt(tx.amount)}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scale-up shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Log New Person Transaction</h3>
              <button onClick={() => setShowAddTxModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Grocery Shopping, Stock SIP..."
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Type</label>
                  <select
                    value={newTxType}
                    onChange={(e) => setNewTxType(e.target.value as 'debit' | 'credit')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100"
                  >
                    <option value="debit">Debit (Expense)</option>
                    <option value="credit">Credit (Income)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                <select
                  value={newTxCategory}
                  onChange={(e) => setNewTxCategory(e.target.value as Transaction['category'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100"
                >
                  <option value="Discretionary">Discretionary</option>
                  <option value="Housing">Housing</option>
                  <option value="Investments">Investments</option>
                  <option value="Debt Payoff">Debt Payoff</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Income">Income</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddTxModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scale-up shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Add Bank / Brokerage Account</h3>
              <button onClick={() => setShowAddAccountModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus HY Savings, Vanguard Roth..."
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as Account['type'])}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                    <option value="Brokerage">Brokerage</option>
                    <option value="401(k)">401(k)</option>
                    <option value="Roth IRA">Roth IRA</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Balance ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Institution</label>
                <input
                  type="text"
                  placeholder="e.g. Goldman Sachs, Fidelity, Chase"
                  value={newAccInst}
                  onChange={(e) => setNewAccInst(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
