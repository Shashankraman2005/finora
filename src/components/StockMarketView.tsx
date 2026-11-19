import React, { useState, useEffect } from 'react';
import { useFinora } from '../data/FinoraContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Plus, 
  Trash2, 
  Bell, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  RefreshCw,
  Sparkles,
  BarChart2,
  CheckCircle2,
  AlertCircle
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
  MarketDataService, 
  BENCHMARK_MARKET_INDEXES, 
  POPULAR_EQUITIES_DATABASE,
  type StockQuote 
} from '../services/marketDataService';

export const StockMarketView: React.FC = () => {
  const { 
    stockHoldings, 
    addStockHolding, 
    deleteStockHolding, 
    watchlist, 
    addToWatchlist, 
    removeFromWatchlist 
  } = useFinora();

  const [activeTab, setActiveTab] = useState<'market' | 'watchlist' | 'portfolio'>('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>(POPULAR_EQUITIES_DATABASE.slice(0, 6));
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockQuote>(BENCHMARK_MARKET_INDEXES[0]);
  const [chartRange, setChartRange] = useState<'1M' | '3M' | '6M' | '1Y'>('1M');

  // Add Stock Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockSymbol, setStockSymbol] = useState('RELIANCE');
  const [stockName, setStockName] = useState('Reliance Industries Ltd');
  const [stockExchange, setStockExchange] = useState<'NSE' | 'BSE' | 'NASDAQ'>('NSE');
  const [stockQty, setStockQty] = useState(10);
  const [stockAvgPrice, setStockAvgPrice] = useState(1250);
  const [stockCurrentPrice, setStockCurrentPrice] = useState(1272.40);
  const [stockPurchaseDate, setStockPurchaseDate] = useState('2026-06-15');

  // Price Alert state
  const [alertStock, setAlertStock] = useState<StockQuote | null>(null);
  const [alertHigh, setAlertHigh] = useState<number | ''>('');
  const [alertLow, setAlertLow] = useState<number | ''>('');
  const [alertSuccess, setAlertSuccess] = useState('');

  // Search handler
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await MarketDataService.searchStocks(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const inr = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const usd = (n: number) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const formatPrice = (quote: StockQuote) => quote.currency === 'USD' ? usd(quote.currentPrice) : inr(quote.currentPrice);

  // Historical data for chart
  const historicalData = MarketDataService.getHistoricalPrices(
    selectedStock.symbol,
    selectedStock.currentPrice,
    chartRange
  );

  // Total Portfolio Metrics
  const totalStockInvested = stockHoldings.reduce((acc, s) => acc + s.investedAmount, 0);
  const totalStockCurrent = stockHoldings.reduce((acc, s) => acc + s.currentValue, 0);
  const totalStockPnL = totalStockCurrent - totalStockInvested;
  const totalStockReturnPct = totalStockInvested > 0 ? (totalStockPnL / totalStockInvested) * 100 : 0;

  const handleSelectSearchResult = (stock: StockQuote) => {
    setSelectedStock(stock);
    setStockSymbol(stock.symbol);
    setStockName(stock.name);
    setStockExchange((stock.exchange === 'NSE' || stock.exchange === 'BSE') ? stock.exchange : 'NASDAQ');
    setStockCurrentPrice(stock.currentPrice);
    setStockAvgPrice(Math.round(stock.currentPrice * 0.95));
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStockHolding({
      name: stockName,
      symbol: stockSymbol,
      exchange: stockExchange as any,
      quantity: Number(stockQty),
      avgPurchasePrice: Number(stockAvgPrice),
      purchaseDate: stockPurchaseDate,
      currentPrice: Number(stockCurrentPrice),
      dayChange: selectedStock?.priceChange || 0,
      dayChangePct: selectedStock?.percentageChange || 0,
      marketStatus: selectedStock?.marketStatus || 'Closed',
      lastUpdated: new Date().toISOString(),
      investedAmount: Number(stockQty) * Number(stockAvgPrice),
      currentValue: Number(stockQty) * Number(stockCurrentPrice),
      returnsPct: 0,
      unrealizedPnL: 0,
      allocationPct: 0
    });
    setShowAddModal(false);
  };

  const handleSavePriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertStock) return;

    addToWatchlist({
      symbol: alertStock.symbol,
      name: alertStock.name,
      exchange: alertStock.exchange,
      currentPrice: alertStock.currentPrice,
      priceChange: alertStock.priceChange,
      percentageChange: alertStock.percentageChange,
      dayHigh: alertStock.dayHigh,
      dayLow: alertStock.dayLow,
      previousClose: alertStock.previousClose,
      volume: alertStock.volume,
      marketStatus: alertStock.marketStatus,
      lastUpdated: alertStock.lastUpdated,
      priceAlertHigh: alertHigh ? Number(alertHigh) : undefined,
      priceAlertLow: alertLow ? Number(alertLow) : undefined
    });

    setAlertSuccess(`Price alert set for ${alertStock.symbol}!`);
    setTimeout(() => {
      setAlertSuccess('');
      setAlertStock(null);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-black flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Indian &amp; Global Market Terminal
            </span>
            <span className="text-xs font-semibold text-slate-500">
              NSE • BSE • NIFTY 50 • SENSEX • NASDAQ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A1E] tracking-tight">
            Stock Market Intelligence &amp; Holdings
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D66] mt-0.5">
            Real-time and official end-of-day quotes, watchlists, technical charts, and genuine portfolio tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#34D399]" /> Add Stock Holding
          </button>
        </div>
      </div>

      {/* BENCHMARK TICKER TICKETS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {BENCHMARK_MARKET_INDEXES.map(idx => {
          const isPos = idx.priceChange >= 0;
          return (
            <div 
              key={idx.symbol}
              onClick={() => setSelectedStock(idx)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                selectedStock.symbol === idx.symbol
                  ? 'bg-white border-[#1F7A52] shadow-md ring-2 ring-[#1F7A52]/20'
                  : 'bg-white border-[#E2E5E1] hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-black text-xs text-[#0E2A1E]">{idx.symbol}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {idx.exchange}
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-[#0E2A1E] mt-1">
                {idx.currency === 'USD' ? usd(idx.currentPrice) : inr(idx.currentPrice)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold mt-0.5">
                <span className={isPos ? 'text-[#1F7A52] flex items-center' : 'text-rose-600 flex items-center'}>
                  {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                  {isPos ? '+' : ''}{idx.priceChange} ({isPos ? '+' : ''}{idx.percentageChange}%)
                </span>
              </div>
              <div className="text-[10px] text-[#5D6D66] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>{idx.dataFreshness}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 TABS: MARKET OVERVIEW, WATCHLIST, PORTFOLIO */}
      <div className="flex border-b border-[#E2E5E1] gap-6 text-xs font-black">
        <button
          onClick={() => setActiveTab('market')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'market' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          Market Terminal &amp; Technical Chart
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'watchlist' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          <span>Watchlist &amp; Alerts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-[10px]">
            {watchlist.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'portfolio' ? 'border-[#0E2A1E] text-[#0E2A1E]' : 'border-transparent text-[#5D6D66] hover:text-[#101A15]'
          }`}
        >
          <span>Stock Portfolio</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#0E2A1E] text-[#34D399] text-[10px]">
            {stockHoldings.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MARKET OVERVIEW & CHART */}
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLS: ACTIVE STOCK CHART & DETAILS */}
          <div className="lg:col-span-2 bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Top quote row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E5E1]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#0E2A1E]">{selectedStock.symbol}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold">
                    {selectedStock.exchange}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    selectedStock.marketStatus === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedStock.marketStatus}
                  </span>
                </div>
                <p className="text-xs text-[#5D6D66] font-medium mt-0.5">{selectedStock.name}</p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-black text-[#0E2A1E]">
                  {formatPrice(selectedStock)}
                </div>
                <div className={`text-xs font-bold ${selectedStock.priceChange >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
                  {selectedStock.priceChange >= 0 ? '+' : ''}{selectedStock.priceChange} ({selectedStock.priceChange >= 0 ? '+' : ''}{selectedStock.percentageChange}%)
                </div>
              </div>
            </div>

            {/* Price Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F6F6F2] p-4 rounded-2xl border border-[#E2E5E1] text-xs">
              <div>
                <span className="text-[#5D6D66] block">Day High</span>
                <strong className="text-[#0E2A1E] font-bold">
                  {selectedStock.currency === 'USD' ? usd(selectedStock.dayHigh) : inr(selectedStock.dayHigh)}
                </strong>
              </div>
              <div>
                <span className="text-[#5D6D66] block">Day Low</span>
                <strong className="text-[#0E2A1E] font-bold">
                  {selectedStock.currency === 'USD' ? usd(selectedStock.dayLow) : inr(selectedStock.dayLow)}
                </strong>
              </div>
              <div>
                <span className="text-[#5D6D66] block">Previous Close</span>
                <strong className="text-[#0E2A1E] font-bold">
                  {selectedStock.currency === 'USD' ? usd(selectedStock.previousClose) : inr(selectedStock.previousClose)}
                </strong>
              </div>
              <div>
                <span className="text-[#5D6D66] block">Volume</span>
                <strong className="text-[#0E2A1E] font-bold">
                  {selectedStock.volume ? selectedStock.volume.toLocaleString() : '—'}
                </strong>
              </div>
            </div>

            {/* Timeframe Selector & Chart */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#5D6D66] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Freshness: <strong className="text-[#0E2A1E]">{selectedStock.dataFreshness}</strong> ({selectedStock.lastUpdated})
                </span>

                <div className="flex bg-[#F6F6F2] p-1 rounded-xl border border-[#E2E5E1] text-xs font-bold">
                  {(['1M', '3M', '6M', '1Y'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        chartRange === range ? 'bg-[#0E2A1E] text-white' : 'text-[#5D6D66] hover:text-[#0E2A1E]'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1F7A52" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#1F7A52" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E1" vertical={false} />
                    <XAxis dataKey="date" stroke="#5D6D66" fontSize={10} tickFormatter={d => d.slice(5)} />
                    <YAxis 
                      stroke="#5D6D66" 
                      fontSize={10} 
                      domain={['auto', 'auto']}
                      tickFormatter={v => selectedStock.currency === 'USD' ? `$${v}` : `₹${v}`} 
                    />
                    <Tooltip formatter={(value: any) => selectedStock.currency === 'USD' ? usd(Number(value)) : inr(Number(value))} />
                    <Area type="monotone" dataKey="price" stroke="#1F7A52" strokeWidth={2.5} fill="url(#stockAreaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Actions: Add to Watchlist / Set Alert / Add to Portfolio */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E2E5E1]">
              <button
                onClick={() => {
                  addToWatchlist({
                    symbol: selectedStock.symbol,
                    name: selectedStock.name,
                    exchange: selectedStock.exchange,
                    currentPrice: selectedStock.currentPrice,
                    priceChange: selectedStock.priceChange,
                    percentageChange: selectedStock.percentageChange,
                    dayHigh: selectedStock.dayHigh,
                    dayLow: selectedStock.dayLow,
                    previousClose: selectedStock.previousClose,
                    volume: selectedStock.volume,
                    marketStatus: selectedStock.marketStatus,
                    lastUpdated: selectedStock.lastUpdated
                  });
                }}
                className="px-4 py-2 rounded-xl bg-[#E4F0E9] text-[#1F7A52] hover:bg-[#d5e7dc] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add to Watchlist
              </button>

              <button
                onClick={() => {
                  setAlertStock(selectedStock);
                  setAlertHigh(Math.round(selectedStock.currentPrice * 1.05));
                  setAlertLow(Math.round(selectedStock.currentPrice * 0.95));
                }}
                className="px-4 py-2 rounded-xl border border-[#E2E5E1] hover:bg-[#F6F6F2] text-[#0E2A1E] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" /> Set Price Alert
              </button>

              <button
                onClick={() => {
                  handleSelectSearchResult(selectedStock);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0E2A1E] hover:bg-[#14372A] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
              >
                <Plus className="w-3.5 h-3.5 text-[#34D399]" /> Log in Portfolio
              </button>
            </div>

          </div>

          {/* RIGHT COL: STOCK SEARCH & POPULAR EQUITIES */}
          <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0E2A1E]">Stock &amp; Index Finder</h3>
              <p className="text-xs text-[#5D6D66]">Search NSE, BSE and US tickers</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search RELIANCE, TCS, INFY, AAPL..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-[#101A15] focus:outline-none focus:border-[#1F7A52] focus:bg-white"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {searchResults.map(stock => {
                const isPos = stock.priceChange >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectSearchResult(stock)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedStock.symbol === stock.symbol
                        ? 'bg-[#E4F0E9] border-[#1F7A52]'
                        : 'bg-[#F6F6F2]/70 hover:bg-[#F6F6F2] border-[#E2E5E1]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-[#0E2A1E]">{stock.symbol}</span>
                        <span className="text-[9px] font-bold px-1 rounded bg-slate-200 text-slate-700">
                          {stock.exchange}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5D6D66] line-clamp-1">{stock.name}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-[#0E2A1E] block">
                        {stock.currency === 'USD' ? usd(stock.currentPrice) : inr(stock.currentPrice)}
                      </span>
                      <span className={`text-[10px] font-bold ${isPos ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
                        {isPos ? '+' : ''}{stock.percentageChange}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] text-[11px] text-[#5D6D66] space-y-1">
              <span className="font-bold text-[#0E2A1E] block">Genuine Market Data Notice:</span>
              <p>
                Finora distinguishes real-time exchange feeds, 15-minute delayed quotes, and verified end-of-day NAVs. Never fabricates live prices.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: WATCHLIST & ALERTS */}
      {activeTab === 'watchlist' && (
        <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold text-[#0E2A1E]">Your Stock Watchlist</h2>
              <p className="text-xs text-[#5D6D66]">Monitor daily price movements and trigger price limit notifications.</p>
            </div>
          </div>

          {watchlist.length > 0 ? (
            <div className="border border-[#E2E5E1] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F6F2] border-b border-[#E2E5E1] text-[#5D6D66] font-bold">
                  <tr>
                    <th className="py-3 px-4">Symbol / Name</th>
                    <th className="py-3 px-4">Exchange</th>
                    <th className="py-3 px-4">Current Price</th>
                    <th className="py-3 px-4">Day Change</th>
                    <th className="py-3 px-4">Day High / Low</th>
                    <th className="py-3 px-4">Target Alert Range</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E1]">
                  {watchlist.map(item => {
                    const isPos = item.priceChange >= 0;
                    return (
                      <tr key={item.id} className="hover:bg-[#F6F6F2]/50 transition-all">
                        <td className="py-3 px-4">
                          <span className="font-black text-xs text-[#0E2A1E] block">{item.symbol}</span>
                          <span className="text-[11px] text-[#5D6D66]">{item.name}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-600">
                          {item.exchange}
                        </td>
                        <td className="py-3 px-4 font-black text-[#0E2A1E]">
                          {inr(item.currentPrice)}
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span className={isPos ? 'text-[#1F7A52]' : 'text-rose-600'}>
                            {isPos ? '+' : ''}{item.priceChange} ({isPos ? '+' : ''}{item.percentageChange}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#5D6D66]">
                          {inr(item.dayHigh)} / {inr(item.dayLow)}
                        </td>
                        <td className="py-3 px-4">
                          {item.priceAlertHigh || item.priceAlertLow ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              Low: {item.priceAlertLow ? inr(item.priceAlertLow) : '—'} • High: {item.priceAlertHigh ? inr(item.priceAlertHigh) : '—'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No alerts set</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => removeFromWatchlist(item.symbol)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove from watchlist"
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
              <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-[#0E2A1E]">Your watchlist is currently empty</h3>
              <p className="text-xs text-[#5D6D66] max-w-sm mx-auto">
                Search Indian or global stocks in the Market Terminal tab and click "Add to Watchlist" to track live movements.
              </p>
              <button
                onClick={() => setActiveTab('market')}
                className="px-5 py-2.5 rounded-2xl bg-[#0E2A1E] text-white text-xs font-bold hover:bg-[#14372A] transition-all cursor-pointer shadow-sm"
              >
                Search Stocks to Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PORTFOLIO */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-[#5D6D66]">Total Invested Capital</span>
              <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
                {totalStockInvested > 0 ? inr(totalStockInvested) : '₹0'}
              </div>
              <span className="text-[11px] text-[#5D6D66]">{stockHoldings.length} active holdings</span>
            </div>

            <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-[#5D6D66]">Current Market Valuation</span>
              <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
                {totalStockCurrent > 0 ? inr(totalStockCurrent) : '₹0'}
              </div>
              <span className="text-[11px] text-[#5D6D66]">Real-time / EOD quotes</span>
            </div>

            <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-[#5D6D66]">Unrealised Profit / Loss</span>
              <div className={`text-xl sm:text-2xl font-black ${totalStockPnL >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
                {totalStockPnL >= 0 ? '+' : ''}{inr(totalStockPnL)}
              </div>
              <span className={`text-[11px] font-bold ${totalStockPnL >= 0 ? 'text-[#1F7A52]' : 'text-rose-600'}`}>
                {totalStockPnL >= 0 ? '+' : ''}{totalStockReturnPct.toFixed(2)}% absolute return
              </span>
            </div>

            <div className="bg-white border border-[#E2E5E1] rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-[#5D6D66]">Portfolio Allocation</span>
              <div className="text-xl sm:text-2xl font-black text-[#0E2A1E]">
                {stockHoldings.length > 0 ? 'Equities' : '—'}
              </div>
              <span className="text-[11px] text-[#5D6D66]">Direct Equity Holdings</span>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-[#0E2A1E]">Direct Equity Holdings</h3>
                <p className="text-xs text-[#5D6D66]">Calculated from actual shares and connected market prices.</p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-[#0E2A1E] text-white text-xs font-bold hover:bg-[#14372A] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#34D399]" /> Add Holding
              </button>
            </div>

            {stockHoldings.length > 0 ? (
              <div className="border border-[#E2E5E1] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F6F2] border-b border-[#E2E5E1] text-[#5D6D66] font-bold">
                    <tr>
                      <th className="py-3 px-4">Stock Name / Symbol</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Purchase Price</th>
                      <th className="py-3 px-4">Current Price</th>
                      <th className="py-3 px-4">Invested</th>
                      <th className="py-3 px-4">Current Value</th>
                      <th className="py-3 px-4">P&amp;L (%)</th>
                      <th className="py-3 px-4">Allocation</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E5E1]">
                    {stockHoldings.map(stock => {
                      const isProfit = stock.currentPrice >= stock.avgPurchasePrice;
                      return (
                        <tr key={stock.id} className="hover:bg-[#F6F6F2]/50 transition-all">
                          <td className="py-3 px-4">
                            <span className="font-black text-xs text-[#0E2A1E] block">{stock.symbol}</span>
                            <span className="text-[11px] text-[#5D6D66]">{stock.name}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#0E2A1E]">
                            {stock.quantity}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {inr(stock.avgPurchasePrice)}
                          </td>
                          <td className="py-3 px-4 font-black text-[#0E2A1E]">
                            {inr(stock.currentPrice)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {inr(stock.investedAmount)}
                          </td>
                          <td className="py-3 px-4 font-black text-[#0E2A1E]">
                            {inr(stock.currentValue)}
                          </td>
                          <td className="py-3 px-4 font-bold">
                            <span className={isProfit ? 'text-[#1F7A52]' : 'text-rose-600'}>
                              {isProfit ? '+' : ''}{inr(stock.unrealizedPnL)} ({isProfit ? '+' : ''}{stock.returnsPct}%)
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-600">
                            {stock.allocationPct}%
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => deleteStockHolding(stock.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete holding"
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
              <div className="text-center py-10 space-y-3">
                <BarChart2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#0E2A1E]">No stock holdings logged yet</h4>
                <p className="text-xs text-[#5D6D66] max-w-sm mx-auto">
                  Click "Add Stock Holding" above to log your direct stock investments and calculate live unrealised returns.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD STOCK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-[#101A15]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-[#0E2A1E]">Add Stock Holding</h3>
                <p className="text-xs text-[#5D6D66]">Log an actual stock purchase into your portfolio.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Stock Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RELIANCE, TCS, INFY"
                  value={stockSymbol}
                  onChange={e => setStockSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Company / Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Industries Limited"
                  value={stockName}
                  onChange={e => setStockName(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Exchange</label>
                  <select
                    value={stockExchange}
                    onChange={e => setStockExchange(e.target.value as any)}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="NSE">NSE (India)</option>
                    <option value="BSE">BSE (India)</option>
                    <option value="NASDAQ">NASDAQ (US)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Quantity (Shares)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockQty}
                    onChange={e => setStockQty(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={stockAvgPrice}
                    onChange={e => setStockAvgPrice(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5D6D66] block mb-1">Current Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={stockCurrentPrice}
                    onChange={e => setStockCurrentPrice(Number(e.target.value))}
                    className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={stockPurchaseDate}
                  onChange={e => setStockPurchaseDate(e.target.value)}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#E4F0E9] text-[11px] text-[#1F7A52] font-semibold">
                Total Invested: <strong>{inr(stockQty * stockAvgPrice)}</strong> • Current Value: <strong>{inr(stockQty * stockCurrentPrice)}</strong>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#0E2A1E] hover:bg-[#14372A] text-white font-black text-xs shadow-md shadow-[#0E2A1E]/20 transition-all cursor-pointer"
              >
                Save Stock to Portfolio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRICE ALERT MODAL */}
      {alertStock && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E5E1] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-[#101A15]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-[#0E2A1E]">Set Price Alert</h3>
              </div>
              <button onClick={() => setAlertStock(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <p className="text-xs text-[#5D6D66]">
              Set high and low target thresholds for <strong>{alertStock.symbol}</strong> (Current: {formatPrice(alertStock)}).
            </p>

            {alertSuccess && (
              <div className="p-2.5 rounded-xl bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {alertSuccess}
              </div>
            )}

            <form onSubmit={handleSavePriceAlert} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Target High Price Alert (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={alertHigh}
                  onChange={e => setAlertHigh(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5D6D66] block mb-1">Target Low / Stop Loss Alert (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={alertLow}
                  onChange={e => setAlertLow(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#F6F6F2] border border-[#E2E5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F7A52]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0E2A1E] text-white font-bold text-xs hover:bg-[#14372A] transition-all cursor-pointer"
              >
                Save Alert to Watchlist
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
