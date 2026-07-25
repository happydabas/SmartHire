import React from 'react';
import { ShieldCheck, CircleDot, AlertTriangle } from 'lucide-react';

export function ATSScoreCard({ score = 80, evaluation = {} }) {
  const getScoreColor = (val) => {
    if (val >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400';
    if (val >= 70) return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400';
    return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400';
  };

  const evalItems = [
    { label: 'Formatting & Layout', value: evaluation?.formatting || 'Complies with standard ATS grid template.' },
    { label: 'Readability Index', value: evaluation?.readability || 'Standard typography structure.' },
    { label: 'Keyword Density', value: evaluation?.keywords || 'Optimal key terms mapping.' }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5 flex flex-col justify-between animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
            ATS Compatibility
          </h4>
          <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-450 mt-0.5">
            Likelihood of passing standard scanner gateways.
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-2xl border font-black text-sm tracking-wide shrink-0 ${getScoreColor(score)}`}>
          {score}%
        </div>
      </div>

      <div className="space-y-4">
        {evalItems.map((item, index) => (
          <div key={index} className="flex gap-3 items-start">
            <div className="p-1 bg-blue-50 text-blue-600 rounded-lg shrink-0 dark:bg-blue-950/20">
              <CircleDot className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-700 dark:text-slate-350">
                {item.label}
              </p>
              <p className="text-[11px] text-slate-500 font-bold dark:text-slate-450 mt-0.5 leading-normal">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ATSScoreCard;
