import React from 'react';
import { Lightbulb, Info } from 'lucide-react';

export function HiringRecommendationCard({ recommendations = [] }) {
  const getImpactBadge = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <Lightbulb className="w-5 h-5 shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-white">
            AI Hiring Recommendations & Tuning
          </h3>
          <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
            Tuning suggestions to improve candidate pipeline volume.
          </p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-xs text-slate-500 font-bold">No recommendations resolved.</p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  {item.suggestion}
                </span>
                <div className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${getImpactBadge(item.impact)}`}>
                  {item.impact} Impact
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-405 leading-relaxed font-semibold">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HiringRecommendationCard;
