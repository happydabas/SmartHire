import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export function MissingSectionsCard({ missingSections = [] }) {
  if (missingSections.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 flex items-center gap-4 animate-fadeIn">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl dark:bg-emerald-950/20 shrink-0">
          <AlertCircle className="w-6 h-6 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
            All Core Sections Detected
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold dark:text-slate-450 mt-0.5">
            Your resume is complete and contains all primary segments!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Missing Sections Detected
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Primary modules omitted from your resume or profile catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {missingSections.map((sec, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-2xl dark:bg-rose-955/10 dark:border-rose-950/20 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="text-xs font-bold truncate">
              {sec}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MissingSectionsCard;
