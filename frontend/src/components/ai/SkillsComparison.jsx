import React from 'react';

export function SkillsComparison({ skillsComparison = {} }) {
  const { matched = [], missing = [], additional = [] } = skillsComparison;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Skills Evaluation Comparison
        </h4>
        <p className="text-[10px] text-slate-550 font-semibold dark:text-slate-455 mt-0.5">
          Job required competencies mapped to your profiles registry.
        </p>
      </div>

      <div className="space-y-4">
        {matched.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Matched Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {matched.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-[10px] font-bold rounded-lg">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {missing.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-wide">
              Missing Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 text-[10px] font-bold rounded-lg">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {additional.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              Additional Candidate Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {additional.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 text-[10px] font-bold rounded-lg">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillsComparison;
