import React, { useState, useEffect } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { jobService } from '@/services/jobs/jobService';
import { MapPin, Sparkles, ArrowRight, Bookmark, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { formatJobType } from '@/utils/enumFormatters';

export function SimilarJobs({ jobId }) {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true);
        const [data, savedJobsData] = await Promise.all([
          recommendationService.getSimilarJobs(jobId).catch(() => []),
          jobService.getSavedJobs().catch(() => [])
        ]);
        setJobs(data || []);
        if (savedJobsData) {
          setSavedJobIds(new Set(savedJobsData.map(j => j.id)));
        }
      } catch (err) {
        console.error("Failed to load similar jobs list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilar();
  }, [jobId]);

  const handleToggleSave = async (e, targetJobId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (savedJobIds.has(targetJobId)) {
        await jobService.unsaveJob(targetJobId);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(targetJobId);
          return next;
        });
      } else {
        await jobService.saveJob(targetJobId);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.add(targetJobId);
          return next;
        });
      }
    } catch (err) {
      console.error("Toggle bookmark error:", err);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm">
        <div className="flex flex-col items-center justify-center py-6 space-y-2">
          <Spinner size="sm" />
          <p className="text-xs text-slate-400 font-bold animate-pulse">Finding similar openings...</p>
        </div>
      </Card>
    );
  }

  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            Similar Jobs You May Like
          </h3>
        </div>
        <Link
          to="/jobs"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 shrink-0"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <p className="text-[11px] text-slate-400 font-medium -mt-2">
        Based on related titles, required skills, and technologies.
      </p>

      <div className="space-y-3">
        {jobs.slice(0, 4).map((j) => {
          const isSaved = savedJobIds.has(j.id);
          const initial = (j.company_name || 'C')[0].toUpperCase();

          return (
            <div
              key={j.id}
              className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Company Logo Avatar */}
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black flex items-center justify-center text-sm shrink-0 border border-slate-800 shadow-sm mt-0.5">
                  {initial}
                </div>

                <div className="min-w-0 space-y-1">
                  <Link
                    to={`/jobs/${j.id}`}
                    className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors block truncate"
                  >
                    {j.title}
                  </Link>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="truncate">{j.company_name}</span>
                    <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/15 shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    {j.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {j.location}
                      </span>
                    )}
                    {j.job_type && (
                      <>
                        <span>•</span>
                        <span>{formatJobType(j.job_type)}</span>
                      </>
                    )}
                  </div>

                  {j.salary_range && (
                    <div className="pt-1">
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                        {j.salary_range}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bookmark toggle button */}
              <button
                onClick={(e) => handleToggleSave(e, j.id)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
                title={isSaved ? "Saved" : "Save Job"}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default SimilarJobs;
