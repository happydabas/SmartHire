import React from 'react';
import { BookOpen } from 'lucide-react';

export function LearningRecommendationCard({ roadmap = [] }) {
  const getImpactBadge = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const sortedRoadmap = [...roadmap].sort((a, b) => {
    const map = { high: 3, medium: 2, low: 1 };
    const aVal = map[a.impact_level?.toLowerCase()] || 0;
    const bVal = map[b.impact_level?.toLowerCase()] || 0;
    return bVal - aVal;
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-white">
          AI Learning Roadmap recommendations
        </h3>
        <p className="text-[10px] text-slate-550 font-semibold dark:text-slate-455 mt-0.5">
          Priority-ranked technologies to study to enhance your career fit.
        </p>
      </div>

      {sortedRoadmap.length === 0 ? (
        <p className="text-xs text-slate-500 font-bold">No roadmap items generated.</p>
      ) : (
        <div className="space-y-3">
          {sortedRoadmap.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 dark:bg-slate-800 text-slate-500">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-white block">
                    {item.skill}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${getImpactBadge(item.impact_level)}`}>
                {item.impact_level} Impact
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LearningRecommendationCard;
