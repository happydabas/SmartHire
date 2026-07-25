import React from 'react';

export function MatchBreakdown({ breakdown = {} }) {
  const items = Object.entries(breakdown);

  const getScoreColor = (val) => {
    if (val >= 90) return 'text-emerald-500';
    if (val >= 75) return 'text-blue-500';
    if (val >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Match Breakdown
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Section-wise ratings against posting credentials.
        </p>
      </div>

      <div className="space-y-4">
        {items.map(([name, item]) => (
          <div key={name} className="space-y-1.5 p-3.5 bg-slate-50/20 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350">
                {name}
              </span>
              <span className={`text-xs font-black ${getScoreColor(item.score)}`}>
                {item.score}%
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden dark:bg-slate-800">
              <div
                style={{ width: `${item.score}%` }}
                className={`h-full transition-all duration-700 ease-out bg-current ${getScoreColor(item.score)}`}
              />
            </div>

            <p className="text-[11px] text-slate-500 font-bold dark:text-slate-450 leading-relaxed pt-1">
              {item.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchBreakdown;
