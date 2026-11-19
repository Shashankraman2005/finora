import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  Download, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import type { FinancialExplanation, CalculatedFinancialMetrics } from '../types/pipeline';

interface FinancialReportViewProps {
  explanation: FinancialExplanation;
  metrics: CalculatedFinancialMetrics;
  question: string;
}

export const FinancialReportView: React.FC<FinancialReportViewProps> = ({
  explanation,
  metrics,
  question,
}) => {
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
      case 'A-':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'B+':
      case 'B':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}k`;
    return `$${val}`;
  };

  const handleDownloadReport = () => {
    const reportText = `FINORA FINANCIAL AI ANALYSIS REPORT
==================================================
Date: ${new Date().toLocaleDateString()}
Query: "${question}"

HEADLINE SUMMARY:
${explanation.headlineSummary}
Financial Health Grade: ${explanation.healthGrade}

KEY METRICS:
- Net Worth: $${metrics.netWorth.toLocaleString()}
- Emergency Runway: ${metrics.burnRateMonths} Months
- Debt-to-Income (DTI): ${metrics.debtToIncomeRatio}%
- Portfolio Sharpe Ratio: ${metrics.portfolioSharpeRatio}
- FIRE Target: $${metrics.fireTargetAmount.toLocaleString()}

KEY TAKEAWAYS:
${explanation.keyTakeaways.map(t => `- ${t}`).join('\n')}

ACTIONABLE PLAN:
${explanation.actionablePlan.map(a => `Step ${a.step}: ${a.title} [${a.timeframe}]\nImpact: ${a.impact}\n${a.description}`).join('\n\n')}

RISK WARNINGS:
${explanation.riskWarnings.map(r => `! ${r}`).join('\n')}

DISCLAIMER:
${explanation.disclaimer}
`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Finora_Financial_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Executive Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 rounded-2xl border border-indigo-500/20 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getGradeBadge(explanation.healthGrade)} flex items-center gap-1.5`}>
                <Award className="w-4 h-4" />
                Financial Health Grade: {explanation.healthGrade}
              </span>
              <span className="text-xs font-medium text-slate-400">
                Calculated via Finora AI Engine
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 mt-2 leading-tight">
              {explanation.headlineSummary}
            </h2>
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Export Full Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {explanation.keyTakeaways.map((takeaway, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {takeaway}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {explanation.metricsBreakdown.map((mb, idx) => (
          <div key={idx} className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">{mb.name}</span>
              <span className={`w-2 h-2 rounded-full ${mb.status === 'good' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>

            <div className="mb-2">
              <div className="text-2xl font-black text-slate-100 tracking-tight">{mb.value}</div>
              <div className="text-[11px] font-medium text-slate-400">{mb.benchmark}</div>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2 border-t border-slate-800/80 pt-2 mt-1">
              {mb.insight}
            </p>
          </div>
        ))}
      </div>

      {/* Interactive Net Worth & FIRE Growth Projection Chart */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">20-Year Wealth & FIRE Trajectory Simulation</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated net worth progression assuming $3,500/mo contribution under 5.5% (Conservative), 8.5% (Expected), and 11.5% (Aggressive) compound growth rates.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Expected</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Aggressive</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Conservative</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAggressive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="age" stroke="#64748b" tickFormatter={(v) => `Age ${v}`} />
              <YAxis stroke="#64748b" tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }} 
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                labelFormatter={(label) => `Age ${label}`}
              />
              <Area type="monotone" dataKey="aggressiveValue" name="Aggressive (11.5%)" stroke="#10b981" fillOpacity={1} fill="url(#colorAggressive)" strokeWidth={2} />
              <Area type="monotone" dataKey="expectedValue" name="Expected (8.5%)" stroke="#6366f1" fillOpacity={1} fill="url(#colorExpected)" strokeWidth={3} />
              <Area type="monotone" dataKey="conservativeValue" name="Conservative (5.5%)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorConservative)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actionable Recommendations Plan */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">Step-by-Step Actionable Implementation Plan</h3>
        </div>

        <div className="space-y-4">
          {explanation.actionablePlan.map((action) => (
            <div key={action.step} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xs font-extrabold text-indigo-400 shrink-0">
                  {action.step}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-100">{action.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {action.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-400 shrink-0 self-start md:self-center">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{action.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stress Test & Risk Warning Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-200">Market Downturn Stress Test Simulation</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanation.scenarioAnalysis}
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-200">Risk Considerations & Disclaimers</h4>
          </div>
          <ul className="space-y-1.5">
            {explanation.riskWarnings.map((rw, idx) => (
              <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{rw}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
