import React from 'react';
import { UserCheck, Star, Sparkles, Building, HelpCircle } from 'lucide-react';

export function HiringInsightCard({ insights = {} }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-white">
          Active Recruiting Statistics
        </h3>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          AI matching aggregates over postings and active pipeline submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-100/50 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800 space-y-2">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Most Applied Postings
          </span>
          {(!insights.most_applied_jobs || insights.most_applied_jobs.length === 0) ? (
            <span className="text-xs text-slate-500 font-bold block">No applications logged.</span>
          ) : (
            <div className="space-y-1">
              {insights.most_applied_jobs.map((item, idx) => (
                <span key={idx} className="block text-xs font-black text-slate-800 dark:text-white truncate">
                  ⚡ {item}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100/50 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800 space-y-2">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Postings Requiring Candidate Focus
          </span>
          {(!insights.few_applications_jobs || insights.few_applications_jobs.length === 0) ? (
            <span className="text-xs text-slate-500 font-bold block">All postings have active candidates.</span>
          ) : (
            <div className="space-y-1">
              {insights.few_applications_jobs.map((item, idx) => (
                <span key={idx} className="block text-xs font-black text-rose-600 dark:text-rose-455 truncate">
                  ⚠️ {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3.5 pt-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 dark:text-slate-500">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span>Top Matching Candidate Profiles</span>
        </h4>
        {(!insights.top_matching_candidates || insights.top_matching_candidates.length === 0) ? (
          <p className="text-xs text-slate-500 font-bold">No candidates analyzed in pool.</p>
        ) : (
          <div className="space-y-2.5">
            {insights.top_matching_candidates.map((cand, idx) => (
              <div key={idx} className="flex gap-4 items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-white block">
                    {cand.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {cand.email} • Stage: {cand.status}
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded-full border bg-emerald-50 border-emerald-100 text-emerald-700 text-[10px] font-black shrink-0 dark:bg-emerald-950/20 dark:text-emerald-450">
                  {cand.match_score}% Match
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HiringInsightCard;
