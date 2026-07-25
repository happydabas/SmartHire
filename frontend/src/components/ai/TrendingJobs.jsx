import React, { useState, useEffect } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { Sparkles, MapPin, ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export function TrendingJobs() {
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await recommendationService.getTrendingJobs();
        setTrending(data || []);
      } catch (err) {
        console.error("Failed to load trending jobs list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-2">
        <Spinner size="sm" />
        <p className="text-xs text-slate-400 font-bold animate-pulse">Finding popular jobs...</p>
      </div>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 animate-bounce" />
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-white">
            Trending Openings
          </h3>
          <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
            Most applied and popular listings based on application statistics.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {trending.map((j) => (
          <div key={j.id} className="py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link
                to={`/jobs/${j.id}`}
                className="text-xs font-extrabold text-slate-800 hover:text-indigo-600 transition-colors block truncate dark:text-slate-200"
              >
                {j.title}
              </Link>
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 block">
                {j.company_name}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {j.location}</span>
                <span>•</span>
                <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wide">
                  {j.application_count} Applications
                </span>
              </div>
            </div>
            <Link
              to={`/jobs/${j.id}`}
              className="p-1 border border-slate-200 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-lg transition-all"
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

export default TrendingJobs;
