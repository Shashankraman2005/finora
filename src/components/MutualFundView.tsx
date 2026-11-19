import React, { useState, useEffect } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  TrendingUp, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  PieChart as PieIcon,
  DollarSign,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  MutualFundService, 
  POPULAR_INDIAN_MUTUAL_FUNDS, 
  type MFDetails, 
  type MFSchemeSearchResult 
} from '../services/mutualFundService';

export const MutualFundView: React.FC = () => {
  const { 
    mfHoldings, 
    addMutualFundHolding, 
    deleteMutualFundHolding 
  } = useFinora();

  const [activeTab, setActiveTab] = useState<'holdings' | 'search' | 'sip_calculator'>('holdings');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MFSchemeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFund, setSelectedFund] = useState<MFDetails>(POPULAR_INDIAN_MUTUAL_FUNDS[0]);
  const [isLoadingFund, setIsLoadingFund] = useState(false);

  // Add Holding Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [schemeCode, setSchemeCode] = useState(POPULAR_INDIAN_MUTUAL_FUNDS[0].schemeCode);
  const [schemeName, setSchemeName] = useState(POPULAR_INDIAN_MUTUAL_FUNDS[0].schemeName);
  const [units, setUnits] = useState(450);
  const [purchaseNav, setPurchaseNav] = useState(65);
  const [currentNav, setCurrentNav] = useState(POPULAR_INDIAN_MUTUAL_FUNDS[0].currentNav);
  const [sipActive, setSipActive] = useState(true);
  const [sipAmount, setSipAmount] = useState(5000);

  // SIP Calculator State
  const [calcMonthlySIP, setCalcMonthlySIP] = useState(10000);
  const [calcReturnRate, setCalcReturnRate] = useState(13);
  const [calcYears, setCalcYears] = useState(10);

  // Search funds
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await MutualFundService.searchFunds(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const inr = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  // Select Fund from Search
  const handleSelectFund = async (result: MFSchemeSearchResult) => {
    setIsLoadingFund(true);
    const details = await MutualFundService.getFundDetails(result.schemeCode);
    if (details) {
      setSelectedFund(details);
      setSchemeCode(details.schemeCode);
      setSchemeName(details.schemeName);
      setCurrentNav(details.currentNav);
      setPurchaseNav(Math.round(details.currentNav * 0.85));
    }
    setIsLoadingFund(false);
  };

  const handleAddHoldingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutualFundHolding({
      schemeCode,
      schemeName,
      fundHouse: selectedFund?.fundHouse,
      schemeCategory: selectedFund?.schemeCategory,
      units: Number(units),
      purchaseNav: Number(purchaseNav),
      currentNav: Number(currentNav),
      navDate: selectedFund?.navDate || new Date().toISOString().split('T')[0],
      investedAmount: Number(units) * Number(purchaseNav),
      currentValue: Number(units) * Number(currentNav),
      returnsPct: 0,
      unrealizedPnL: 0,
      sipActive,
      sipAmount: sipActive ? Number(sipAmount) : undefined,
      allocationPct: 0
    });
    setShowAddModal(false);
  };

  // SIP Projections
  const sipResult = MutualFundService.calculateSIPProjections(calcMonthlySIP, calcReturnRate, calcYears);

  // Totals across portfolio
  const totalMfInvested = mfHoldings.reduce((acc, m) => acc + m.investedAmount, 0);
  const totalMfCurrent = mfHoldings.reduce((acc, m) => acc + m.currentValue, 0);
  const totalMfPnL = totalMfCurrent - totalMfInvested;
  const totalMfReturnPct = totalMfInvested > 0 ? (totalMfPnL / totalMfInvested) * 100 : 0;
  const activeSipMonthlyTotal = mfHoldings.filter(m => m.sipActive && m.sipAmount).reduce((acc, m) => acc + (m.sipAmount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AMFI Verified NAV Tracker
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Association of Mutual Funds in India (AMFI) Feed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Indian Mutual Funds &amp; SIP Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D66] mt-0.5">
            Search 40,000+ registered mutual funds, track NAV daily, monitor SIPs, and calculate XIRR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#34D399]" /> Add Mutual Fund
          </button>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Total MF Invested</span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalMfInvested > 0 ? inr(totalMfInvested) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">{mfHoldings.length} active schemes</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Current Portfolio NAV Value</span>
          <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
            {totalMfCurrent > 0 ? inr(totalMfCurrent) : '₹0'}
          </div>
          <span className="text-[11px] text-[#5D6D66]">AMFI daily net asset value</span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Unrealised Returns</span>
          <div className={`text-xl sm:text-2xl font-black ${totalMfPnL >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
            {totalMfPnL >= 0 ? '+' : ''}{inr(totalMfPnL)}
          </div>
          <span className={`text-[11px] font-bold ${totalMfPnL >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
            {totalMfPnL >= 0 ? '+' : ''}{totalMfReturnPct.toFixed(2)}% absolute return
          </span>
        </div>

        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#5D6D66]">Monthly Active SIPs</span>
          <div className="text-xl sm:text-2xl font-black text-[#1F7A52]">
            {inr(activeSipMonthlyTotal)}
          </div>
          <span className="text-[11px] text-[#5D6D66]">Automatic monthly auto-debit</span>
        </div>
      </div>

      {/* 3 TABS */}
      <div className="flex border-b border-[#E2E5E1] gap-6 text-xs font-black">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'holdings' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          My Mutual Fund Holdings ({mfHoldings.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'search' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          AMFI Live NAV Explorer
        </button>
        <button
          onClick={() => setActiveTab('sip_calculator')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'sip_calculator' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          SIP Compounding &amp; XIRR Calculator
        </button>
      </div>

      {/* TAB 1: HOLDINGS */}
      {activeTab === 'holdings' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Tracked Mutual Fund Portfolios</h3>
              <p className="text-xs text-[#5D6D66]">Units, NAV valuation, and SIP schedules.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0E2A1E] text-white text-xs font-bold hover:bg-[#14372A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#34D399]" /> Add Scheme
            </button>
          </div>

          {mfHoldings.length > 0 ? (
            <div className="border border-[#E2E5E1] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F6F2] border-b border-[#E2E5E1] text-[#5D6D66] font-bold">
                  <tr>
                    <th className="py-3 px-4">Scheme Name</th>
                    <th className="py-3 px-4">Units</th>
                    <th className="py-3 px-4">Avg NAV</th>
                    <th className="py-3 px-4">Current NAV</th>
                    <th className="py-3 px-4">Invested</th>
                    <th className="py-3 px-4">Current Value</th>
                    <th className="py-3 px-4">Returns (%)</th>
                    <th className="py-3 px-4">SIP Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E1]">
                  {mfHoldings.map(mf => {
                    const isProfit = mf.currentNav >= mf.purchaseNav;
                    return (
                      <tr key={mf.id} className="hover:bg-[#F6F6F2]/50 transition-all">
                        <td className="py-3 px-4">
                          <span className="font-black text-xs text-[#0E2A1E] block line-clamp-1">{mf.schemeName}</span>
                          <span className="text-[10px] text-[#5D6D66]">Code: {mf.schemeCode} • As of {mf.navDate}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#0E2A1E]">
                          {mf.units.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {inr(mf.purchaseNav)}
                        </td>
                        <td className="py-3 px-4 font-black text-[#0E2A1E]">
                          {inr(mf.currentNav)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {inr(mf.investedAmount)}
                        </td>
                        <td className="py-3 px-4 font-black text-[#0E2A1E]">
                          {inr(mf.currentValue)}
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span className={isProfit ? 'text-[#1F7A52]' : 'text-rose-600'}>
                            {isProfit ? '+' : ''}{inr(mf.unrealizedPnL)} ({isProfit ? '+' : ''}{mf.returnsPct}%)
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {mf.sipActive ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#E4F0E9] text-[#1F7A52] text-[10px] font-bold">
                              SIP Active: {inr(mf.sipAmount || 0)}/mo
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Lump Sum</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteMutualFundHolding(mf.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-[#0E2A1E]">No mutual fund holdings added yet</h4>
              <p className="text-xs text-[#5D6D66] max-w-sm mx-auto">
                Search Indian mutual funds in the AMFI Live NAV Explorer or click "Add Mutual Fund" to track your folio.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AMFI EXPLORER */}
      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SEARCH & RESULTS LIST */}
          <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">AMFI Mutual Fund Search</h3>
              <p className="text-xs text-[#5D6D66]">Real-time official AMFI database query</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Parag Parikh, HDFC, UTI Nifty..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {searchResults.map(result => (
                <div
                  key={result.schemeCode}
                  onClick={() => handleSelectFund(result)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedFund.schemeCode === result.schemeCode
                      ? 'bg-[#E4F0E9] border-[#1F7A52]'
                      : 'bg-[#F6F6F2]/70 hover:bg-[#F6F6F2] border-[#E2E5E1]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#0E2A1E] block line-clamp-2">{result.schemeName}</span>
                  <span className="text-[10px] text-[#5D6D66] mt-1 block">Code: {result.schemeCode}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FUND DETAILS & NAV PERFORMANCE CHART */}
          <div className="lg:col-span-2 bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E5E1] gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-[#E4F0E9] text-[#1F7A52] text-[10px] font-bold">
                  {selectedFund.schemeCategory || 'Open-Ended Scheme'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#0E2A1E] mt-1">{selectedFund.schemeName}</h2>
                <span className="text-xs text-[#5D6D66] font-medium">{selectedFund.fundHouse}</span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-2xl sm:text-3xl font-black text-[#0E2A1E] block">
                  {inr(selectedFund.currentNav)}
                </span>
                <span className="text-[11px] text-[#5D6D66]">Official NAV as of {selectedFund.navDate}</span>
              </div>
            </div>

            {/* Historical NAV Chart */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#5D6D66] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1F7A52]" /> AMFI Historical NAV Performance
              </span>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedFund.history || []}>
                    <defs>
                      <linearGradient id="mfNavGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1F7A52" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#1F7A52" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E1" vertical={false} />
                    <XAxis dataKey="date" stroke="#5D6D66" fontSize={10} />
                    <YAxis stroke="#5D6D66" fontSize={10} domain={['auto', 'auto']} tickFormatter={v => `₹${v}`} />
                    <Tooltip formatter={(value: any) => inr(Number(value))} />
                    <Area type="monotone" dataKey="nav" stroke="#1F7A52" strokeWidth={2.5} fill="url(#mfNavGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setSchemeCode(selectedFund.schemeCode);
                  setSchemeName(selectedFund.schemeName);
                  setCurrentNav(selectedFund.currentNav);
                  setPurchaseNav(Math.round(selectedFund.currentNav * 0.85));
                  setShowAddModal(true);
                }}
                className="px-6 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-extrabold text-xs shadow-md shadow-[#0E2A1E]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#34D399]" />
                <span>Add This Scheme to My Portfolio</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SIP CALCULATOR */}
      {activeTab === 'sip_calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-[#0E2A1E]">SIP Compounding Calculator</h3>
              <p className="text-xs text-[#5D6D66]">Compute estimated wealth creation with regular SIP investments.</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#5D6D66]">Monthly SIP Investment</span>
                  <span className="text-[#0E2A1E]">{inr(calcMonthlySIP)}/mo</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={calcMonthlySIP}
                  onChange={e => setCalcMonthlySIP(Number(e.target.value))}
                  className="w-full accent-[#1F7A52]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#5D6D66]">Expected Annual Return (CAGR)</span>
                  <span className="text-[#0E2A1E]">{calcReturnRate}%</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="25"
                  step="0.5"
                  value={calcReturnRate}
                  onChange={e => setCalcReturnRate(Number(e.target.value))}
                  className="w-full accent-[#1F7A52]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#5D6D66]">Time Horizon</span>
                  <span className="text-[#0E2A1E]">{calcYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  value={calcYears}
                  onChange={e => setCalcYears(Number(e.target.value))}
                  className="w-full accent-[#1F7A52]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0E2A1E] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#34D399]">
                Estimated Maturity Corpus
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {inr(sipResult.estimatedFutureValue)}
              </div>
              <p className="text-xs text-slate-300">
                Over {calcYears} years at {calcReturnRate}% expected returns.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Total Invested Capital:</span>
                <strong className="text-white">{inr(sipResult.investedAmount)}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Estimated Wealth Gain:</span>
                <strong className="text-[#34D399]">+{inr(sipResult.estimatedWealthGain)}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Absolute Returns:</span>
                <strong className="text-[#34D399]">+{sipResult.absoluteReturnPct}%</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MUTUAL FUND MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-[#101A15]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-[#0E2A1E]">Add Mutual Fund Holding</h3>
                <p className="text-xs text-[#5D6D66]">Log your units and track real-time AMFI NAV.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddHoldingSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">AMFI Scheme Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 122639"
                  value={schemeCode}
                  onChange={e => setSchemeCode(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Scheme Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parag Parikh Flexi Cap Fund"
                  value={schemeName}
                  onChange={e => setSchemeName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Units Purchased</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={units}
                    onChange={e => setUnits(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Purchase NAV (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchaseNav}
                    onChange={e => setPurchaseNav(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Current AMFI NAV (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={currentNav}
                  onChange={e => setCurrentNav(Number(e.target.value))}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sip_active"
                  checked={sipActive}
                  onChange={e => setSipActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F7A52]"
                />
                <label htmlFor="sip_active" className="text-xs font-bold text-[#0E2A1E] cursor-pointer">
                  Active Recurring Monthly SIP
                </label>
              </div>

              {sipActive && (
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Monthly SIP Amount (₹)</label>
                  <input
                    type="number"
                    value={sipAmount}
                    onChange={e => setSipAmount(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2 text-xs font-semibold"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#E4F0E9] text-[11px] text-[#1F7A52] font-semibold">
                Total Invested: <strong>{inr(units * purchaseNav)}</strong> • Current Value: <strong>{inr(units * currentNav)}</strong>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-black text-xs shadow-md shadow-[#0E2A1E]/20 transition-all cursor-pointer"
              >
                Save Mutual Fund to Portfolio
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
