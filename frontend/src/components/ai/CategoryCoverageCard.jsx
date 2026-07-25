import React from 'react';

export function CategoryCoverageCard({ categories = {} }) {
  const items = Object.entries(categories);

  const getBarColor = (val) => {
    if (val >= 90) return 'bg-emerald-500';
    if (val >= 75) return 'bg-blue-500';
    if (val >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getTextColor = (val) => {
    if (val >= 90) return 'text-emerald-550';
    if (val >= 75) return 'text-blue-550';
    if (val >= 60) return 'text-amber-550';
    return 'text-rose-550';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Category-wise Coverage
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Progress breakdowns mapped by stack segments.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-500 font-bold">No categories resolved.</p>
      ) : (
        <div className="space-y-4">
          {items.map(([name, val]) => (
            <div key={name} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">{name}</span>
                <span className={`font-black ${getTextColor(val)}`}>{val}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden dark:bg-slate-800">
                <div
                  style={{ width: `${val}%` }}
                  className={`h-full transition-all duration-700 ease-out ${getBarColor(val)}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryCoverageCard;
