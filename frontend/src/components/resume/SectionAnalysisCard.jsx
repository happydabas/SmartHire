import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export function SectionAnalysisCard({ analysis = {} }) {
  const sections = Object.entries(analysis);

  const getScoreColor = (val) => {
    if (val >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (val >= 70) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Section Analysis
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-450 mt-0.5">
          Detailed check of individual resume structures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(([name, data]) => (
          <div key={name} className="p-4 border border-slate-50 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 dark:border-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                {name}
              </span>
              <span className={`text-xs font-black ${getScoreColor(data.score)}`}>
                {data.score}/100
              </span>
            </div>

            <div className="space-y-2 text-[11px] leading-relaxed">
              {data.strengths && data.strengths.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Strengths
                  </span>
                  <ul className="space-y-1">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="flex gap-1.5 items-start text-slate-650 dark:text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.weaknesses && data.weaknesses.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-100/50 dark:border-slate-800/50">
                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-wide">
                    Improvements Needed
                  </span>
                  <ul className="space-y-1">
                    {data.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-1.5 items-start text-slate-650 dark:text-slate-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SectionAnalysisCard;
