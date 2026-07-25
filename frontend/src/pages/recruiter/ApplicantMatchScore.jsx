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
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';

export function ApplicantMatchScore({ jobId, candidateId, candidateName, jobTitle, onBack }) {
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [parsingStep, setParsingStep] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'details'

  const fetchExistingMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchScoreService.getMatchScore(jobId, candidateId);
      setMatchData(data.match_data || data);
    } catch (err) {
      if (err?.response?.status !== 404) {
        setError("Failed to retrieve existing matching details for this applicant.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingMatch();
  }, [jobId, candidateId]);

  const handleCalculateMatch = async () => {
    try {
      setError(null);
      setLoading(true);

      setParsingStep('Calculating Match...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setParsingStep('Comparing Skills...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setParsingStep('Generating Recommendations...');
      const response = await matchScoreService.calculateMatchScore(jobId, candidateId);
      
      setMatchData(response);
      toast.success("AI Fit Score calculated successfully!");
    } catch (err) {
      console.error("Match Score calculation failure:", err);
      const errMsg = err?.response?.data?.detail || "AI calculation failed. Verify candidate profile exists.";
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
          <span>Back to Applicant Details</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-slate-850 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-455">
            AI Applicant Fit Analysis
          </span>
          <h2 className="text-xl font-black mt-0.5 leading-tight">
            Candidate: {candidateName || "Applicant"}
          </h2>
          <p className="text-xs text-slate-350 font-semibold mt-1">
            Analyzing compatibility against job posting: <strong className="text-white">{jobTitle}</strong>
          </p>
        </div>
        {!matchData && !loading && (
          <Button
            variant="primary"
            onClick={handleCalculateMatch}
            className="rounded-xl font-black text-xs px-6 py-3 shrink-0"
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
        <div className="flex items-center gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl dark:bg-rose-955/10 dark:border-rose-955/20 dark:text-rose-450">
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
                </div>
                <div className="md:col-span-2 space-y-6">
                  <AIExplanationCard explanation={matchData.ai_explanation} />
                  <SkillsComparison skillsComparison={matchData.skills_comparison} />
                </div>
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

export default ApplicantMatchScore;
