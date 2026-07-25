import React from 'react';

export function AdditionalSkillsCard({ additionalSkills = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Additional Candidate Skills
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Valuable qualifications that positively influence evaluation.
        </p>
      </div>

      {additionalSkills.length === 0 ? (
        <p className="text-xs text-slate-500 font-bold">No additional skills registered.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {additionalSkills.map((s, i) => (
            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-705 text-xs font-bold rounded-xl">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdditionalSkillsCard;
