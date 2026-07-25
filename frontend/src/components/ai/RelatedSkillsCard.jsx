import React from 'react';
import { ArrowRight } from 'lucide-react';

export function RelatedSkillsCard({ relatedSkills = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Related Technologies Detected
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Semantic equivalents matched with confidence levels.
        </p>
      </div>

      {relatedSkills.length === 0 ? (
        <p className="text-xs text-slate-500 font-bold">No closely related skill pairs resolved.</p>
      ) : (
        <div className="space-y-2.5">
          {relatedSkills.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 line-through">{item.required}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-slate-800 dark:text-white">{item.candidate}</span>
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md dark:bg-blue-950/20 dark:text-blue-400">
                {Math.round(item.confidence * 100)}% Match
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RelatedSkillsCard;
