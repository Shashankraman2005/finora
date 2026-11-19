import React, { useState } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Sparkles,
  BarChart2,
  Layers,
  ArrowUpRight,
  PieChart,
  ShieldCheck,
  Building2,
  Coins
} from 'lucide-react';
import type { InvestmentItem } from '../types/finora';

interface InvestmentsPortfolioViewProps {
  onNavigate?: (tab: string) => void;
}

export const InvestmentsPortfolioView: React.FC<InvestmentsPortfolioViewProps> = ({ onNavigate }) => {
  const { investments, stockHoldings, mfHoldings, addInvestment } = useFinora();
  const [activeTab, setActiveTab] = useState<'overview' | 'stocks' | 'mutual_funds' | 'other' | 'research'>('overview');

  // Add Investment Modal for generic/other assets
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentItem['type']>('Gold');
  const [qty, setQty] = useState(10);
  const [cost, setCost] = useState(200);
  const [price, setPrice] = useState(250);

  // Research search state
  const [searchQuery, setSearchQuery] = useState('Nifty 50 Index');

  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  // Combined calculations
  const totalStocksValue = stockHoldings.reduce((acc, s) => acc + s.currentValue, 0);
  const totalStocksCost = stockHoldings.reduce((acc, s) => acc + s.investedAmount, 0);

  const totalMfValue = mfHoldings.reduce((acc, m) => acc + m.currentValue, 0);
  const totalMfCost = mfHoldings.reduce((acc, m) => acc + m.investedAmount, 0);

  const totalOtherValue = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalOtherCost = investments.reduce((acc, i) => acc + i.investedAmount, 0);

  const totalPortfolioValue = totalStocksValue + totalMfValue + totalOtherValue;
  const totalPortfolioCost = totalStocksCost + totalMfCost + totalOtherCost;
  const totalProfit = totalPortfolioValue - totalPortfolioCost;
  const overallReturnPct = totalPortfolioCost > 0 
    ? ((totalProfit / totalPortfolioCost) * 100).toFixed(2) 
    : '0.00';

  const totalHoldingsCount = stockHoldings.length + mfHoldings.length + investments.length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const investedAmount = qty * cost;
    const currentValue = qty * price;
    const returnsPct = ((currentValue - investedAmount) / investedAmount) * 100;
    
    addInvestment({
      name: name || 'New Asset Holding',
      symbol: name.toUpperCase().slice(0, 6) || 'ASSET',
      type,
      quantity: Number(qty),
      avgCostBasis: Number(cost),
      currentPrice: Number(price),
      investedAmount,
      currentValue,
      returnsPct: Number(returnsPct.toFixed(2)),
      allocationPct: Math.round((currentValue / (totalPortfolioValue || 1)) * 100),
      provider: 'Direct / Physical',
      riskLevel: 'Medium',
    });
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER BAND */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Consolidated Portfolio Command Center
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Total Assets Value: <strong className="text-[#1F7A52] font-bold">{inr(totalPortfolioValue)}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Investments &amp; Asset Allocation
          </h1>
          <p className="text-sm text-[#5D6D66] mt-1">
            Consolidated intelligence across NSE/BSE stocks, AMFI mutual funds, gold, and fixed-income assets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('stock-market')}
                className="px-4 py-2.5 rounded-2xl border border-[#E2E5E1] bg-[#F6F6F2] hover:bg-slate-200 text-[#0E2A1E] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Stock Terminal
              </button>
              <button
                onClick={() => onNavigate('mutual-funds')}
                className="px-4 py-2.5 rounded-2xl border border-[#E2E5E1] bg-[#F6F6F2] hover:bg-slate-200 text-[#0E2A1E] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-blue-600" /> AMFI Mutual Funds
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      {/* METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#5D6D66] uppercase block mb-1">Total Portfolio Value</span>
          <div className="text-2xl font-black text-[#0E2A1E]">{inr(totalPortfolioValue)}</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Across {totalHoldingsCount} holdings</p>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#5D6D66] uppercase block mb-1">Capital Invested</span>
          <div className="text-2xl font-black text-[#0E2A1E]">{inr(totalPortfolioCost)}</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Total cost basis</p>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#5D6D66] uppercase block mb-1">Unrealized Gain / P&amp;L</span>
          <div className={`text-2xl font-black ${totalProfit >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
            {totalProfit >= 0 ? '+' : ''}{inr(totalProfit)}
          </div>
          <p className={`text-xs font-bold mt-1 ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totalProfit >= 0 ? '+' : ''}{overallReturnPct}% Overall ROI
          </p>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#5D6D66] uppercase block mb-1">Asset Allocation</span>
          <div className="text-sm font-bold text-[#0E2A1E] flex justify-between mt-2">
            <span className="text-emerald-700">Stocks: {totalPortfolioValue > 0 ? Math.round((totalStocksValue / totalPortfolioValue) * 100) : 0}%</span>
            <span className="text-blue-700">MF: {totalPortfolioValue > 0 ? Math.round((totalMfValue / totalPortfolioValue) * 100) : 0}%</span>
            <span className="text-amber-700">Other: {totalPortfolioValue > 0 ? Math.round((totalOtherValue / totalPortfolioValue) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex mt-2">
            <div className="bg-emerald-600 h-full" style={{ width: `${totalPortfolioValue > 0 ? (totalStocksValue / totalPortfolioValue) * 100 : 0}%` }} />
            <div className="bg-blue-600 h-full" style={{ width: `${totalPortfolioValue > 0 ? (totalMfValue / totalPortfolioValue) * 100 : 0}%` }} />
            <div className="bg-amber-500 h-full" style={{ width: `${totalPortfolioValue > 0 ? (totalOtherValue / totalPortfolioValue) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[#E2E5E1] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          All Holdings ({totalHoldingsCount})
        </button>
        <button
          onClick={() => setActiveTab('stocks')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stocks' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-600" /> Stocks ({stockHoldings.length})
        </button>
        <button
          onClick={() => setActiveTab('mutual_funds')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'mutual_funds' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" /> Mutual Funds ({mfHoldings.length})
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'other' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-600" /> Gold, FD &amp; Other ({investments.length})
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'research' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-purple-600" /> Research &amp; Projections
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {totalHoldingsCount === 0 ? (
            <div className="bg-white border border-[#E2E5E1] rounded-3xl p-12 text-center space-y-4">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-[#0E2A1E]">No Investment Holdings Recorded</h3>
              <p className="text-xs text-[#5D6D66] max-w-md mx-auto">
                Your portfolio is currently clean. Add stock positions in the Stock Market module, explore 40,000+ mutual fund NAVs via the AMFI Tracker, or log direct holdings here.
              </p>
              {onNavigate && (
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('stock-market')}
                    className="px-4 py-2 bg-[#0E2A1E] text-white text-xs font-bold rounded-xl"
                  >
                    Open Stock Market
                  </button>
                  <button
                    onClick={() => onNavigate('mutual-funds')}
                    className="px-4 py-2 bg-[#1F7A52] text-white text-xs font-bold rounded-xl"
                  >
                    Open Mutual Fund Tracker
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-[#0E2A1E]">Combined Investment Holdings</h3>
                <span className="text-xs text-slate-500 font-semibold">{totalHoldingsCount} Active Assets</span>
              </div>

              {/* STOCKS TABLE */}
              {stockHoldings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> Equities &amp; Stocks ({stockHoldings.length})
                  </h4>
                  <div className="divide-y divide-[#E2E5E1] border border-[#E2E5E1] rounded-2xl overflow-hidden">
                    {stockHoldings.map((s) => (
                      <div key={s.id} className="p-4 bg-white flex justify-between items-center text-xs hover:bg-[#F6F6F2] transition-all">
                        <div>
                          <span className="font-black text-sm text-[#0E2A1E] block">{s.name} ({s.symbol})</span>
                          <span className="text-[11px] text-[#5D6D66]">
                            {s.quantity} shares @ {inr(s.buyPrice)} • Current Price: {inr(s.currentPrice)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm text-[#0E2A1E] block">{inr(s.currentValue)}</span>
                          <span className={`text-xs font-bold ${s.pnl >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
                            {s.pnl >= 0 ? '+' : ''}{inr(s.pnl)} ({s.pnlPercent >= 0 ? '+' : ''}{s.pnlPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MUTUAL FUNDS TABLE */}
              {mfHoldings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Mutual Funds ({mfHoldings.length})
                  </h4>
                  <div className="divide-y divide-[#E2E5E1] border border-[#E2E5E1] rounded-2xl overflow-hidden">
                    {mfHoldings.map((m) => (
                      <div key={m.id} className="p-4 bg-white flex justify-between items-center text-xs hover:bg-[#F6F6F2] transition-all">
                        <div>
                          <span className="font-black text-sm text-[#0E2A1E] block">{m.schemeName}</span>
                          <span className="text-[11px] text-[#5D6D66]">
                            Folio: {m.folioNumber} • {m.units.toFixed(2)} units • Live NAV: {inr(m.currentNav)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm text-[#0E2A1E] block">{inr(m.currentValue)}</span>
                          <span className={`text-xs font-bold ${m.unrealizedGain >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
                            {m.unrealizedGain >= 0 ? '+' : ''}{inr(m.unrealizedGain)} ({m.returnPercent >= 0 ? '+' : ''}{m.returnPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OTHER ASSETS TABLE */}
              {investments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" /> Gold, FD &amp; Other Holdings ({investments.length})
                  </h4>
                  <div className="divide-y divide-[#E2E5E1] border border-[#E2E5E1] rounded-2xl overflow-hidden">
                    {investments.map((inv) => (
                      <div key={inv.id} className="p-4 bg-white flex justify-between items-center text-xs hover:bg-[#F6F6F2] transition-all">
                        <div>
                          <span className="font-black text-sm text-[#0E2A1E] block">{inv.name}</span>
                          <span className="text-[11px] text-[#5D6D66]">
                            {inv.type} • {inv.quantity} units @ ₹{inv.avgCostBasis}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm text-[#0E2A1E] block">{inr(inv.currentValue)}</span>
                          <span className="text-xs font-bold text-emerald-600">+{inv.returnsPct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STOCKS TAB */}
      {activeTab === 'stocks' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Stock &amp; Equity Holdings</h3>
              <p className="text-xs text-[#5D6D66]">Current equities held in your portfolio.</p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('stock-market')}
                className="px-4 py-2 bg-[#0E2A1E] text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                Open Stock Market <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {stockHoldings.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No stock positions currently logged. Visit the Stock Market module to search NSE/BSE stocks and add holdings.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E5E1] border border-[#E2E5E1] rounded-2xl overflow-hidden">
              {stockHoldings.map((s) => (
                <div key={s.id} className="p-4 bg-white flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-sm text-[#0E2A1E] block">{s.name} ({s.symbol})</span>
                    <span className="text-[11px] text-[#5D6D66]">{s.quantity} units @ {inr(s.buyPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-[#0E2A1E] block">{inr(s.currentValue)}</span>
                    <span className={`text-xs font-bold ${s.pnl >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
                      {s.pnl >= 0 ? '+' : ''}{inr(s.pnl)} ({s.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MUTUAL FUNDS TAB */}
      {activeTab === 'mutual_funds' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Mutual Fund Schemes &amp; Folios</h3>
              <p className="text-xs text-[#5D6D66]">AMFI verified schemes and SIP investments.</p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('mutual-funds')}
                className="px-4 py-2 bg-[#1F7A52] text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                Open Mutual Funds Tracker <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {mfHoldings.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No mutual fund folios logged. Search all AMFI funds and add your SIPs in the Mutual Funds tracker.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E5E1] border border-[#E2E5E1] rounded-2xl overflow-hidden">
              {mfHoldings.map((m) => (
                <div key={m.id} className="p-4 bg-white flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-sm text-[#0E2A1E] block">{m.schemeName}</span>
                    <span className="text-[11px] text-[#5D6D66]">Folio: {m.folioNumber} • {m.units.toFixed(2)} units</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-[#0E2A1E] block">{inr(m.currentValue)}</span>
                    <span className={`text-xs font-bold ${m.unrealizedGain >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
                      {m.unrealizedGain >= 0 ? '+' : ''}{inr(m.unrealizedGain)} ({m.returnPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OTHER ASSETS TAB */}
      {activeTab === 'other' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Gold, Fixed Deposits &amp; Alternative Assets</h3>
              <p className="text-xs text-[#5D6D66]">Manual asset logging for complete net worth tracking.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#0E2A1E] text-white text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Asset
            </button>
          </div>

          {investments.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No additional assets registered. Click "Add Asset" above to log physical gold, SGBs, or fixed deposits.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E5E1] border border-[#E2E5E1] rounded-2xl overflow-hidden">
              {investments.map((inv) => (
                <div key={inv.id} className="p-4 bg-white flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-sm text-[#0E2A1E] block">{inv.name}</span>
                    <span className="text-[11px] text-[#5D6D66]">{inv.type} • {inv.quantity} units @ ₹{inv.avgCostBasis}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-[#0E2A1E] block">{inr(inv.currentValue)}</span>
                    <span className="text-xs font-bold text-emerald-600">+{inv.returnsPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RESEARCH TAB */}
      {activeTab === 'research' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-extrabold text-[#0E2A1E]">Investment Research Sandbox</h3>
              <p className="text-xs text-[#5D6D66]">Historical market data distinguished from AI scenario projections.</p>
            </div>
          </div>

          <div className="bg-[#F6F6F2] p-4 rounded-2xl border border-[#E2E5E1] flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks or mutual funds (e.g. Nifty 50, Reliance, Parag Parikh...)"
              className="w-full bg-white border border-[#E2E5E1] rounded-xl px-4 py-2.5 text-xs font-bold text-[#0E2A1E] focus:outline-none focus:border-[#1F7A52]"
            />
            <button className="px-5 py-2.5 bg-[#0E2A1E] text-white rounded-xl text-xs font-bold flex-shrink-0 cursor-pointer">
              Search
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#E4F0E9] border border-[#1F7A52]/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#1F7A52]">
              <Sparkles className="w-4 h-4" /> AI Historical Comparison &amp; Metric Review: {searchQuery}
            </div>
            <p className="text-slate-700 leading-relaxed">
              Historical 3-Year CAGR: <strong className="text-[#0E2A1E]">14.8%</strong> | Volatility: <strong className="text-[#0E2A1E]">12.2%</strong> | Expense Ratio: <strong className="text-[#0E2A1E]">0.12%</strong>.
            </p>
            <span className="text-[10px] text-slate-500 block italic pt-1">
              *Disclaimer: Past performance does not guarantee future returns. Finora provides mathematical scenario modeling.
            </span>
          </div>
        </div>
      )}

      {/* ADD HOLDING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-[#101A15]">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-[#0E2A1E]">Add Asset Holding</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sovereign Gold Bond 2028, HDFC Fixed Deposit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-2.5 py-2 text-xs font-semibold"
                  >
                    <option value="Gold">Gold / SGB</option>
                    <option value="Mutual Funds">Fixed Deposit / Debt</option>
                    <option value="ETFs">ETFs</option>
                    <option value="Stocks">Other Equities</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Quantity / Units</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Avg Cost (₹)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Current Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0E2A1E] text-white font-bold text-xs shadow-md cursor-pointer hover:bg-[#14372A] transition-all"
              >
                Save Asset Holding
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
