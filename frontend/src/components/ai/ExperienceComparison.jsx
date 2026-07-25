import React from 'react';
import { Calendar, Award, CheckCircle } from 'lucide-react';

export function ExperienceComparison({ experienceComparison = {} }) {
  const { 
    required_years = 0.0, 
    candidate_years = 0.0, 
    relevant_roles_match = true, 
    explanation = '' 
  } = experienceComparison;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Experience Comparison
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Required Years
          </span>
          <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
            {required_years} Yrs
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Candidate Years
          </span>
          <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
            {candidate_years} Yrs
          </span>
        </div>
      </div>

      <div className="p-3.5 bg-blue-50/20 border border-blue-50/50 rounded-2xl dark:bg-blue-950/5 dark:border-blue-950/20 text-xs font-semibold leading-relaxed space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle className={`w-4 h-4 shrink-0 ${relevant_roles_match ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className="text-slate-700 dark:text-slate-300">
            {relevant_roles_match ? 'Relevant Roles Match Detected' : 'Some Role Discrepancies Detected'}
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 leading-normal">
          {explanation}
        </p>
      </div>
    </div>
  );
}

export default ExperienceComparison;
