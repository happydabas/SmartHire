import React from 'react';
import { Check } from 'lucide-react';

export function MatchedSkillsCard({ matchedSkills = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Matched Skills
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Target technologies present directly in candidate lists.
        </p>
      </div>

      {matchedSkills.length === 0 ? (
        <p className="text-xs text-slate-500 font-bold">No exact skill matches registered.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {matchedSkills.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 dark:bg-emerald-950/20 dark:text-emerald-400">
                <Check className="w-3 h-3" />
              </div>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchedSkillsCard;
