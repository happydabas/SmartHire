import React, { useState, useEffect } from 'react';
import { insightsService } from '@/services/insightsService';
import { recommendationService } from '@/services/recommendationService';
import ResumeHealthCard from '@/components/ai/ResumeHealthCard';
import CareerSuggestionCard from '@/components/ai/CareerSuggestionCard';
import LearningRecommendationCard from '@/components/ai/LearningRecommendationCard';
import InsightHistoryTable from '@/components/ai/InsightHistoryTable';
import RecommendationHistoryTable from '@/components/ai/RecommendationHistoryTable';
import AIInsightLoader from '@/components/ai/AIInsightLoader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import {
  BarChart3,
  BookOpen,
  Star,
  TrendingUp,
  History,
  RefreshCw,
  AlertCircle,
  Trash2,
  Sparkles,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const MARKET_TRENDS_DATA = [
  { month: 'Jan', Frontend: 78, Backend: 85, DevOps: 68, DataScience: 60 },
  { month: 'Feb', Frontend: 80, Backend: 86, DevOps: 72, DataScience: 62 },
  { month: 'Mar', Frontend: 82, Backend: 89, DevOps: 75, DataScience: 68 },
  { month: 'Apr', Frontend: 88, Backend: 87, DevOps: 80, DataScience: 75 },
  { month: 'May', Frontend: 92, Backend: 91, DevOps: 82, DataScience: 80 },
  { month: 'Jun', Frontend: 95, Backend: 94, DevOps: 85, DataScience: 88 },
  { month: 'Jul', Frontend: 98, Backend: 96, DevOps: 89, DataScience: 92 }
];

const TRENDING_ROLE_DEMANDS = [
  { role: 'React Frontend Developer', growth: '+28%', status: 'Explosive', salary: '$120k - $160k' },
  { role: 'FastAPI Backend Engineer', growth: '+22%', status: 'High', salary: '$130k - $175k' },
  { role: 'DevOps / Kubernetes Admin', growth: '+18%', status: 'Stable', salary: '$140k - $190k' },
  { role: 'AI Agent Integrator / LLMs', growth: '+45%', status: 'Explosive', salary: '$150k - $210k' }
];

