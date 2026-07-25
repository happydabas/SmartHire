import React from 'react';

export function SkillCoverageCard({ coverage = 75 }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (coverage / 100) * circumference;

  const getCoverageColor = (val) => {
    if (val >= 90) return 'text-emerald-500 stroke-emerald-500';
    if (val >= 75) return 'text-blue-500 stroke-blue-500';
    if (val >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const colorClass = getCoverageColor(coverage);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Overall Skill Coverage
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Percent match of profile credentials against job skill targets.
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${colorClass.split(' ')[0]}`}>
            {coverage}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default SkillCoverageCard;
