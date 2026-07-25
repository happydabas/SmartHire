import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, History, ArrowLeft, BarChart2, ShieldAlert } from 'lucide-react';
import ResumeScoreCard from '@/components/resume/ResumeScoreCard';
import ATSScoreCard from '@/components/resume/ATSScoreCard';
import SectionAnalysisCard from '@/components/resume/SectionAnalysisCard';
import SkillGapCard from '@/components/resume/SkillGapCard';
import MissingSectionsCard from '@/components/resume/MissingSectionsCard';
import SuggestionsCard from '@/components/resume/SuggestionsCard';
import ResumeSummaryCard from '@/components/resume/ResumeSummaryCard';
import AnalysisHistoryTable from '@/components/resume/AnalysisHistoryTable';
import ResumeAnalysisLoader from '@/components/resume/ResumeAnalysisLoader';
import { resumeAnalysisService } from '@/services/resumeAnalysisService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';

export function ResumeAnalysis() {
  const [mode, setMode] = useState('input'); // 'input' | 'analyzing' | 'report'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history'
  const [analysisStep, setAnalysisStep] = useState('');
  const [reportData, setReportData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const data = await resumeAnalysisService.getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load analysis history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRunAnalysis = async () => {
    try {
      setError(null);
      setMode('analyzing');

      setAnalysisStep('Analyzing Resume...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setAnalysisStep('Checking ATS Compatibility...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setAnalysisStep('Generating Suggestions...');
      const response = await resumeAnalysisService.runAnalysis();
      
      setReportData(response);
      setMode('report');
      toast.success("AI Resume Analysis completed successfully!");
      fetchHistory();
    } catch (err) {
      console.error("Analysis run failed:", err);
      const errMsg = err?.response?.data?.detail || "AI analysis failed. Complete your profile or upload a resume first.";
      setError(errMsg);
      setMode('input');
      toast.error("Failed to analyze resume details.");
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await resumeAnalysisService.deleteHistory(id);
      toast.success("Analysis report deleted successfully");
      fetchHistory();
    } catch (err) {
      toast.error("Failed to delete report log");
    }
  };

  const handleViewReport = (historyItem) => {
    setReportData(historyItem.analysis_data || historyItem);
    setMode('report');
  };

  const handleBackToDashboard = () => {
    setMode('input');
    setReportData(null);
  };

  if (mode === 'analyzing') {
    return (
      <div className="py-20">
        <ResumeAnalysisLoader step={analysisStep} />
      </div>
    );
  }

  if (mode === 'report' && reportData) {
    return (
      <div className="space-y-6 pb-12 animate-fadeIn">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-1.5 text-xs font-black text-slate-505 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analysis Portal</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ResumeScoreCard score={reportData.overall_score} />
            <ATSScoreCard score={reportData.ats_score} evaluation={reportData.ats_evaluation} />
          </div>
          <div className="md:col-span-2 space-y-6">
            <ResumeSummaryCard summary={reportData.ai_summary} keywords={reportData.keywords} />
            <MissingSectionsCard missingSections={reportData.missing_sections} />
            <SkillGapCard skillGap={reportData.skill_gap} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionAnalysisCard analysis={reportData.section_analysis} />
          <SuggestionsCard suggestions={reportData.suggestions} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white flex items-center gap-2.5">
          <BarChart2 className="w-8 h-8 text-blue-600 animate-pulse" />
          <span>AI Resume Quality Analyzer</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1 dark:text-slate-400">
          Obtain professional optimization scores, ATS readability metrics, keyword summaries, and structured feedback on your credentials.
        </p>
      </div>

      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => { setActiveTab('dashboard'); setError(null); }}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'dashboard'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Run Analyzer</span>
        </button>
        <button
          onClick={() => { setActiveTab('history'); setError(null); }}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-660'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Report History</span>
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl dark:bg-rose-950/10 dark:border-rose-950/20 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <Card className="p-8 text-center space-y-6 border border-blue-50/50 bg-gradient-to-b from-blue-50/10 to-transparent">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl w-16 h-16 flex items-center justify-center mx-auto dark:bg-blue-950/20">
              <BarChart2 className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                Start Resume Performance Review
              </h3>
              <p className="text-xs text-slate-550 font-bold dark:text-slate-450 leading-relaxed">
                The system will examine your database profile metrics or PDF/DOCX resume file to run neural ATS compatibility rating scans.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleRunAnalysis}
              className="rounded-xl font-black px-8 py-3 shadow-lg shadow-blue-500/20"
            >
              Run AI Analysis
            </Button>
          </Card>
        </div>
      ) : (
        <div>
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Spinner size="md" />
              <p className="text-xs font-bold text-slate-400 animate-pulse">Loading report logs...</p>
            </div>
          ) : (
            <AnalysisHistoryTable
              history={history}
              onDelete={handleDeleteHistory}
              onView={handleViewReport}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeAnalysis;
