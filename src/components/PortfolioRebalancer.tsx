import React, { useState } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  Activity,
  Layers
} from 'lucide-react';

export interface AssetClass {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetPercent: number;
  color: string;
}

const INITIAL_ASSETS: AssetClass[] = [
  { id: 'a1', name: 'Domestic Equity (Large Cap Index)', category: 'Equity', currentValue: 1850000, targetPercent: 40, color: '#0E2A1E' },
  { id: 'a2', name: 'Mid & Small Cap Funds', category: 'Equity', currentValue: 950000, targetPercent: 20, color: '#1F7A52' },
  { id: 'a3', name: 'Debt & Corporate Bonds', category: 'Debt', currentValue: 650000, targetPercent: 20, color: '#34D399' },
  { id: 'a4', name: 'Physical & Sovereign Gold', category: 'Gold', currentValue: 350000, targetPercent: 10, color: '#D97706' },
  { id: 'a5', name: 'US & Global Equity ETF', category: 'Equity', currentValue: 250000, targetPercent: 5, color: '#4F46E5' },
  { id: 'a6', name: 'Liquid Savings & Emergency Cash', category: 'Cash', currentValue: 450000, targetPercent: 5, color: '#64748B' },
];

export const PortfolioRebalancer: React.FC = () => {
  const [assets, setAssets] = useState<AssetClass[]>(INITIAL_ASSETS);
  
  // Market Stress Simulator State
  const [niftyShockPercent, setNiftyShockPercent] = useState<number>(0); // -30% to +30%
  const [interestRateBps, setInterestRateBps] = useState<number>(0);   // -200 bps to +200 bps

  const inr = (n: number) => {
    const rounded = Math.round(n);
    return '₹' + rounded.toLocaleString('en-IN');
  };

  const totalPortfolioValue = assets.reduce((acc, a) => acc + a.currentValue, 0);

  const handleUpdateTarget = (id: string, newTarget: number) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, targetPercent: newTarget } : a)));
  };

  const totalTargetPercent = assets.reduce((acc, a) => acc + a.targetPercent, 0);

  // Rebalance Engine Orders Computation
  const computeRebalanceOrders = () => {
    return assets.map((a) => {
      const currentPct = (a.currentValue / totalPortfolioValue) * 100;
      const targetValue = (totalPortfolioValue * a.targetPercent) / 100;
      const difference = targetValue - a.currentValue;
      const action = difference > 1000 ? 'BUY' : difference < -1000 ? 'SELL' : 'HOLD';

      return {
        ...a,
        currentPct,
        targetValue,
        difference: Math.abs(difference),
        action,
      };
    });
  };

  const orders = computeRebalanceOrders();
  const totalRebalanceTurnover = orders.reduce((acc, o) => acc + (o.action !== 'HOLD' ? o.difference : 0), 0) / 2;

  // Compute Stressed Portfolio Value
  const computeStressedValue = () => {
    return assets.reduce((acc, a) => {
      let val = a.currentValue;
      if (a.category === 'Equity') {
        val *= (1 + niftyShockPercent / 100);
      } else if (a.category === 'Debt') {
        // Bond prices fall when interest rates rise: Duration approx 4 yrs
        val *= (1 - (interestRateBps / 10000) * 4);
      }
      return acc + val;
    }, 0);
  };

  const stressedPortfolioValue = computeStressedValue();
  const stressedDelta = stressedPortfolioValue - totalPortfolioValue;

  return (
    <div className="space-y-8 animate-fade-in text-[#101A15]">
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E4F0E9] text-[#1F7A52] text-xs font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Smart Asset Allocation Engine
            </span>
            <span className="text-xs font-semibold text-slate-500">Tax-Aware Portfolio Rebalancing</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0E2A1E] tracking-tight">
            Portfolio Rebalancer &amp; Stress Tester
          </h1>
          <p className="text-sm text-[#5D6D66] mt-1 max-w-2xl">
            Align your asset allocation to target risk weights. Generate instant buy/sell rebalance orders and stress-test your portfolio against market flash crashes.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E2A1E] text-white flex items-center gap-4 flex-shrink-0 shadow-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Total Portfolio Net Worth</span>
            <span className="text-2xl font-black text-[#34D399]">{inr(totalPortfolioValue)}</span>
          </div>
        </div>
      </div>

      {/* WARNING IF TARGET % DOES NOT EQUAL 100 */}
      {totalTargetPercent !== 100 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Target allocation total is {totalTargetPercent}% (Must equal 100%). Adjust sliders below.</span>
        </div>
      )}

      {/* MAIN ASSET ALLOCATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT 7 COLS: ASSET SLIDERS & BREAKDOWN */}
        <div className="lg:col-span-7 bg-white border border-[#E2E5E1] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-[#E2E5E1]">
            <h3 className="text-base font-extrabold text-[#0E2A1E]">Current Assets &amp; Target Weights</h3>
            <span className="text-xs font-bold text-[#1F7A52]">Target Total: {totalTargetPercent}%</span>
          </div>

          <div className="space-y-4">
            {assets.map((a) => {
              const currentPct = (a.currentValue / totalPortfolioValue) * 100;
              const deviation = currentPct - a.targetPercent;

              return (
                <div key={a.id} className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E5E1] space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: a.color }}></span>
                      <h4 className="text-xs font-bold text-[#0E2A1E]">{a.name}</h4>
                    </div>
                    <span className="text-xs font-extrabold text-[#0E2A1E]">{inr(a.currentValue)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-[#5D6D66]">
                    <div>Current: <strong className="text-[#101A15]">{currentPct.toFixed(1)}%</strong></div>
                    <div>Target: <strong className="text-[#1F7A52]">{a.targetPercent}%</strong> (Dev: {deviation > 0 ? `+${deviation.toFixed(1)}%` : `${deviation.toFixed(1)}%`})</div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={a.targetPercent}
                    onChange={(e) => handleUpdateTarget(a.id, Number(e.target.value))}
                    className="w-full accent-[#1F7A52] cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 5 COLS: REBALANCE ORDERS & STRESS TESTER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* REBALANCE ORDERS CARD */}
          <div className="bg-white border border-[#E2E5E1] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E1]">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1F7A52]" />
                <h3 className="text-sm font-extrabold text-[#0E2A1E]">Generated Rebalance Orders</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Turnover: {inr(totalRebalanceTurnover)}</span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {orders.map((o) => (
                <div key={o.id} className="p-3 rounded-xl bg-[#F6F6F2] border border-[#E2E5E1] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#0E2A1E] block">{o.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Target: {o.targetPercent}%</span>
                  </div>

                  <div className="text-right">
                    {o.action === 'BUY' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] inline-block">
                        BUY +{inr(o.difference)}
                      </span>
                    )}
                    {o.action === 'SELL' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px] inline-block">
                        SELL -{inr(o.difference)}
                      </span>
                    )}
                    {o.action === 'HOLD' && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[11px] inline-block">
                        HOLD ON TARGET
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MARKET STRESS TESTER SIMULATOR CARD */}
          <div className="bg-[#0E2A1E] text-white rounded-3xl p-6 lg:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#34D399]" />
              <h3 className="text-base font-extrabold text-[#34D399]">Macroeconomic Stress Tester</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                  <span className="text-slate-300">Equity Market Shock (Nifty Index)</span>
                  <span className={niftyShockPercent >= 0 ? 'text-[#34D399]' : 'text-rose-400'}>{niftyShockPercent > 0 ? `+${niftyShockPercent}%` : `${niftyShockPercent}%`}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="5"
                  value={niftyShockPercent}
                  onChange={(e) => setNiftyShockPercent(Number(e.target.value))}
                  className="w-full accent-[#34D399] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                  <span className="text-slate-300">RBI Interest Rate Shift</span>
                  <span className="text-amber-400">{interestRateBps > 0 ? `+${interestRateBps} bps` : `${interestRateBps} bps`}</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="25"
                  value={interestRateBps}
                  onChange={(e) => setInterestRateBps(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1.5 text-xs">
              <span className="text-slate-300">Stressed Portfolio Net Worth:</span>
              <div className="text-2xl font-black text-white">{inr(stressedPortfolioValue)}</div>
              <div className={`text-xs font-bold ${stressedDelta >= 0 ? 'text-[#34D399]' : 'text-rose-400'}`}>
                {stressedDelta >= 0 ? `▲ +${inr(stressedDelta)} gain` : `▼ ${inr(stressedDelta)} impact`}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