export function AIInsights() {
  const [activeTab, setActiveTab] = useState('career'); // 'career' | 'roadmap' | 'gap' | 'trends' | 'history'
  const [loading, setLoading] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [insightData, setInsightData] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [recHistory, setRecHistory] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
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

  const loadRecommendationHistory = async () => {
    try {
      setRecLoading(true);
      const data = await recommendationService.getRecommendationHistory();
      setRecHistory(data || []);
    } catch (err) {
      console.error("Failed to load recommendation history:", err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleClearRecommendationHistory = async () => {
    try {
      await recommendationService.clearRecommendationHistory();
      toast.success("Recommendation history cleared successfully!");
      setRecHistory([]);
    } catch (err) {
      toast.error("Failed to clear recommendation logs.");
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadRecommendationHistory();
    }
  }, [activeTab]);

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
      {/* Heading */}
      <PageHeader
        title="AI Career Insights"
        subtitle="Audit your resume strength, track market demand, and plan learning roadmaps."
        icon={BarChart3}
        actions={
          activeTab !== 'history' && (
            <Button
              variant="primary"
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-xl font-black text-xs px-5 py-3 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Insights</span>
            </Button>
          )
        }
      />

      {/* 5 Tabs Navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-805">
        <button
          onClick={() => setActiveTab('career')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'career'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Career Recommendations</span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'roadmap'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Learning Roadmap</span>
        </button>

        <button
          onClick={() => setActiveTab('gap')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'gap'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Skill Gap Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'trends'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Market Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Recommendation History</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {error && activeTab !== 'history' && (
          <div className="flex items-start gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. CAREER RECOMMENDATIONS TAB */}
        {activeTab === 'career' && (
          <>
            {loading ? (
              <div className="flex justify-center p-12"><Spinner size="md" /></div>
            ) : insightData ? (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-650 to-indigo-700 text-white p-6 rounded-3xl shadow-md space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Personalized Executive Diagnostics
                  </span>
                  <p className="text-sm font-semibold leading-relaxed">
                    {insightData.summary}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <CareerSuggestionCard suggestions={insightData.career_suggestions} />
                  </div>
                  <div className="space-y-3 bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Insight History Log</h3>
                    {historyLoading ? (
                      <div className="flex justify-center p-6"><Spinner size="sm" /></div>
                    ) : (
                      <InsightHistoryTable history={history} onDelete={handleDeleteHistoryItem} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl">
                <p className="text-xs text-slate-500 font-bold">No insights calculated. Please complete your profile or click 'Refresh Insights'.</p>
              </div>
            )}
          </>
        )}

        {/* 2. LEARNING ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <>
            {loading ? (
              <div className="flex justify-center p-12"><Spinner size="md" /></div>
            ) : insightData ? (
              <div className="animate-fadeIn max-w-3xl mx-auto">
                <LearningRecommendationCard roadmap={insightData.learning_roadmap} />
              </div>
            ) : (
              <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl">
                <p className="text-xs text-slate-500 font-bold">No roadmap items generated. Click 'Refresh Insights' to compute suggestions.</p>
              </div>
            )}
          </>
        )}

        {/* 3. SKILL GAP ANALYSIS TAB */}
        {activeTab === 'gap' && (
          <>
            {loading ? (
              <div className="flex justify-center p-12"><Spinner size="md" /></div>
            ) : insightData ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div className="lg:col-span-2">
                  <ResumeHealthCard health={insightData.resume_health} />
                </div>
                <div className="space-y-6">
                  {/* Top skills */}
                  <Card className="p-6 border border-slate-100 shadow-sm bg-white space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span>Top Skill Competencies</span>
                    </h4>
                    {(!insightData.top_skills || insightData.top_skills.length === 0) ? (
                      <p className="text-xs text-slate-550 font-bold">No catalog skills associated.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {insightData.top_skills.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold rounded-lg">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Weak skills */}
                  <Card className="p-6 border border-slate-100 shadow-sm bg-white space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span>Areas For Improvement</span>
                    </h4>
                    {(!insightData.weak_skills || insightData.weak_skills.length === 0) ? (
                      <p className="text-xs text-slate-550 font-bold">Profile aligned with job requirements!</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {insightData.weak_skills.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold rounded-lg">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl">
                <p className="text-xs text-slate-500 font-bold">Skill gap diagnostics not loaded.</p>
              </div>
            )}
          </>
        )}

        {/* 4. MARKET TRENDS TAB */}
        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Interactive area chart */}
            <Card className="p-6 border border-slate-100 shadow-sm bg-white lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Job Board Demand Growth Trends</h3>
                <p className="text-xs text-slate-450 mt-0.5">Projected demand index percentages over the last two quarters.</p>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MARKET_TRENDS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFrontend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBackend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9' }} />
                    <Area type="monotone" dataKey="Frontend" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorFrontend)" />
                    <Area type="monotone" dataKey="Backend" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBackend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold pl-1.5">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" /> Frontend Index</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Backend Index</span>
              </div>
            </Card>

            {/* Trending table */}
            <Card className="p-6 border border-slate-100 shadow-sm bg-white space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Trending Job Roles</h3>
                <p className="text-xs text-slate-450 mt-0.5">High growth opportunities in today's market.</p>
              </div>
              <div className="space-y-3.5">
                {TRENDING_ROLE_DEMANDS.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-slate-750 block">{item.role}</span>
                      <span className="text-[10px] text-slate-450 block mt-0.5">{item.salary}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 block">{item.growth}</span>
                      <span className="text-[9px] font-medium text-slate-405 dark:text-slate-500 uppercase tracking-wide block">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 5. RECOMMENDATION HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recommendation History</h2>
                <p className="text-xs text-slate-400 mt-0.5">History logs of previous job suggestions computed for your profile.</p>
              </div>
              {recHistory.length > 0 && (
                <Button variant="danger" size="sm" onClick={handleClearRecommendationHistory} className="rounded-xl font-bold text-xs flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </Button>
              )}
            </div>

            {recLoading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-2">
                <Spinner size="md" />
                <p className="text-xs text-slate-400 font-semibold animate-pulse">Retrieving historical suggestions...</p>
              </div>
            ) : (
              <RecommendationHistoryTable history={recHistory} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIInsights;
