import React, { useState, useEffect } from 'react';
import { skillMatchingService } from '@/services/skillMatchingService';
import SkillCoverageCard from '@/components/ai/SkillCoverageCard';
import MatchedSkillsCard from '@/components/ai/MatchedSkillsCard';
import RelatedSkillsCard from '@/components/ai/RelatedSkillsCard';
import MissingSkillsCard from '@/components/ai/MissingSkillsCard';
import AdditionalSkillsCard from '@/components/ai/AdditionalSkillsCard';
import CategoryCoverageCard from '@/components/ai/CategoryCoverageCard';
import SkillGapCard from '@/components/ai/SkillGapCard';
import LearningRecommendationsCard from '@/components/ai/LearningRecommendationsCard';
import SkillMatchingLoader from '@/components/ai/SkillMatchingLoader';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';

export function ApplicantSkillMatching({ jobId, candidateId, candidateName, jobTitle, onBack }) {
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [parsingStep, setParsingStep] = useState('');
  const [error, setError] = useState(null);

  const fetchExistingMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await skillMatchingService.getSkillMatching(jobId, candidateId);
      setMatchData(data.matching_data || data);
    } catch (err) {
      if (err?.response?.status !== 404) {
        setError("Failed to retrieve existing skill match profile.");
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

      setParsingStep('Matching Skills...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setParsingStep('Finding Related Technologies...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setParsingStep('Analyzing Skill Gaps...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setParsingStep('Generating Learning Plan...');
      const response = await skillMatchingService.calculateSkillMatching(jobId, candidateId);
      
      setMatchData(response);
      toast.success("AI Skills Matrix calculated successfully!");
    } catch (err) {
      console.error("Skill Matching Engine failure:", err);
      const errMsg = err?.response?.data?.detail || "AI comparison failed. Verify candidate profile exists.";
      setError(errMsg);
      toast.error("Failed to run Skills Matching Engine.");
    } finally {
      setLoading(false);
      setParsingStep('');
    }
  };

  if (loading && parsingStep) {
    return (
      <div className="py-12">
        <SkillMatchingLoader step={parsingStep} />
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
            AI Applicant Skill Alignment
          </span>
          <h2 className="text-xl font-black mt-0.5 leading-tight">
            Candidate: {candidateName || "Applicant"}
          </h2>
          <p className="text-xs text-slate-350 font-semibold mt-1">
            Analyzing stack compatibility for job posting: <strong className="text-white">{jobTitle}</strong>
          </p>
        </div>
        {!matchData && !loading && (
          <Button
            variant="primary"
            onClick={handleCalculateMatch}
            className="rounded-xl font-black text-xs px-6 py-3 shrink-0"
          >
            Calculate Skill Matrix
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl dark:bg-rose-955/10 dark:border-rose-955/20 dark:text-rose-455">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <SkillCoverageCard coverage={matchData.overall_coverage} />
            </div>
            <div className="md:col-span-2 space-y-6">
              <CategoryCoverageCard categories={matchData.category_coverage} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MatchedSkillsCard matchedSkills={matchData.matched_skills} />
            <RelatedSkillsCard relatedSkills={matchData.related_skills} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MissingSkillsCard missingSkills={matchData.missing_skills} />
            <AdditionalSkillsCard additionalSkills={matchData.additional_skills} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillGapCard skillGaps={matchData.skill_gap_analysis} />
            <LearningRecommendationsCard recommendations={matchData.learning_recommendations} />
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-bold">
            No skill analysis calculated. Click 'Calculate Skill Matrix' to begin.
          </p>
        </div>
      )}
    </div>
  );
}

export default ApplicantSkillMatching;
