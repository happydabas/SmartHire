import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Building,
  GraduationCap,
  FileText,
  UserCheck,
  Edit2,
  Send,
  Bookmark,
  BarChart2,
  ListChecks,
  Code2,
  Gift,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { jobService } from '@/services/jobs/jobService';
import JobMatchScore from '@/pages/jobseeker/JobMatchScore';
import JobSkillMatching from '@/pages/jobseeker/JobSkillMatching';
import SimilarJobs from '@/components/ai/SimilarJobs';
import { profileService } from '@/services/profile/profileService';
import { resumeService } from '@/services/resume/resumeService';
import { applicationService } from '@/services/applications/applicationService';
import { formatDate } from '@/utils/formatDate';
import { formatSalary } from '@/utils/formatSalary';
import { formatJobType, formatWorkMode, formatExperienceLevel } from '@/utils/enumFormatters';
import { notificationService } from '@/services/notificationService';
import { extractErrorMessage } from '@/utils/errorParser';

// Reusable UI components
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import SkeletonProfile from '@/components/common/SkeletonProfile';

export function JobDetailsPage() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Job and application state
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Profile & Resume status
  const [hasProfile, setHasProfile] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Application & Bookmark state
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modals state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProfileWarningOpen, setIsProfileWarningOpen] = useState(false);
  const [isResumeWarningOpen, setIsResumeWarningOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showMatchScore, setShowMatchScore] = useState(false);
  const [showSkillMatching, setShowSkillMatching] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch job details directly from backend
      let targetJob = null;
      try {
        targetJob = await jobService.getJobDetails(Number(jobId));
      } catch (err) {
        console.warn('getJobDetails failed, falling back to getOpenJobs:', err);
        const response = await jobService.getOpenJobs({ page: 1, limit: 100 });
        const jobList = response?.jobs || response || [];
        targetJob = jobList.find(j => j.id === Number(jobId));
      }

      if (!targetJob) {
        setError("Job listing not found or is no longer active.");
        return;
      }
      setJob(targetJob);

      // Concurrently load saved jobs metadata & user status
      const savedJobsPromise = jobService.getSavedJobs().catch(() => []);
      
      let appHistoryPromise = Promise.resolve(null);
      let resumeMetadataPromise = Promise.resolve(null);
      let profilePromise = Promise.resolve(null);

      if (isAuthenticated && user?.role === ROLES.JOB_SEEKER) {
        setProfileLoading(true);
        appHistoryPromise = applicationService.getApplicationHistory({ page: 1, limit: 100 }).catch(() => null);
        resumeMetadataPromise = resumeService.getResumeMetadata().catch(() => null);
        profilePromise = profileService.getProfile().catch(() => null);
      }

      const [savedJobsData, appHistory, resumeData, profileData] = await Promise.all([
        savedJobsPromise,
        appHistoryPromise,
        resumeMetadataPromise,
        profilePromise
      ]);

      if (savedJobsData) {
        const savedIds = new Set(savedJobsData.map(j => j.id));
        setIsSaved(savedIds.has(Number(jobId)));
      }

      if (isAuthenticated && user?.role === ROLES.JOB_SEEKER) {
        const applied = (appHistory?.items || []).some(
          app => app.job?.id === Number(jobId) && app.status?.toLowerCase() !== 'withdrawn'
        );
        setHasApplied(applied);

        setHasProfile(!!profileData);
        setHasResume(!!(resumeData && resumeData.file_name));
      }
    } catch (err) {
      console.error("Fetch job details error:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId, isAuthenticated]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${jobId}`);
      return;
    }

    try {
      if (isSaved) {
        await jobService.unsaveJob(Number(jobId));
        setIsSaved(false);
      } else {
        await jobService.saveJob(Number(jobId));
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Toggle bookmark error:", err);
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${jobId}`);
      return;
    }

    if (hasApplied) return;

    if (!hasProfile) {
      setIsProfileWarningOpen(true);
      return;
    }

    if (!hasResume) {
      setIsResumeWarningOpen(true);
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmApply = async () => {
    try {
      setApplyLoading(true);
      setError(null);
      
      const appResult = await applicationService.applyToJob(Number(jobId));

      setSuccess("Your application was submitted successfully!");
      setHasApplied(true);
      setIsConfirmOpen(false);
      setIsSuccessModalOpen(true);

      notificationService.notifyApplicationSubmitted(appResult.id, job, user)
        .catch(err => console.error("Notification submission trigger error:", err));
    } catch (err) {
      console.error("Apply job error:", err);
      const errorMsg = extractErrorMessage(err);
      setError(errorMsg);
      setIsConfirmOpen(false);

      if (errorMsg.toLowerCase().includes('profile')) {
        setIsProfileWarningOpen(true);
      } else if (errorMsg.toLowerCase().includes('resume')) {
        setIsResumeWarningOpen(true);
      }
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-32"></div>
        <SkeletonProfile />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="inline-flex p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Job Details Unavailable</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{error}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/jobs')}
          className="rounded-xl font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Listings
        </Button>
      </div>
    );
  }

  if (showMatchScore && job) {
    return (
      <JobMatchScore
        jobId={Number(jobId)}
        jobTitle={job.title}
        onBack={() => setShowMatchScore(false)}
      />
    );
  }

  if (showSkillMatching && job) {
    return (
      <JobSkillMatching
        jobId={Number(jobId)}
        jobTitle={job.title}
        onBack={() => setShowSkillMatching(false)}
      />
    );
  }

  const isRecruiter = isAuthenticated && (user?.role === ROLES.RECRUITER || user?.role === ROLES.COMPANY_OWNER || user?.is_owner);
  const isOwner = Boolean(user?.is_owner || user?.role === ROLES.COMPANY_OWNER);
  const typeLabel = formatJobType(job.job_type);
  const modeLabel = formatWorkMode(job.work_mode);
  const expLabel = formatExperienceLevel(job.experience_level);
  const companyName = job.company?.name || 'Company';
  const initial = companyName[0].toUpperCase();

  // Helper to compute deadline badge
  const getDeadlineBadge = () => {
    if (!job.application_deadline) return null;
    const deadline = new Date(job.application_deadline);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-400 rounded-md">Expired</span>;
    }
    if (diffDays === 0) {
      return <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-400 rounded-md">Ends Today</span>;
    }
    if (diffDays <= 7) {
      return <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-400 rounded-md">{diffDays} {diffDays === 1 ? 'day' : 'days'} left</span>;
    }
    return null;
  };

  // Helper to split description into sections if markdown headers are present
  const parseDescriptionSections = (desc) => {
    if (!desc) return { overview: '', responsibilities: [], requirements: [], benefits: [] };

    const lines = desc.split('\n');
    let currentSection = 'overview';
    const result = {
      overview: [],
      responsibilities: [],
      requirements: [],
      benefits: []
    };

    let hasMarkdownHeaders = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (/^###?\s*Responsibilities/i.test(trimmed) || /^Responsibilities:/i.test(trimmed)) {
        currentSection = 'responsibilities';
        hasMarkdownHeaders = true;
      } else if (/^###?\s*Requirements/i.test(trimmed) || /^Requirements:/i.test(trimmed)) {
        currentSection = 'requirements';
        hasMarkdownHeaders = true;
      } else if (/^###?\s*Benefits/i.test(trimmed) || /^Benefits:/i.test(trimmed)) {
        currentSection = 'benefits';
        hasMarkdownHeaders = true;
      } else if (/^###?\s*(Job\s+)?Description/i.test(trimmed)) {
        currentSection = 'overview';
        hasMarkdownHeaders = true;
      } else if (trimmed) {
        result[currentSection].push(trimmed);
      }
    });

    if (!hasMarkdownHeaders) {
      return {
        overview: desc,
        responsibilities: [],
        requirements: [],
        benefits: []
      };
    }

    return {
      overview: result.overview.join('\n'),
      responsibilities: result.responsibilities,
      requirements: result.requirements,
      benefits: result.benefits
    };
  };

  const parsedDesc = parseDescriptionSections(job.description);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(isRecruiter ? '/recruiter/jobs' : '/jobs')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-2xl dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Top Header Card */}
      <Card className="p-6 md:p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        {/* Left Info Box */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 border border-blue-100 dark:border-blue-800/50 shadow-inner">
            {initial}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="truncate">{companyName}</span>
              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/15 shrink-0" />
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug break-words">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 dark:text-slate-500 text-xs font-semibold pt-1">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                </span>
              )}
              {job.location && <span>•</span>}
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {typeLabel}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" /> {modeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Action Buttons */}
        <div className="w-full md:w-auto shrink-0 flex flex-wrap items-center justify-start md:justify-end gap-3 pt-2 md:pt-0">
          {isRecruiter ? (
            <>
              {isOwner && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                  className="rounded-2xl font-bold py-3 px-5 shadow-md flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4 shrink-0 text-white" />
                  <span>Edit Job</span>
                </Button>
              )}

              <Button
                variant={isOwner ? "secondary" : "primary"}
                size="md"
                onClick={() => navigate(`/recruiter/applicants?jobId=${job.id}`)}
                className="rounded-2xl font-bold py-3 px-5 shadow-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800"
              >
                <UserCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>Review Applicants ({job.applications_count || 0})</span>
              </Button>
            </>
          ) : (
            <>
              {/* Button 1: Check AI Match Score (Soon) */}
              <button
                type="button"
                onClick={() => triggerToast('AI Match Score feature is coming soon!', 'info')}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 transition-all text-left shadow-sm group cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black block text-slate-900 dark:text-white leading-tight">Check AI Match Score</span>
                    <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">Soon</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">See how well you fit for this job (Coming Soon)</span>
                </div>
              </button>

              {/* Button 2: Check Skill Alignment (Soon) */}
              <button
                type="button"
                onClick={() => triggerToast('Skill Alignment feature is coming soon!', 'info')}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 transition-all text-left shadow-sm group cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                  <BarChart2 className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black block text-slate-900 dark:text-white leading-tight">Check Skill Alignment</span>
                    <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">Soon</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Find matching & missing skills (Coming Soon)</span>
                </div>
              </button>

              {/* Bookmark Toggle Button */}
              <button
                onClick={handleToggleSave}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                title={isSaved ? "Saved" : "Save Job"}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
              </button>

              {/* Apply Now Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleApplyClick}
                disabled={hasApplied || applyLoading || profileLoading}
                className={`rounded-2xl font-black py-3.5 px-6 shadow-md transition-all ${
                  hasApplied ? 'bg-emerald-600 hover:bg-emerald-600 cursor-not-allowed opacity-90' : ''
                }`}
              >
                {profileLoading ? (
                  <Spinner size="sm" />
                ) : hasApplied ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <UserCheck className="w-4 h-4 shrink-0 text-white" /> Already Applied
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Send className="w-4 h-4 shrink-0 text-white" /> Apply Now
                  </span>
                )}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Main Grid Layout: Left Column Details & Right Column Overview/Similar Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Job Description & Detailed Sections */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 md:p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-8">
            
            {/* Job Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">Job Description</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line pt-1 font-medium">
                {typeof parsedDesc.overview === 'string' && parsedDesc.overview ? parsedDesc.overview : job.description}
              </p>
            </div>

            {/* Responsibilities */}
            {(parsedDesc.responsibilities.length > 0 || !job.description?.includes('###')) && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Responsibilities</h2>
                </div>
                {parsedDesc.responsibilities.length > 0 ? (
                  <ul className="space-y-2.5 pt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {parsedDesc.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2.5 pt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                      <span>Collaborate with cross-functional product and engineering teams to deliver high-quality features.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                      <span>Design, develop, test, and deploy robust scalable software solutions.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                      <span>Participate in code reviews, technical architecture discussions, and continuous improvements.</span>
                    </li>
                  </ul>
                )}
              </div>
            )}

            {/* Requirements */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">Requirements</h2>
              </div>
              
              {parsedDesc.requirements.length > 0 ? (
                <ul className="space-y-2.5 pt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {parsedDesc.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2.5 pt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                    <span>Relevant background or degree in Computer Science, Software Engineering, or equivalent experience.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                    <span>Strong problem-solving, analytical thinking, and communication skills.</span>
                  </li>
                </ul>
              )}

              {/* Skills Tags */}
              {job.skills && job.skills.length > 0 && (
                <div className="space-y-2 pt-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Required Technologies & Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <span 
                        key={skill.id} 
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">Benefits</h2>
              </div>
              
              {parsedDesc.benefits.length > 0 ? (
                <ul className="space-y-2.5 pt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {parsedDesc.benefits.map((ben, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2.5 pt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                    <span>Competitive salary & compensation package</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                    <span>Health insurance & wellness benefits</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                    <span>Continuous learning & professional development growth opportunities</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                    <span>Great collaborative work culture & flexible schedule</span>
                  </li>
                </ul>
              )}
            </div>

          </Card>
        </div>

        {/* Right Column: Overview Card & Similar Jobs */}
        <div className="space-y-6">
          {/* Overview Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Overview</h3>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {/* Date Posted */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Date Posted</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{formatDate(job.created_at)}</span>
              </div>

              {/* Application Deadline */}
              {job.application_deadline && (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Application Deadline</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">{formatDate(job.application_deadline)}</span>
                    {getDeadlineBadge()}
                  </div>
                </div>
              )}

              {/* Experience Level */}
              {job.experience_level && (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Experience Level</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">{expLabel}</span>
                </div>
              )}

              {/* Job Type */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Job Type</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{typeLabel}</span>
              </div>

              {/* Work Mode */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Work Mode</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{modeLabel}</span>
              </div>

              {/* Location */}
              {job.location && (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Location</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{job.location}</span>
                </div>
              )}

              {/* Salary Range */}
              {(job.salary_min !== undefined && job.salary_min !== null) && (
                <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Salary Range</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {formatSalary(job.salary_min)} {job.salary_max ? `– ${formatSalary(job.salary_max)}` : ''}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Similar Jobs Component */}
          {!isRecruiter && <SimilarJobs jobId={job.id} />}
        </div>

      </div>

      {/* Apply Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Apply for Job opening"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Are you sure you want to apply for the <strong>{job?.title}</strong> role at <strong>{companyName}</strong>?
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="text-xs">
              <span className="block font-bold text-slate-700 dark:text-slate-200">Selected Resume Credentials</span>
              <span className="text-slate-400 font-medium">Your profile resume will be attached to this application.</span>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              disabled={applyLoading}
              className="w-full sm:w-auto rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmApply}
              isLoading={applyLoading}
              disabled={applyLoading}
              className="w-full sm:w-auto rounded-xl font-bold px-6"
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>

      {/* Profile Missing Dialog */}
      <Modal
        isOpen={isProfileWarningOpen}
        onClose={() => setIsProfileWarningOpen(false)}
        title="Profile Credentials Required"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Profile Completion Required</span>
              <span className="text-xs text-amber-600/90 dark:text-amber-400/90 leading-relaxed font-medium">
                Please complete your candidate profile before submitting applications to recruiters.
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProfileWarningOpen(false)}
              className="w-full sm:w-auto rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsProfileWarningOpen(false);
                navigate('/profile');
              }}
              className="w-full sm:w-auto rounded-xl font-bold px-6"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resume Missing Dialog */}
      <Modal
        isOpen={isResumeWarningOpen}
        onClose={() => setIsResumeWarningOpen(false)}
        title="Resume Credentials Required"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">No Resume Profile Found</span>
              <span className="text-xs text-amber-600/90 dark:text-amber-400/90 leading-relaxed font-medium">
                Please upload your resume before submitting applications to recruiters.
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsResumeWarningOpen(false)}
              className="w-full sm:w-auto rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsResumeWarningOpen(false);
                navigate('/resume');
              }}
              className="w-full sm:w-auto rounded-xl font-bold px-6"
            >
              Upload Resume
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Application Submitted!"
      >
        <div className="space-y-5 text-center py-4">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-400">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Successfully Applied!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              Your credentials have been successfully delivered to the hiring team at <strong>{companyName}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate('/jobs');
              }}
              className="rounded-xl font-bold order-2 sm:order-1"
            >
              Continue Browsing Jobs
            </Button>
            
            <Button
              variant="primary"
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate('/applications');
              }}
              className="rounded-xl font-bold order-1 sm:order-2 px-6"
            >
              View My Applications
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default JobDetailsPage;
