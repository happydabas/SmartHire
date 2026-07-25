import React from 'react';
import { Sparkles } from 'lucide-react';

export function RecommendationSummary({ summary = '' }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 animate-fadeIn">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <Sparkles className="w-4 h-4 shrink-0" />
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          AI Recommendation Review
        </h4>
      </div>
      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
        {summary || "AI matching analysis complete."}
      </p>
    </div>
  );
}

export default RecommendationSummary;
