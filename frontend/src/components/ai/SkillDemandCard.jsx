import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export function SkillDemandCard({ skillsDemand = [], missingSkills = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-white">
          In-Demand Stacks & Missing Skills
        </h3>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Fast-growing market trends compared to candidate pools deficiencies.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Frequently Omitted Required Skills
        </h4>
        {missingSkills.length === 0 ? (
          <p className="text-xs text-slate-500 font-bold">Candidate pool matches posting skill targets.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((s, i) => (
              <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 text-[10px] font-black uppercase rounded-lg">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3.5 pt-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider dark:text-slate-500 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>In-Demand Stacks Growth Trends</span>
        </h4>

        {skillsDemand.length === 0 ? (
          <p className="text-xs text-slate-500 font-bold">No trending skills lists resolved.</p>
        ) : (
          <div className="space-y-3">
            {skillsDemand.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  {item.skill_name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 text-xs font-extrabold text-emerald-600">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>+{item.demand_growth_percent}%</span>
                  <span className="text-[9px] font-black uppercase tracking-wide text-slate-400 bg-slate-105 dark:bg-slate-800 dark:text-slate-500 px-1.5 py-0.5 rounded">
                    {item.trending_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillDemandCard;
