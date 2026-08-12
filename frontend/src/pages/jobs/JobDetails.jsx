import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { jobService } from '@/services/jobs/jobService';
import JobMatchScore from '@/pages/jobseeker/JobMatchScore';
import JobSkillMatching from '@/pages/jobseeker/JobSkillMatching';
import SimilarJobs from '@/components/ai/SimilarJobs';
import { resumeService } from '@/services/resume/resumeService';
import { applicationService } from '@/services/applications/applicationService';
import { formatDate } from '@/utils/formatDate';
import { formatSalary } from '@/utils/formatSalary';
import { formatJobType, formatWorkMode, formatExperienceLevel } from '@/utils/enumFormatters';
import { notificationService } from '@/services/notificationService';

// Reusable UI components
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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

  // Resume status
  const [hasResume, setHasResume] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Application check state
  const [hasApplied, setHasApplied] = useState(false);

  // Modals state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResumeWarningOpen, setIsResumeWarningOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showMatchScore, setShowMatchScore] = useState(false);
  const [showSkillMatching, setShowSkillMatching] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all open jobs and match target ID since backend has no get details endpoint
      const response = await jobService.getOpenJobs({ page: 1, limit: 100 });
      const jobList = response?.jobs || response || [];
      const targetJob = jobList.find(j => j.id === Number(jobId));

      if (!targetJob) {
        setError("Job listing not found or is no longer active.");
        return;
      }
      setJob(targetJob);

      // If user is authenticated, check if they have already applied to this job
      if (isAuthenticated) {
        setResumeLoading(true);
        const [appHistory, resumeData] = await Promise.all([
          applicationService.getApplicationHistory({ page: 1, limit: 100 }),
          resumeService.getResumeMetadata().catch(() => null)
        ]);

        const applied = (appHistory?.items || []).some(
          app => app.job?.id === Number(jobId) && app.status?.toLowerCase() !== 'withdrawn'
        );
        setHasApplied(applied);

        // Check if resume is uploaded
        if (resumeData && resumeData.file_name) {
          setHasResume(true);
        } else {
          setHasResume(false);
        }
      }
    } catch (err) {
      console.error("Fetch job details error:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
      setResumeLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId, isAuthenticated]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Redirect to login page and return back to details after success
      navigate(`/login?redirect=/jobs/${jobId}`);
      return;
    }

    if (hasApplied) return;

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

      // Trigger notification process in a non-blocking background thread
      notificationService.notifyApplicationSubmitted(appResult.id, job, user)
        .catch(err => console.error("Notification submission trigger error:", err));
    } catch (err) {
      console.error("Apply job error:", err);
      setError(err?.response?.data?.detail || "Failed to submit application. Please try again.");
      setIsConfirmOpen(false);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-lg w-24"></div>
        <SkeletonProfile />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-full">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Job Details Unavailable</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
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

  const typeLabel = formatJobType(job.job_type);
  const modeLabel = formatWorkMode(job.work_mode);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to listings
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <Card className="p-6 md:p-8 border border-slate-100 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start gap-4 min-w-0">
          {/* Company logo initials */}
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 border border-blue-100/50 shadow-inner">
            {(job.company?.name || 'C')[0]}
          </div>

          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug truncate" title={job.title}>
              {job.title}
            </h1>
            <p className="text-base font-bold text-slate-500 truncate" title={job.company?.name}>
              {job.company?.name}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-xs font-semibold pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
              <span>•</span>
              <span className="capitalize">{typeLabel}</span>
              <span>•</span>
              <span className="capitalize">{modeLabel}</span>
            </div>
          </div>
        </div>

        {/* Apply Trigger button */}
        <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0 flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
          {isAuthenticated && user?.role === ROLES.JOB_SEEKER && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowMatchScore(true)}
                className="w-full md:w-auto rounded-2xl font-black py-4 px-8 tracking-wider shadow-sm flex items-center justify-center gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50/50"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-blue-500 animate-pulse" /> Check AI Match Score
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowSkillMatching(true)}
                className="w-full md:w-auto rounded-2xl font-black py-4 px-8 tracking-wider shadow-sm flex items-center justify-center gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50/50"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-purple-500 animate-pulse" /> Check Skill Alignment
              </Button>
            </>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleApplyClick}
            disabled={hasApplied || applyLoading || resumeLoading}
            className={`w-full md:w-auto rounded-2xl font-black py-4 px-8 tracking-wider shadow-lg ${
              hasApplied ? 'bg-emerald-600 hover:bg-emerald-600 cursor-not-allowed opacity-90' : ''
            }`}
          >
            {resumeLoading ? (
              <Spinner size="sm" className="mr-2" />
            ) : hasApplied ? (
              <span className="flex items-center justify-center gap-1.5">
                <UserCheck className="w-5 h-5 shrink-0 text-white" /> Already Applied
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Send className="w-4 h-4 shrink-0 text-white" /> Apply Now
              </span>
            )}
          </Button>
        </div>
      </Card>

      {/* Main Details grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Description, details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 md:p-8 border border-slate-100 bg-white shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-3">Job Description</h2>
              <p className="text-slate-600 text-sm leading-relaxed pt-3 whitespace-pre-line">
                {job.description || 'No description provided.'}
              </p>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <span 
                      key={skill.id} 
                      className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5"
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Key Metadata overview card */}
        <div className="space-y-6">
          <Card className="p-6 border border-slate-100 bg-white shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-50 pb-2">Overview Details</h3>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Posted</span>
                  <span className="text-slate-700">{formatDate(job.created_at)}</span>
                </div>
              </div>

              {job.application_deadline && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Deadline</span>
                    <span className="text-slate-700">{formatDate(job.application_deadline)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience Level</span>
                  <span className="text-slate-700 capitalize">{job.experience_level?.replace('_', ' ')}</span>
                </div>
              </div>

              {job.salary_min !== undefined && job.salary_min !== null && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offered Salary</span>
                    <span className="text-emerald-600 font-bold">
                      {formatSalary(job.salary_min)} {job.salary_max ? `- ${formatSalary(job.salary_max)}` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <SimilarJobs jobId={job.id} />
        </div>

      </div>

      {/* Apply Confirmation Modal Dialog */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Apply for Job opening"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to apply for the <strong>{job?.title}</strong> role at <strong>{job?.company?.name}</strong>?
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs">
              <span className="block font-bold text-slate-600">Selected Resume Credentials</span>
              <span className="text-slate-400 font-medium">Your profile resume will be attached to this application.</span>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 pt-4">
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

      {/* Resume Missing Dialog Overlay */}
      <Modal
        isOpen={isResumeWarningOpen}
        onClose={() => setIsResumeWarningOpen(false)}
        title="Resume Credentials Required"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">No Resume Profile Found</span>
              <span className="text-xs text-amber-600/90 leading-relaxed font-medium">
                Please upload your resume before submitting applications to recruiters.
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 pt-4">
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

      {/* Success Modal Overlay */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Application Submitted!"
      >
        <div className="space-y-5 text-center py-4">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">Successfully Applied!</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Your credentials have been successfully delivered to the hiring team at <strong>{job?.company?.name}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-slate-100">
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
