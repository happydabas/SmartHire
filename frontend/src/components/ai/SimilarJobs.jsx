import React, { useState, useEffect } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { MapPin, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export function SimilarJobs({ jobId }) {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true);
        const data = await recommendationService.getSimilarJobs(jobId);
        setJobs(data || []);
      } catch (err) {
        console.error("Failed to load similar jobs list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilar();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-2">
        <Spinner size="sm" />
        <p className="text-xs text-slate-400 font-bold animate-pulse">Finding similar openings...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-4 animate-fadeIn">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-white">
          Similar Jobs You May Like
        </h3>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Based on related titles, required skills, and technologies.
        </p>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {jobs.map((j) => (
          <div key={j.id} className="py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link
                to={`/jobs/${j.id}`}
                className="text-xs font-extrabold text-slate-800 hover:text-blue-600 transition-colors block truncate dark:text-slate-200"
              >
                {j.title}
              </Link>
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 block">
                {j.company_name}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {j.location}</span>
                <span>•</span>
                <span>{j.job_type}</span>
              </div>
            </div>
            <Link
              to={`/jobs/${j.id}`}
              className="p-1 border border-slate-200 text-slate-400 hover:text-blue-650 hover:bg-slate-50 rounded-lg transition-all"
              aria-label="View job"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default SimilarJobs;
