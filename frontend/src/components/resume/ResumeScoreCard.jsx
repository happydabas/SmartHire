import React from 'react';

export function ResumeScoreCard({ score = 75 }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val) => {
    if (val >= 85) return 'text-emerald-500 stroke-emerald-500';
    if (val >= 70) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Overall Resume Score
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-450 mt-0.5">
          General quality rating determined by parsing parameters.
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
            className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${getScoreColor(score).split(' ')[0]}`}>
            {score}
          </span>
          <span className="text-[10px] font-bold text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 dark:bg-slate-950/20 dark:border-slate-800">
        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350">
          {score >= 85 ? 'Excellent Quality' : score >= 70 ? 'Good Quality' : 'Needs Optimization'}
        </span>
      </div>
    </div>
  );
}

export default ResumeScoreCard;
