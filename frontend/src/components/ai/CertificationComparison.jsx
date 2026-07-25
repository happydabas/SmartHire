import React from 'react';
import { Award, Check, AlertCircle } from 'lucide-react';

export function CertificationComparison({ certificationComparison = {} }) {
  const { matched = [], missing = [], optional = [] } = certificationComparison;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Certifications Comparison
        </h4>
      </div>

      <div className="space-y-3">
        {matched.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Matched Certifications
            </span>
            <ul className="space-y-1">
              {matched.map((c, i) => (
                <li key={i} className="flex gap-2 items-start text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {missing.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-wide">
              Missing Required Certifications
            </span>
            <ul className="space-y-1">
              {missing.map((c, i) => (
                <li key={i} className="flex gap-2 items-start text-xs font-semibold text-slate-650 dark:text-slate-400">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {optional.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              Optional Certifications Detected
            </span>
            <ul className="space-y-1">
              {optional.map((c, i) => (
                <li key={i} className="flex gap-2 items-start text-xs font-semibold text-slate-650 dark:text-slate-400">
                  <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CertificationComparison;
