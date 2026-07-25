import React from 'react';
import { ShieldCheck, Award, ListTodo } from 'lucide-react';

export function ResumeHealthCard({ health = {} }) {
  const getBadgeColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-955/20 dark:text-rose-400';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-955/20 dark:text-blue-400';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-white">
          Resume & Profile Credentials Health
        </h3>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          AI scoring against market standards and resume strength.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1 dark:bg-slate-800/30 border border-slate-50 dark:border-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Strength
          </span>
          <span className="text-2xl font-black text-emerald-600 block">
            {health.resume_strength || 0}%
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1 dark:bg-slate-800/30 border border-slate-50 dark:border-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            ATS Score
          </span>
          <span className="text-2xl font-black text-blue-600 block">
            {health.ats_readiness || 0}%
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1 dark:bg-slate-800/30 border border-slate-50 dark:border-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Completeness
          </span>
          <span className="text-2xl font-black text-indigo-600 block">
            {health.profile_completeness || 0}%
          </span>
        </div>
      </div>

      {/* Improvement tips */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 dark:text-slate-500">
          <ListTodo className="w-4 h-4 text-slate-400" />
          <span>Priority Improvement Roadmap</span>
        </h4>

        {(!health.improvement_tips || health.improvement_tips.length === 0) ? (
          <p className="text-xs text-slate-500 font-bold">Excellent! Zero improvement tips resolved.</p>
        ) : (
          <div className="space-y-2.5">
            {health.improvement_tips.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.tip}
                </span>
                <div className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${getBadgeColor(item.priority)}`}>
                  {item.priority}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeHealthCard;
