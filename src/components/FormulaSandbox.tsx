import React, { useState } from 'react';
import { Calculator, Flame, Scale, TrendingUp } from 'lucide-react';

export const FormulaSandbox: React.FC = () => {
  const [returnPct, setReturnPct] = useState<number>(10.5);
  const [riskFreePct, setRiskFreePct] = useState<number>(4.2);
  const [volatilityPct, setVolatilityPct] = useState<number>(14.8);

  const [monthlyDebt, setMonthlyDebt] = useState<number>(2990);
  const [grossIncome, setGrossIncome] = useState<number>(14500);

  const [liquidCash, setLiquidCash] = useState<number>(57500);
  const [monthlyBurn, setMonthlyBurn] = useState<number>(6800);

  const computedSharpe = volatilityPct > 0 ? ((returnPct - riskFreePct) / volatilityPct).toFixed(2) : '0.00';
  const computedDTI = grossIncome > 0 ? ((monthlyDebt / grossIncome) * 100).toFixed(1) : '0.0';
  const computedRunway = monthlyBurn > 0 ? (liquidCash / monthlyBurn).toFixed(1) : '0.0';

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-100">Financial Math Engine & Formula Sandbox</h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Step 5 of the Finora pipeline executes deterministic math formulas to feed exact metrics into the LLM context. Test the equations interactively below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Sharpe Ratio Formula</h3>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 text-center mb-4">
              Sharpe = (R_p - R_f) / σ_p
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 flex justify-between">
                  <span>Portfolio Return (R_p):</span>
                  <span className="font-mono text-slate-200">{returnPct}%</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="0.5"
                  value={returnPct}
                  onChange={(e) => setReturnPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 flex justify-between">
                  <span>Risk-Free Rate (R_f):</span>
                  <span className="font-mono text-slate-200">{riskFreePct}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={riskFreePct}
                  onChange={(e) => setRiskFreePct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 flex justify-between">
                  <span>Volatility StdDev (σ_p):</span>
                  <span className="font-mono text-slate-200">{volatilityPct}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="0.5"
                  value={volatilityPct}
                  onChange={(e) => setVolatilityPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Calculated Sharpe Ratio:</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{computedSharpe}</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Debt-to-Income (DTI)</h3>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 text-center mb-4">
              DTI = (Monthly Debt / Gross Income) × 100
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 flex justify-between">
                  <span>Monthly Debt Obligations:</span>
                  <span className="font-mono text-slate-200">${monthlyDebt.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={monthlyDebt}
                  onChange={(e) => setMonthlyDebt(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 flex justify-between">
                  <span>Gross Monthly Income:</span>
                  <span className="font-mono text-slate-200">${grossIncome.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="3000"
                  max="35000"
                  step="500"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Calculated DTI Ratio:</span>
            <span className={`text-lg font-black font-mono ${Number(computedDTI) < 36 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {computedDTI}%
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Emergency Fund Runway</h3>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400 text-center mb-4">
              Runway = Liquid Savings / Monthly Expenses
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 flex justify-between">
                  <span>Liquid Cash Reserves:</span>
                  <span className="font-mono text-slate-200">${liquidCash.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="2500"
                  value={liquidCash}
                  onChange={(e) => setLiquidCash(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 flex justify-between">
                  <span>Monthly Expenses:</span>
                  <span className="font-mono text-slate-200">${monthlyBurn.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="200"
                  value={monthlyBurn}
                  onChange={(e) => setMonthlyBurn(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Runway Duration:</span>
            <span className={`text-lg font-black font-mono ${Number(computedRunway) >= 6 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {computedRunway} Months
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
