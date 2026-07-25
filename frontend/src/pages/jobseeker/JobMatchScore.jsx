import React, { useState, useEffect } from 'react';
import { matchScoreService } from '@/services/matchScoreService';
import MatchScoreCard from '@/components/ai/MatchScoreCard';
import MatchBreakdown from '@/components/ai/MatchBreakdown';
import SkillsComparison from '@/components/ai/SkillsComparison';
import ExperienceComparison from '@/components/ai/ExperienceComparison';
import EducationComparison from '@/components/ai/EducationComparison';
import ProjectComparison from '@/components/ai/ProjectComparison';
import CertificationComparison from '@/components/ai/CertificationComparison';
import AIExplanationCard from '@/components/ai/AIExplanationCard';
import ImprovementSuggestions from '@/components/ai/ImprovementSuggestions';
import MatchScoreLoader from '@/components/ai/MatchScoreLoader';
import { ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';

export function JobMatchScore({ jobId, onBack, jobTitle }) {
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [parsingStep, setParsingStep] = useState('');
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'details'

  const fetchExistingMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchScoreService.getMatchScore(jobId, null);
      setMatchData(data.match_data || data);
    } catch (err) {
      if (err?.response?.status !== 404) {
        setError("Failed to retrieve existing matching details. Trigger a recalculation.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingMatch();
  }, [jobId]);

  const handleCalculateMatch = async () => {
    try {
      setError(null);
      setLoading(true);

      setParsingStep('Calculating Match...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setParsingStep('Comparing Skills...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setParsingStep('Generating Recommendations...');
      const response = await matchScoreService.calculateMatchScore(jobId, null);
      
      setMatchData(response);
      toast.success("AI Fit Score calculated successfully!");
    } catch (err) {
      console.error("Match Score calculation failure:", err);
      const errMsg = err?.response?.data?.detail || "AI calculation failed. Complete your profile or upload a resume first.";
      setError(errMsg);
      toast.error("Failed to calculate AI Fit Score.");
    } finally {
      setLoading(false);
      setParsingStep('');
    }
  };

  if (loading && parsingStep) {
    return (
      <div className="py-12">
        <MatchScoreLoader step={parsingStep} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-black text-slate-550 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Details</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
            AI Job Match Report
          </span>
          <h2 className="text-xl font-black mt-0.5 leading-tight">
            {jobTitle || "Job Opportunity"}
          </h2>
          <p className="text-xs text-blue-100 font-semibold mt-1">
            See how your developer profile aligns against the employer's expectations.
          </p>
        </div>
        {!matchData && !loading && (
          <Button
            variant="primary"
            onClick={handleCalculateMatch}
            className="bg-white text-blue-600 hover:bg-blue-50 focus:ring-white rounded-xl font-black text-xs px-6 py-3 shrink-0"
          >
            Calculate AI Fit Score
          </Button>
        )}
      </div>

      {matchData && (
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Fit Overview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Detailed Parameter Check
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl dark:bg-rose-955/10 dark:border-rose-950/20 dark:text-rose-455">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {loading && !parsingStep ? (
        <div className="flex justify-center p-12">
          <Spinner size="md" />
        </div>
      ) : matchData ? (
        <div className="space-y-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                  <MatchScoreCard score={matchData.overall_score} />
                  {matchData.overall_score < 75 && (
                    <div className="p-4 border border-amber-100 bg-amber-50/50 rounded-2xl text-amber-800 text-[11px] font-bold leading-relaxed dark:bg-amber-955/10 dark:border-amber-950/20 dark:text-amber-400">
                      ⚡ We recommend reviewing the suggestions below to strengthen your profile/resume description keywords before applying!
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 space-y-6">
                  <AIExplanationCard explanation={matchData.ai_explanation} />
                  <SkillsComparison skillsComparison={matchData.skills_comparison} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchData.strengths && matchData.strengths.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      Your Strengths
                    </span>
                    <ul className="space-y-2">
                      {matchData.strengths.map((st, i) => (
                        <li key={i} className="flex gap-2 items-start text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchData.weaknesses && matchData.weaknesses.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-wide">
                      Potential Weaknesses
                    </span>
                    <ul className="space-y-2">
                      {matchData.weaknesses.map((wk, i) => (
                        <li key={i} className="flex gap-2 items-start text-xs font-semibold text-slate-700 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MatchBreakdown breakdown={matchData.breakdown} />
                <ImprovementSuggestions suggestions={matchData.suggestions} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExperienceComparison experienceComparison={matchData.experience_comparison} />
                <EducationComparison educationComparison={matchData.education_comparison} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProjectComparison projectComparison={matchData.project_comparison} />
                <CertificationComparison certificationComparison={matchData.certification_comparison} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-bold">
            No match report available. Click 'Calculate AI Fit Score' to run checks.
          </p>
        </div>
      )}
    </div>
  );
}

export default JobMatchScore;
