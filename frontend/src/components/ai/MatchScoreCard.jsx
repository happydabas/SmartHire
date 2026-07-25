import React from 'react';

export function MatchScoreCard({ score = 75 }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getMatchLevel = (val) => {
    if (val >= 90) return { label: 'Excellent Match', color: 'text-emerald-500 stroke-emerald-500', bg: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20' };
    if (val >= 75) return { label: 'Good Match', color: 'text-blue-500 stroke-blue-500', bg: 'bg-blue-50 border-blue-100 dark:bg-blue-950/20' };
    if (val >= 60) return { label: 'Average Match', color: 'text-amber-500 stroke-amber-500', bg: 'bg-amber-50 border-amber-100 dark:bg-amber-950/20' };
    return { label: 'Low Match', color: 'text-rose-500 stroke-rose-500', bg: 'bg-rose-50 border-rose-100 dark:bg-rose-950/20' };
  };

  const level = getMatchLevel(score);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          AI Fit Score
        </h4>
        <p className="text-[10px] text-slate-550 font-semibold dark:text-slate-450 mt-0.5">
          General matching rating compared to required job metrics.
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
            className={`transition-all duration-1000 ease-out ${level.color}`}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${level.color.split(' ')[0]}`}>
            {score}%
          </span>
        </div>
      </div>

      <div className={`w-full border rounded-2xl p-3 ${level.bg}`}>
        <span className={`text-xs font-extrabold ${level.color.split(' ')[0]}`}>
          {level.label}
        </span>
      </div>
    </div>
  );
}

export default MatchScoreCard;
