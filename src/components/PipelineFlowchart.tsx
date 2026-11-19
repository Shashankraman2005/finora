import React from 'react';
import { 
  HelpCircle, 
  Target, 
  Filter, 
  Database, 
  Calculator, 
  Code2, 
  Cpu, 
  CheckCircle2, 
  ArrowDown, 
  Clock, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import type { PipelineStepId, PipelineStepState } from '../types/pipeline';

const STEP_ICONS: Record<PipelineStepId, React.ReactNode> = {
  user_question: <HelpCircle className="w-5 h-5 text-indigo-400" />,
  intent_detection: <Target className="w-5 h-5 text-violet-400" />,
  identify_required_data: <Filter className="w-5 h-5 text-cyan-400" />,
  query_database: <Database className="w-5 h-5 text-blue-400" />,
  calculate_metrics: <Calculator className="w-5 h-5 text-emerald-400" />,
  create_structured_context: <Code2 className="w-5 h-5 text-amber-400" />,
  llm_reasoning: <Cpu className="w-5 h-5 text-pink-400" />,
  financial_explanation: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
};

const STEP_ORDER: PipelineStepId[] = [
  'user_question',
  'intent_detection',
  'identify_required_data',
  'query_database',
  'calculate_metrics',
  'create_structured_context',
  'llm_reasoning',
  'financial_explanation',
];

interface PipelineFlowchartProps {
  steps: Record<PipelineStepId, PipelineStepState>;
  activeStepId: PipelineStepId | null;
  onSelectStep: (stepId: PipelineStepId) => void;
}

export const PipelineFlowchart: React.FC<PipelineFlowchartProps> = ({
  steps,
  activeStepId,
  onSelectStep,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">8-Stage AI Execution Pipeline</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Interactive Execution Graph
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any step to inspect raw payloads, SQL queries, metric equations, and model outputs.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 relative">
        {STEP_ORDER.map((stepId, index) => {
          const step = steps[stepId];
          const isCurrentActive = activeStepId === stepId;
          const isCompleted = step.status === 'completed';
          const isRunning = step.status === 'running';

          return (
            <React.Fragment key={stepId}>
              <div
                onClick={() => onSelectStep(stepId)}
                className={`w-full max-w-2xl flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group relative ${
                  isCurrentActive
                    ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                    : isRunning
                    ? 'bg-slate-800/70 border-amber-500/70 shadow-md shadow-amber-500/10'
                    : isCompleted
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-60 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${
                  isCompleted ? 'bg-emerald-500' : isRunning ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'
                }`} />

                <div className="flex items-center gap-4 pl-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isRunning 
                      ? 'bg-amber-500/20 text-amber-400 animate-spin'
                      : isCompleted
                      ? 'bg-slate-800 border border-slate-700'
                      : 'bg-slate-900 border border-slate-800'
                  }`}>
                    {isRunning ? <Loader2 className="w-5 h-5 text-amber-400" /> : STEP_ICONS[stepId]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Step 0{index + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {step.title.replace(/^\d+\.\s*/, '')}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {step.durationMs !== undefined && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 text-slate-400 border border-slate-800 text-xs">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{step.durationMs}ms</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {index < STEP_ORDER.length - 1 && (
                <div className="flex flex-col items-center my-0.5">
                  <div className={`w-0.5 h-3 ${
                    steps[STEP_ORDER[index + 1]].status === 'completed' || isCompleted
                      ? 'bg-indigo-500/60'
                      : isRunning
                      ? 'bg-amber-500/60 animate-pulse'
                      : 'bg-slate-800'
                  }`} />
                  <ArrowDown className={`w-3.5 h-3.5 ${
                    isCompleted ? 'text-indigo-400' : 'text-slate-600'
                  }`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
