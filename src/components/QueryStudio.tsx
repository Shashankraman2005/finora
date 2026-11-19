import React from 'react';
import { 
  Play, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  Scale, 
  ShieldAlert, 
  Activity, 
  Clock,
  Layers
} from 'lucide-react';

interface ScenarioPreset {
  id: string;
  title: string;
  tag: string;
  icon: React.ReactNode;
  question: string;
}

const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 's1',
    title: 'Early FIRE & Retirement Runway',
    tag: 'Retirement',
    icon: <Flame className="w-4 h-4 text-amber-400" />,
    question: 'Am I on track to retire at 55 with my current portfolio net worth, liquid savings, and $3,500 monthly investment contribution?'
  },
  {
    id: 's2',
    title: 'Debt Avalanche vs Opportunity Cost',
    tag: 'Liabilities',
    icon: <Scale className="w-4 h-4 text-cyan-400" />,
    question: 'Calculate my Debt-to-Income (DTI) ratio and recommend whether to pay off my 5.90% Tesla auto loan early or invest in VTI index funds.'
  },
  {
    id: 's3',
    title: 'Sharpe Ratio & 20% Tech Stress Test',
    tag: 'Risk & Volatility',
    icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
    question: 'Analyze my portfolio Sharpe ratio and simulate financial impact under a severe 20% tech market downturn.'
  },
  {
    id: 's4',
    title: 'Emergency Reserve Burn Rate',
    tag: 'Liquidity',
    icon: <Activity className="w-4 h-4 text-purple-400" />,
    question: 'What is my current liquid emergency fund runway in months based on checking, savings, and total monthly expenses?'
  }
];

interface QueryStudioProps {
  question: string;
  setQuestion: (q: string) => void;
  onRunPipeline: () => void;
  isExecuting: boolean;
  activeStepName?: string;
  executionTimeTotal?: number;
}

export const QueryStudio: React.FC<QueryStudioProps> = ({
  question,
  setQuestion,
  onRunPipeline,
  isExecuting,
  activeStepName,
  executionTimeTotal,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl relative backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-100">Financial AI Query Studio</h2>
        </div>

        {executionTimeTotal !== undefined && !isExecuting && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Full Pipeline Completed in {executionTimeTotal}ms</span>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask any complex financial question (e.g. retirement goals, debt strategy, Sharpe ratio, or portfolio risk stress test)..."
          rows={3}
          disabled={isExecuting}
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-inner"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-3">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Runs through 8 automated pipeline stages with exact math computations.
          </p>

          <button
            onClick={onRunPipeline}
            disabled={isExecuting || !question.trim()}
            className={`flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
              isExecuting
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25 active:scale-95'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Running ({activeStepName || 'Processing'})...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute AI Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sample Financial Queries & Scenarios
          </span>
          <span className="text-[11px] text-slate-400">Click to load prompt</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_SCENARIOS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                setQuestion(preset.question);
              }}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-slate-800/50 transition-all cursor-pointer group flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {preset.icon}
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {preset.title}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                  {preset.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                "{preset.question}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
