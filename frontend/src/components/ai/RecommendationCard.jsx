import React from 'react';
import { Award, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecommendationCard({ job = {} }) {
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20';
    if (score >= 75) return 'text-blue-500 bg-blue-50 border-blue-100 dark:bg-blue-950/20';
    if (score >= 60) return 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-950/20';
    return 'text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-950/20';
  };

  const scoreBadge = getMatchScoreColor(job.match_score);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 hover:border-blue-200 transition-all hover:shadow-md animate-fadeIn flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {job.title}
            </h4>
            <span className="text-xs text-slate-550 font-bold dark:text-slate-400 block mt-0.5">
              {job.company_name}
            </span>
          </div>
          <div className={`px-2.5 py-1 border rounded-full text-xs font-black shrink-0 ${scoreBadge}`}>
            {job.match_score}% Match
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-450 dark:text-slate-500 font-bold">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {job.location}
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-2xl dark:bg-slate-950/10">
          <strong>AI Fit:</strong> {job.reason}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-3">
        <span className="text-[11px] font-black text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
          {job.salary || "Competitive Salary"}
        </span>
        <Link
          to={`/jobs/${job.job_id}`}
          className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>View Opportunity</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default RecommendationCard;
