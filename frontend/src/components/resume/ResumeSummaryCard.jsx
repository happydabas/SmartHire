import React from 'react';
import { Sparkles, Key, Tag } from 'lucide-react';

export function ResumeSummaryCard({ summary = '', keywords = {} }) {
  const { 
    important_keywords = [], 
    missing_keywords = [], 
    density = 0.0, 
    recommendations = [] 
  } = keywords;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6 animate-fadeIn">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Sparkles className="w-4 h-4 shrink-0" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            AI Narrative Review
          </h4>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-350 font-semibold leading-relaxed">
          {summary || "Review details successfully parsed."}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Keywords Optimization
          </span>
          <span className="text-[10px] font-black text-slate-500 bg-slate-50 dark:bg-slate-805 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
            Density: {density}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          {important_keywords.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide dark:text-slate-500">
                Key Terms Detected
              </span>
              <div className="flex flex-wrap gap-1">
                {important_keywords.map((k, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 text-[10px] font-bold rounded">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing_keywords.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-wide">
                Missing Keywords
              </span>
              <div className="flex flex-wrap gap-1">
                {missing_keywords.map((k, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-50/50 text-rose-700 border border-rose-100 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/50 text-[10px] font-bold rounded">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {recommendations.length > 0 && (
          <div className="p-3 bg-blue-50/20 border border-blue-50/50 rounded-2xl dark:bg-blue-950/5 dark:border-blue-950/20">
            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              AI Recommendations
            </span>
            <ul className="list-disc list-inside text-[11px] text-slate-550 dark:text-slate-400 mt-1 space-y-1">
              {recommendations.map((r, i) => (
                <li key={i} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeSummaryCard;
