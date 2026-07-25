import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export function CareerSuggestionCard({ suggestions = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-white">
          AI Career Guidance & Path suggestions
        </h3>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Job paths that align with your credentials.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-xs text-slate-500 font-bold">No suggestions generated yet.</p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl dark:bg-slate-955/10 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  {item.path}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-405 leading-relaxed font-semibold">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CareerSuggestionCard;
