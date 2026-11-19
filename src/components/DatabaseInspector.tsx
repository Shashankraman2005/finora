import React, { useState } from 'react';
import { 
  Database, 
  User, 
  CreditCard, 
  PieChart, 
  Receipt, 
  CheckCircle2
} from 'lucide-react';
import { MOCK_FINANCIAL_DATABASE } from '../data/mockDatabase';

interface DatabaseInspectorProps {
  dbState: typeof MOCK_FINANCIAL_DATABASE;
  setDbState: React.Dispatch<React.SetStateAction<typeof MOCK_FINANCIAL_DATABASE>>;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  dbState,
  setDbState,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'accounts' | 'holdings' | 'liabilities' | 'transactions'>('accounts');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleAccountBalanceChange = (id: string, newBalance: number) => {
    setDbState(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => acc.id === id ? { ...acc, balance: newBalance } : acc)
    }));
  };

  const handleHoldingPriceChange = (id: string, newPrice: number) => {
    setDbState(prev => ({
      ...prev,
      holdings: prev.holdings.map(h => {
        if (h.id === id) {
          const marketValue = Math.round(h.quantity * newPrice);
          const unrealizedGainLoss = Math.round(marketValue - (h.quantity * h.avgCostBasis));
          return { ...h, currentPrice: newPrice, marketValue, unrealizedGainLoss };
        }
        return h;
      })
    }));
  };

  const handleSaveNotification = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">Financial Database Inspector & Sandbox</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            View & adjust live user financial data (accounts, market prices, debt loans). Pipeline steps read directly from this database store.
          </p>
        </div>

        {showSavedToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Database Updated! Re-run pipeline to see updated math.</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'accounts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Accounts ({dbState.accounts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('holdings')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'holdings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          Holdings ({dbState.holdings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('liabilities')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'liabilities' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Liabilities ({dbState.liabilities.length})
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          User Profile
        </button>
      </div>

      {activeSubTab === 'accounts' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3">Account Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Institution</th>
                <th className="p-3">Balance (USD)</th>
                <th className="p-3">Yield Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {dbState.accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-100">{acc.name}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{acc.type}</span></td>
                  <td className="p-3">{acc.institution}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={acc.balance}
                      onChange={(e) => {
                        handleAccountBalanceChange(acc.id, Number(e.target.value));
                        handleSaveNotification();
                      }}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono w-28 focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                  <td className="p-3">{acc.yieldRate ? `${acc.yieldRate}%` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'holdings' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3">Ticker</th>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Shares</th>
                <th className="p-3">Price (USD)</th>
                <th className="p-3">Market Value</th>
                <th className="p-3">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {dbState.holdings.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-indigo-400">{h.ticker}</td>
                  <td className="p-3 text-slate-200">{h.name}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{h.assetClass}</span></td>
                  <td className="p-3 font-mono">{h.quantity}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.1"
                      value={h.currentPrice}
                      onChange={(e) => {
                        handleHoldingPriceChange(h.id, Number(e.target.value));
                        handleSaveNotification();
                      }}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-indigo-300 font-mono w-24 focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-100">${h.marketValue.toLocaleString()}</td>
                  <td className={`p-3 font-mono font-semibold ${h.unrealizedGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {h.unrealizedGainLoss >= 0 ? `+$${h.unrealizedGainLoss.toLocaleString()}` : `-$${Math.abs(h.unrealizedGainLoss).toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'liabilities' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3">Liability Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Principal Remaining</th>
                <th className="p-3">Interest Rate</th>
                <th className="p-3">Min Monthly Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {dbState.liabilities.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-100">{l.name}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{l.category}</span></td>
                  <td className="p-3 font-mono font-semibold text-amber-400">${l.principalRemaining.toLocaleString()}</td>
                  <td className="p-3 font-mono text-red-400 font-bold">{l.interestRatePct}%</td>
                  <td className="p-3 font-mono">${l.minimumMonthlyPayment}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Personal Demographics</h4>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Full Name</span><span className="font-semibold text-slate-100">{dbState.userProfile.name}</span></div>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Current Age</span><span className="font-semibold text-slate-100">{dbState.userProfile.age} Yrs</span></div>
            <div className="flex justify-between py-1"><span className="text-slate-400">Target Retirement Age</span><span className="font-semibold text-indigo-400">{dbState.userProfile.targetRetirementAge} Yrs</span></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Income & Risk Profile</h4>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Gross Monthly Income</span><span className="font-semibold text-emerald-400">${dbState.userProfile.monthlyGrossIncome.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Monthly Expenses</span><span className="font-semibold text-slate-100">${dbState.userProfile.monthlyExpenses.toLocaleString()}</span></div>
            <div className="flex justify-between py-1"><span className="text-slate-400">Risk Tolerance</span><span className="font-semibold text-indigo-400">{dbState.userProfile.riskTolerance}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
