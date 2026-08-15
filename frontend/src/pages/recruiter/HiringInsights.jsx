import React, { useState, useEffect } from 'react';
import { insightsService } from '@/services/insightsService';
import HiringInsightCard from '@/components/ai/HiringInsightCard';
import SkillDemandCard from '@/components/ai/SkillDemandCard';
import HiringRecommendationCard from '@/components/ai/HiringRecommendationCard';
import InsightHistoryTable from '@/components/ai/InsightHistoryTable';
import AIInsightLoader from '@/components/ai/AIInsightLoader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { ShieldAlert, RefreshCw, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

export function HiringInsights() {
  const [loading, setLoading] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [insightData, setInsightData] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await insightsService.getInsightsHistory();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load insights history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchInsights = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (refresh) {
        setParsingStep('Analyzing Profile...');
        await new Promise(resolve => setTimeout(resolve, 600));

        setParsingStep('Generating Insights...');
        await new Promise(resolve => setTimeout(resolve, 600));

        setParsingStep('Preparing Recommendations...');
        const response = await insightsService.refreshInsights();
        setInsightData(response.insight_data || response);
        toast.success("Hiring insights refreshed successfully!");
        fetchHistory();
      } else {
        const response = await insightsService.refreshInsights();
        setInsightData(response.insight_data || response);
      }
    } catch (err) {
      console.error("Recruiter insights calculation failed:", err);
      const errMsg = err?.response?.data?.detail || "Failed to calculate recruiter insights. Verify company jobs are listed.";
      setError(errMsg);
    } finally {
      setLoading(false);
      setParsingStep('');
    }
  };

  useEffect(() => {
    fetchInsights(false);
    fetchHistory();
  }, []);

  const handleRefresh = () => {
    fetchInsights(true);
  };

  const handleDeleteHistoryItem = async (id) => {
    try {
      await insightsService.deleteInsightItem(id);
      toast.success("Insight record deleted.");
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      toast.error("Failed to delete record.");
    }
  };

  if (loading && parsingStep) {
    return (
      <div className="py-20">
        <AIInsightLoader step={parsingStep} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <PageHeader
        title="AI Hiring Insights & Market Demand"
        subtitle="Recruiter diagnostics comparing candidate pool skills, active application volumes, and job specifications."
        icon={TrendingUp}
        actions={
          <Button
            variant="primary"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-xl font-black text-xs px-5 py-3 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate Fresh Diagnostic</span>
          </Button>
        }
      />

      {error && (
        <div className="flex items-start gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl dark:bg-rose-955/10 dark:border-rose-955/20 dark:text-rose-455">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && !parsingStep ? (
        <div className="flex justify-center p-12">
          <Spinner size="md" />
        </div>
      ) : insightData ? (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-455">
              Hiring Pipeline Diagnostics Summary
            </span>
            <p className="text-sm font-semibold mt-1.5 leading-relaxed">
              {insightData.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <HiringInsightCard insights={insightData} />
              
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                  Hiring Pipeline Overview Metrics
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center dark:bg-slate-800/30 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Average Applicant Compatibility Score
                    </span>
                    <span className="text-3xl font-black text-indigo-600 block mt-1">
                      {insightData.average_match_score || 0}%
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center dark:bg-slate-800/30 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Active Funnel Postings
                    </span>
                    <span className="text-3xl font-black text-slate-700 dark:text-white block mt-1">
                      {insightData.most_applied_jobs?.length || 0} Open
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <SkillDemandCard
                skillsDemand={insightData.skill_demand}
                missingSkills={insightData.missing_skills}
              />
              <HiringRecommendationCard recommendations={insightData.hiring_recommendations} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
              Insight Diagnostics History Logs
            </h3>
            {historyLoading ? (
              <div className="flex justify-center p-6">
                <Spinner size="sm" />
              </div>
            ) : (
              <InsightHistoryTable history={history} onDelete={handleDeleteHistoryItem} />
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs text-slate-550 font-bold">
            No insights calculated yet. Click 'Refresh Insights' to begin.
          </p>
        </div>
      )}
    </div>
  );
}

export default HiringInsights;
