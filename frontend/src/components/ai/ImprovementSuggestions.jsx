import React from 'react';

export function ImprovementSuggestions({ suggestions = [] }) {
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400';
    }
  };

  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const map = { high: 3, medium: 2, low: 1 };
    const aVal = map[a.priority?.toLowerCase()] || 0;
    const bVal = map[b.priority?.toLowerCase()] || 0;
    return bVal - aVal;
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Personalized Recommendations
        </h4>
        <p className="text-[10px] text-slate-500 font-semibold dark:text-slate-455 mt-0.5">
          Actionable steps to improve alignment with job requirements.
        </p>
      </div>

      {sortedSuggestions.length === 0 ? (
        <p className="text-xs text-slate-550 font-semibold dark:text-slate-450">
          Candidate meets all parameters. No improvement suggestions required.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedSuggestions.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start p-3 bg-slate-50/50 border border-slate-100 rounded-2xl dark:bg-slate-950/10 dark:border-slate-800">
              <div className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${getPriorityBadge(item.priority)}`}>
                {item.priority}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-350 font-semibold leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImprovementSuggestions;
