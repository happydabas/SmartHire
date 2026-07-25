import React from 'react';
import { Loader2, Check } from 'lucide-react';

export function AIInsightLoader({ step }) {
  const steps = [
    { id: 1, label: 'Analyzing Profile...' },
    { id: 2, label: 'Generating Insights...' },
    { id: 3, label: 'Preparing Recommendations...' }
  ];

  const currentStepIndex = steps.findIndex(s => s.label === step);
  const percent = currentStepIndex === -1 ? 0 : Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6 max-w-md mx-auto animate-fadeIn" role="status" aria-live="polite">
      <div className="space-y-1.5 text-center">
        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
          Generating AI Insights
        </h4>
        <p className="text-xs text-slate-455 font-bold dark:text-slate-500">
          Aggregating user metrics and scanning profiles.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden dark:bg-slate-800">
          <div
            style={{ width: `${percent}%` }}
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3 pt-2">
        {steps.map((s, idx) => {
          const isDone = currentStepIndex > idx;
          const isActive = currentStepIndex === idx;
          
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                isDone 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50' 
                  : isActive 
                    ? 'border-indigo-500 text-indigo-600 animate-pulse' 
                    : 'border-slate-200 text-slate-300 dark:border-slate-800'
              }`}>
                {isDone ? (
                  <Check className="w-3 h-3" />
                ) : isActive ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span className="text-[9px] font-black">{s.id}</span>
                )}
              </div>
              <span className={`text-xs font-bold ${
                isDone 
                  ? 'text-slate-450 dark:text-slate-500 line-through' 
                  : isActive 
                    ? 'text-slate-800 dark:text-white font-extrabold' 
                    : 'text-slate-350 dark:text-slate-600'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIInsightLoader;
