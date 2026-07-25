import React from 'react';
import { GraduationCap, CheckCircle2, AlertTriangle } from 'lucide-react';

export function EducationComparison({ educationComparison = {} }) {
  const { degree_match = true, explanation = '' } = educationComparison;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Education Comparison
        </h4>
      </div>

      <div className="flex gap-4 items-start p-3.5 bg-slate-50/20 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
        <div className={`p-2.5 rounded-2xl shrink-0 ${
          degree_match 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
        }`}>
          {degree_match ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
        <div className="text-xs font-semibold leading-relaxed space-y-1">
          <p className="text-slate-800 dark:text-white font-extrabold">
            {degree_match ? 'Degree Requirements Satisfied' : 'Degree Requirements Discrepancy'}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EducationComparison;
