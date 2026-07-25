import React from 'react';
import { Target, User, Award, Briefcase } from 'lucide-react';

export function ConfidenceScoreCard({ scores }) {
  const items = [
    { label: 'Personal Info', value: scores?.personal_info ?? 90, icon: User, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Skills Extracted', value: scores?.skills ?? 90, icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Experience Parsed', value: scores?.experience ?? 90, icon: Briefcase, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
    { label: 'Overall Accuracy', value: scores?.overall_parsing ?? 90, icon: Target, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' }
  ];

  const getScoreColorClass = (val) => {
    if (val >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (val >= 70) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          AI Confidence Index
        </h4>
        <p className="text-[11px] text-slate-500 font-semibold dark:text-slate-450">
          Accuracy predictions estimated by neural extraction weights.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="p-4 border border-slate-50 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-base font-extrabold ${getScoreColorClass(item.value)}`}>
                  {item.value}%
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-550 dark:text-slate-450 leading-tight">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConfidenceScoreCard;
