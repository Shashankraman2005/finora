import React from 'react';
import { 
  FileText, 
  Workflow, 
  Calculator, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

export const ArchitectureDocView: React.FC = () => {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl backdrop-blur-sm space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-black text-slate-100">System Architecture & Execution Pipeline Specification</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Detailed technical reference for the 8-stage Financial AI pipeline design.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-indigo-400" />
          Target Pipeline Flowchart Graph
        </h3>

        <div className="flex flex-col items-center gap-3 py-4 max-w-xl mx-auto font-mono text-xs">
          {[
            { name: 'User Question', desc: 'Natural language financial inquiry capture', color: 'border-indigo-500 text-indigo-300 bg-indigo-500/10' },
            { name: 'Intent Detection', desc: 'NLP intent code & financial entity extraction', color: 'border-violet-500 text-violet-300 bg-violet-500/10' },
            { name: 'Identify required data', desc: 'Schema table mapping & dataset scoping', color: 'border-cyan-500 text-cyan-300 bg-cyan-500/10' },
            { name: 'Query database', desc: 'SQL execution against financial data store', color: 'border-blue-500 text-blue-300 bg-blue-500/10' },
            { name: 'Calculate required metrics', desc: 'Deterministic math (Sharpe, DTI, Runway, CAGR)', color: 'border-emerald-500 text-emerald-300 bg-emerald-500/10' },
            { name: 'Create structured context', desc: 'JSON/Markdown system prompt synthesis', color: 'border-amber-500 text-amber-300 bg-amber-500/10' },
            { name: 'LLM', desc: 'Generative reasoning engine (Gemini 3.6 Flash)', color: 'border-pink-500 text-pink-300 bg-pink-500/10' },
            { name: 'Financial explanation', desc: 'Structured actionable dashboard & advisory plan', color: 'border-emerald-400 text-emerald-300 bg-emerald-500/20 font-bold' }
          ].map((item, idx) => (
            <React.Fragment key={idx}>
              <div className={`w-full p-3.5 rounded-xl border text-center transition-all shadow-md ${item.color}`}>
                <div className="font-bold text-sm">{item.name}</div>
                <div className="text-[11px] opacity-80 mt-0.5">{item.desc}</div>
              </div>
              {idx < 7 && <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 my-0.5" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Calculator className="w-4 h-4" />
            <span>Why Separating Math from LLMs Matters</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Pure Large Language Models struggle with precise multi-variable financial math (hallucinating compound interest, Sharpe ratios, or tax brackets). Finora resolves this by computing metrics deterministically in <strong>Step 5</strong> using verified algorithms before passing clean, pre-calculated figures into the LLM context.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Structured Context & Risk Scoping</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            By synthesizing raw SQL data, user constraint profiles, and pre-computed risk metrics into a structured schema (Step 6), the LLM generates fiduciary-level guidance with zero ambiguity, enforced risk disclaimers, and actionable timelines.
          </p>
        </div>
      </div>
    </div>
  );
};
