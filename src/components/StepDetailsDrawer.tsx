import React from 'react';
import { 
  X, 
  Clock,
  FileJson
} from 'lucide-react';
import type { PipelineStepId, PipelineStepState, FullPipelineExecution } from '../types/pipeline';

interface StepDetailsDrawerProps {
  stepId: PipelineStepId | null;
  onClose: () => void;
  execution: FullPipelineExecution;
}

export const StepDetailsDrawer: React.FC<StepDetailsDrawerProps> = ({
  stepId,
  onClose,
  execution,
}) => {
  if (!stepId) return null;

  const step: PipelineStepState = execution.steps[stepId];

  const renderContent = () => {
    switch (stepId) {
      case 'user_question':
        return (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Input Question</span>
              <div className="mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 font-mono">
                "{execution.question}"
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Captured Timestamp</span>
                <p className="text-slate-200 font-mono mt-0.5">{execution.timestamp}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Execution Session ID</span>
                <p className="text-slate-200 font-mono mt-0.5">{execution.id}</p>
              </div>
            </div>
          </div>
        );

      case 'intent_detection':
        return (
          <div className="space-y-4">
            {execution.intent ? (
              <>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Classified Intent Code</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {execution.intent.intentCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Category:</span>
                    <p className="text-sm font-semibold text-slate-200">{execution.intent.category}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Confidence Rating:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" 
                          style={{ width: `${execution.intent.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-400">{(execution.intent.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extracted Entities & Parameters</span>
                  <pre className="mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono overflow-x-auto">
                    {JSON.stringify(execution.intent.extractedEntities, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">Step has not executed yet.</p>
            )}
          </div>
        );

      case 'identify_required_data':
      case 'query_database':
        return (
          <div className="space-y-4">
            {execution.dbResult ? (
              <>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated SQL Query</span>
                  <pre className="mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
                    {execution.dbResult.sqlQuery}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Target Tables Queried</span>
                    <p className="text-slate-200 font-mono mt-0.5">{execution.dbResult.tablesQueried.join(', ')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Rows Returned</span>
                    <p className="text-slate-200 font-mono mt-0.5">{execution.dbResult.rowCount} rows</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">Database query step waiting for execution.</p>
            )}
          </div>
        );

      case 'calculate_metrics':
        return (
          <div className="space-y-4">
            {execution.metrics ? (
              <>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Computed Financial Metrics</span>
                  <pre className="mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono overflow-x-auto">
                    {JSON.stringify({
                      netWorth: execution.metrics.netWorth,
                      liquidSavings: execution.metrics.liquidSavings,
                      burnRateMonths: execution.metrics.burnRateMonths,
                      debtToIncomeRatio: `${execution.metrics.debtToIncomeRatio}%`,
                      portfolioSharpeRatio: execution.metrics.portfolioSharpeRatio,
                      fireTargetAmount: execution.metrics.fireTargetAmount,
                      fireCurrentProgressPct: `${execution.metrics.fireCurrentProgressPct}%`,
                      projectedRetirementAge: execution.metrics.projectedRetirementAge,
                      maxDrawdownScenario: execution.metrics.maxDrawdownScenario
                    }, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">Metrics pending calculation.</p>
            )}
          </div>
        );

      case 'create_structured_context':
        return (
          <div className="space-y-4">
            {execution.structuredContext ? (
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formatted Context Payload for LLM</span>
                <pre className="mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto h-80">
                  {JSON.stringify(execution.structuredContext, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Context payload pending creation.</p>
            )}
          </div>
        );

      case 'llm_reasoning':
        return (
          <div className="space-y-4">
            {execution.llmResponse ? (
              <>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Model Used</span>
                    <p className="text-indigo-400 font-mono font-bold mt-0.5">{execution.llmResponse.modelUsed}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Prompt Tokens</span>
                    <p className="text-slate-200 font-mono mt-0.5">{execution.llmResponse.promptTokens}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Total Tokens</span>
                    <p className="text-slate-200 font-mono mt-0.5">{execution.llmResponse.totalTokens}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw LLM Output Stream</span>
                  <div className="mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed">
                    {execution.llmResponse.rawResponse}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">LLM step pending execution.</p>
            )}
          </div>
        );

      default:
        return (
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step Summary</span>
            <p className="text-sm text-slate-300 mt-2">{step.subtitle}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-all">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">{step.title}</h3>
                <p className="text-xs text-slate-400">{step.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {renderContent()}
        </div>

        <div className="pt-4 border-t border-slate-800 mt-8 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Execution time: {step.durationMs ?? 0}ms
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
