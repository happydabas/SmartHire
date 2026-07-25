import React, { useState, useEffect } from 'react';
import { recommendationService } from '@/services/recommendationService';
import RecommendationCard from '@/components/ai/RecommendationCard';
import TrendingJobs from '@/components/ai/TrendingJobs';
import RecommendationFilters from '@/components/ai/RecommendationFilters';
import RecommendationSummary from '@/components/ai/RecommendationSummary';
import RecommendationLoader from '@/components/ai/RecommendationLoader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { ShieldAlert, RefreshCw, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export function RecommendedJobs() {
  const [loading, setLoading] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    job_type: '',
    min_score: '',
    salary: ''
  });
  const [error, setError] = useState(null);

  const fetchRecommendations = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (refresh) {
        setParsingStep('Finding Jobs...');
        await new Promise(resolve => setTimeout(resolve, 600));

        setParsingStep('Analyzing Your Profile...');
        await new Promise(resolve => setTimeout(resolve, 600));

        setParsingStep('Calculating Match Scores...');
        await new Promise(resolve => setTimeout(resolve, 600));

        setParsingStep('Preparing Recommendations...');
        const data = await recommendationService.refreshRecommendations();
        setSummary(data.summary || '');
        setRecommendations(data.recommendations || []);
        toast.success("Job recommendations updated successfully!");
      } else {
        const data = await recommendationService.refreshRecommendations();
        setSummary(data.summary || '');
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      const errMsg = err?.response?.data?.detail || "AI recommendation analysis failed. Complete your profile or upload a resume first.";
      setError(errMsg);
    } finally {
      setLoading(false);
      setParsingStep('');
    }
  };

  useEffect(() => {
    fetchRecommendations(false);
  }, []);

  const handleRefresh = () => {
    fetchRecommendations(true);
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  const filteredJobs = recommendations.filter((job) => {
    if (filters.location.trim() && !job.location?.toLowerCase().includes(filters.location.toLowerCase().trim())) {
      return false;
    }
    if (filters.job_type && !job.salary?.toLowerCase().includes(filters.job_type.toLowerCase())) {
      return false;
    }
    if (filters.min_score && job.match_score < Number(filters.min_score)) {
      return false;
    }
    if (filters.salary.trim() && job.salary) {
      const nums = job.salary.match(/\d+,\d+|\d+/g);
      if (nums && nums.length > 0) {
        const val = Number(nums[nums.length - 1].replace(',', ''));
        if (val < Number(filters.salary.trim())) {
          return false;
        }
      }
    }
    return true;
  });

  if (loading && parsingStep) {
    return (
      <div className="py-20">
        <RecommendationLoader step={parsingStep} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white flex items-center gap-2.5">
            <BarChart2 className="w-8 h-8 text-indigo-600 animate-pulse" />
            <span>AI Job Recommendations</span>
          </h1>
          <p className="text-slate-550 text-sm mt-1 dark:text-slate-400">
            Ranked job recommendations mapped to your developer skills, experience target, and applied history.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-xl font-black text-xs px-5 py-3 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Recommendations</span>
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl dark:bg-rose-955/10 dark:border-rose-955/20 dark:text-rose-455">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {summary && <RecommendationSummary summary={summary} />}

      <RecommendationFilters filters={filters} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recommended For You ({filteredJobs.length})
            </h3>
          </div>

          {loading && !parsingStep ? (
            <div className="flex justify-center p-12">
              <Spinner size="md" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
              <p className="text-xs text-slate-550 font-bold">
                No matching recommendations found. Try adjusting filters or click refresh.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <RecommendationCard key={job.job_id} job={job} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <TrendingJobs />
        </div>
      </div>
    </div>
  );
}

export default RecommendedJobs;
