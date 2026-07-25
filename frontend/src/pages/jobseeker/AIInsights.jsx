import React, { useState, useEffect } from 'react';
import { insightsService } from '@/services/insightsService';
import ResumeHealthCard from '@/components/ai/ResumeHealthCard';
import CareerSuggestionCard from '@/components/ai/CareerSuggestionCard';
import LearningRecommendationCard from '@/components/ai/LearningRecommendationCard';
import InsightHistoryTable from '@/components/ai/InsightHistoryTable';
import AIInsightLoader from '@/components/ai/AIInsightLoader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { ShieldAlert, RefreshCw, BarChart3, Star, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AIInsights() {
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
        toast.success("AI Insights refreshed successfully!");
        fetchHistory();
      } else {
        const response = await insightsService.refreshInsights();
        setInsightData(response.insight_data || response);
      }
    } catch (err) {
      console.error("Insights calculation failed:", err);
      const errMsg = err?.response?.data?.detail || "Failed to generate insights. Complete your profile or upload a resume first.";
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-8 h-8 text-indigo-650 animate-pulse" />
            <span>AI Career Insights & Diagnostics</span>
          </h1>
          <p className="text-slate-550 text-sm mt-1 dark:text-slate-400">
            AI-powered diagnostics analyzing resume health metrics, career suggestions, and learning roadmaps.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-xl font-black text-xs px-5 py-3 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Insights</span>
        </Button>
      </div>

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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-3xl shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200">
              Personalized Diagnostics Summary
            </span>
            <p className="text-sm font-semibold mt-1.5 leading-relaxed">
              {insightData.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ResumeHealthCard health={insightData.resume_health} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 dark:text-slate-500">
                    <Star className="w-4 h-4 text-emerald-500" />
                    <span>Top Skill Competencies</span>
                  </h4>
                  {(!insightData.top_skills || insightData.top_skills.length === 0) ? (
                    <p className="text-xs text-slate-500 font-bold">No skills cataloged.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {insightData.top_skills.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 text-xs font-bold rounded-xl">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 dark:text-slate-500">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Areas For Improvement</span>
                  </h4>
                  {(!insightData.weak_skills || insightData.weak_skills.length === 0) ? (
                    <p className="text-xs text-slate-500 font-bold">Excellent fit profile!</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {insightData.weak_skills.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-955/25 dark:text-amber-400 dark:border-amber-900/50 text-xs font-bold rounded-xl">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <CareerSuggestionCard suggestions={insightData.career_suggestions} />
              <LearningRecommendationCard roadmap={insightData.learning_roadmap} />
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
          <p className="text-xs text-slate-500 font-bold">
            No insights data calculated. Click 'Refresh Insights' to begin.
          </p>
        </div>
      )}
    </div>
  );
}

export default AIInsights;
