import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  Award,
  AlertCircle,
  Clock,
  ExternalLink,
  GraduationCap,
  Inbox,
  Layout,
  PlusCircle,
  FileCheck,
  ChevronRight,
  BookOpen,
  FolderDot,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Download,
  Eye,
  User,
  Code2,
  Check,
  BarChart3
} from 'lucide-react';
import ApplicantMatchScore from '@/pages/recruiter/ApplicantMatchScore';
import ApplicantSkillMatching from '@/pages/recruiter/ApplicantSkillMatching';
import { useAuth } from '@/hooks/useAuth';
import { applicationService } from '@/services/applications/applicationService';
import { formatDate } from '@/utils/formatDate';

// Reusable UI components
import ResumeViewer from '@/components/ui/ResumeViewer';
import Modal from '@/components/ui/Modal';
import RecruiterNotes from '@/components/ats/RecruiterNotes';
import StageBadge from '@/components/ats/StageBadge';
import StageSelector from '@/components/ats/StageSelector';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import SkeletonProfile from '@/components/common/SkeletonProfile';
import { notificationService } from '@/services/notificationService';

// Helper to format pipeline dates cleanly (e.g. Aug 14, 2026 • 11:20 AM)
const formatPipelineDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} • ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

// Vertical Hiring Pipeline Timeline matching exact design screenshot
function VerticalPipelineTimeline({ currentStage, history = [], appliedAt }) {
  const normalizedCurrent = (currentStage || 'applied').toLowerCase();
  
  const pipelineStages = [
    { key: 'applied', label: 'Applied', defaultSub: 'Application submitted by candidate' },
    { key: 'screening', label: 'Screening', defaultSub: 'Screening candidate qualifications' },
    { key: 'interview', label: 'Technical Interview', defaultSub: 'Technical round evaluation' },
    { key: 'selected', label: 'HR Interview', defaultSub: 'Final interview & selection' },
    { key: 'offer', label: 'Offer', defaultSub: 'Offer letter extended' },
    { key: 'hired', label: 'Hired', defaultSub: 'Candidate hired' },
  ];

  const stageKeys = pipelineStages.map(s => s.key);
  const currentIndex = stageKeys.indexOf(normalizedCurrent) !== -1 ? stageKeys.indexOf(normalizedCurrent) : 0;

  return (
    <div className="space-y-6">
      {pipelineStages.map((stage, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isUpcoming = idx > currentIndex;

        const historyLog = history.find(h => (h.status || '').toLowerCase() === stage.key);
        const timestamp = historyLog?.updated_at || (stage.key === 'applied' ? appliedAt : null);
        const formattedTime = timestamp ? formatPipelineDate(timestamp) : '';

        let subText = stage.defaultSub;
        if (historyLog?.recruiter_name) {
          subText = `Moved by ${historyLog.recruiter_name}`;
        } else if (stage.key === 'applied') {
          subText = 'Application submitted by candidate';
        } else if (isUpcoming) {
          subText = stage.key === 'interview' || stage.key === 'selected' ? 'Not scheduled yet' : 'Pending';
        }

        return (
          <div key={stage.key} className="flex items-start gap-4 relative">
            {/* Timeline Vertical Connecting Line */}
            {idx < pipelineStages.length - 1 && (
              <div 
                className={`absolute left-[11px] top-6 bottom-0 w-0.5 z-0 ${
                  idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            )}

            {/* Circle Node Container */}
            <div className="z-10 shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : isCurrent ? (
                <div className="w-6 h-6 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950 flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" />
              )}
            </div>

            {/* Stage Text Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`text-xs font-black ${isCurrent ? 'text-slate-900 dark:text-white' : (isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500')}`}>
                  {stage.label}
                </h4>
                {isCurrent && (
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                    Current Stage
                  </span>
                )}
              </div>

              {formattedTime && (
                <p className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500">
                  {formattedTime}
                </p>
              )}

              <p className={`text-xs font-semibold ${isCurrent || isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                {subText}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ApplicantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Data states
  const [application, setApplication] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Interactive views & Modals
  const [showMatchScore, setShowMatchScore] = useState(false);
  const [showSkillMatching, setShowSkillMatching] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Fetch all details on mount / ID change
  const loadAllDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const appData = await applicationService.getApplicationDetails(id);
      const historyData = await applicationService.getApplicationStatusHistory(id);
      setApplication(appData);
      setStatusHistory(historyData || []);
    } catch (err) {
      console.error('Error fetching applicant details:', err);
      setError('Failed to fetch candidate record. Make sure the ID exists or you have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDetails();
  }, [id]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const triggerStatusChangeNotifications = (newStage, appData) => {
    if (!appData) return;
    try {
      if (newStage === 'SCREENING') {
        notificationService.notifyApplicationScreening(appData.id, appData.job, appData.candidate);
      } else if (newStage === 'INTERVIEW') {
        notificationService.notifyInterviewScheduled(appData.id, appData.job, appData.candidate);
      } else if (newStage === 'SELECTED') {
        notificationService.notifyApplicationSelected(appData.id, appData.job, appData.candidate);
      } else if (newStage === 'REJECTED') {
        notificationService.notifyApplicationRejected(appData.id, appData.job, appData.candidate);
      }
    } catch (err) {
      console.warn('Failed to dispatch status notifications:', err);
    }
  };

  // Download Resume handler
  const handleDownloadResume = async () => {
    try {
      setDownloadLoading(true);
      await applicationService.downloadResumeFile(
        application?.id,
        application?.resume?.file_name || 'candidate_resume.pdf'
      );
      triggerToast('Resume downloaded successfully!');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to download resume file.', 'error');
    } finally {
      setDownloadLoading(false);
    }
  };

  if (showMatchScore && application) {
    return (
      <ApplicantMatchScore
        jobId={application.job?.id}
        candidateId={application.candidate?.id}
        candidateName={application.candidate?.name}
        jobTitle={application.job?.title}
        onBack={() => setShowMatchScore(false)}
      />
    );
  }

  if (showSkillMatching && application) {
    return (
      <ApplicantSkillMatching
        jobId={application.job?.id}
        candidateId={application.candidate?.id}
        candidateName={application.candidate?.name}
        jobTitle={application.job?.title}
        onBack={() => setShowSkillMatching(false)}
      />
    );
  }

  if (loading) {
    return <SkeletonProfile />;
  }

  if (error || !application) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4 bg-white dark:bg-[#15161e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-lg">
        <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Record Unavailable</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{error || 'This application profile cannot be found.'}</p>
        <Button variant="secondary" size="md" onClick={() => navigate('/recruiter/applicants')} className="w-full mt-2 rounded-xl">
          Return to Applicants List
        </Button>
      </div>
    );
  }

  const candidate = application.candidate || {};
  const profile = candidate.profile || {};
  const resume = application.resume;
  const matchScore = application.matchScore || 70;

  const candidateLocation = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || profile.address || 'Location not specified';
  const displayPhone = profile.phone_number || candidate.phone || 'Not specified';
  const displayEmail = candidate.email || 'Not specified';

  const techSkills = application.skills?.filter(s => !s.category || s.category.toLowerCase().includes('tech')) || application.skills || [];
  const softSkills = application.skills?.filter(s => s.category && s.category.toLowerCase().includes('soft')) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative animate-in fade-in duration-200">
      {/* Toast notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Top Header Navigation */}
      <div className="pt-2 pb-1 space-y-3">
        <div>
          <button
            onClick={() => navigate('/recruiter/applicants')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Back to Applications</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Application Portfolio
          </h1>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold hidden sm:inline">
            View candidate details, track progress and manage the hiring pipeline
          </span>
        </div>
      </div>

      {/* Top Candidate Header Card */}
      <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <Avatar
              src={profile.profile_picture || profile.profile_photo_url}
              name={candidate.name}
              size="lg"
              className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full border-2 border-slate-100 dark:border-slate-800 shadow-sm"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {candidate.name}
                </h2>
                <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  <span>{matchScore}% Match</span>
                  <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">Soon</span>
                </span>
                <span className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Top Candidate</span>
                </span>
              </div>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {profile.professional_headline || application.job?.title || 'Software Candidate'}
              </p>

              {/* Inline Metadata: Email, Phone, Location */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{displayEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{displayPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{candidateLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Top Right of Card */}
          <div className="flex items-center justify-center sm:justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadResume}
              isLoading={downloadLoading}
              className="rounded-2xl font-black text-xs py-2.5 px-4 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Download Resume</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsResumeModalOpen(true)}
              className="rounded-2xl font-black text-xs py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Eye className="w-4 h-4" />
              <span>View Resume</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Candidate Portfolio Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Personal Information Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-xs font-semibold">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Full Name</span>
                <span className="text-slate-900 dark:text-white font-bold block mt-0.5">{candidate.name}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Email</span>
                <span className="text-slate-900 dark:text-white font-bold block mt-0.5 truncate">{displayEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Phone</span>
                <span className="text-slate-900 dark:text-white font-bold block mt-0.5">{displayPhone}</span>
              </div>

              <div className="pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Location</span>
                <span className="text-slate-900 dark:text-white font-bold block mt-0.5">{candidateLocation}</span>
              </div>
              <div className="pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">LinkedIn</span>
                {profile.linkedin_url ? (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold block mt-0.5 truncate flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>{profile.linkedin_url.replace(/^https?:\/\//, '')}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic block mt-0.5">Not provided</span>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Portfolio</span>
                {profile.portfolio_url ? (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold block mt-0.5 truncate flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>{profile.portfolio_url.replace(/^https?:\/\//, '')}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic block mt-0.5">Not provided</span>
                )}
              </div>
            </div>
          </Card>

          {/* 2. Skills Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Skills</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Technical Skills</span>
                {techSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {techSkills.map((s, idx) => (
                      <span
                        key={s.id || idx}
                        className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 px-3 py-1.5 rounded-xl"
                      >
                        {s.skill_name || s.name || s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic font-semibold">No technical skills added.</p>
                )}
              </div>

              {softSkills.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Soft Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((s, idx) => (
                      <span
                        key={s.id || idx}
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl"
                      >
                        {s.skill_name || s.name || s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 3. Education Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Education</h3>
            </div>

            <div className="space-y-4">
              {application.education && application.education.length > 0 ? (
                application.education.map((edu, idx) => (
                  <div key={edu.id || idx} className="flex justify-between items-start text-xs font-semibold p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{edu.degree}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold">{edu.institution}</p>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold">
                        {edu.start_year && edu.end_year ? `${edu.start_year} - ${edu.end_year}` : 'Completed'}
                      </span>
                      {edu.grade && (
                        <span className="inline-block bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black px-2 py-0.5 rounded-lg text-[10px]">
                          Grade: {edu.grade}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic font-semibold">No education details listed.</p>
              )}
            </div>
          </Card>

          {/* 4. Experience Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Experience</h3>
            </div>

            <div className="space-y-4">
              {application.experience && application.experience.length > 0 ? (
                application.experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{exp.job_title}</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{exp.company_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold">
                          {exp.start_date ? `${formatDate(exp.start_date)} - ${exp.is_current ? 'Present' : formatDate(exp.end_date)}` : ''}
                        </span>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic font-semibold">No work experience listed.</p>
              )}
            </div>
          </Card>

          {/* 5. Projects Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FolderDot className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Projects</h3>
            </div>

            {application.projects && application.projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {application.projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{proj.title}</h4>
                        {proj.project_url && (
                          <a href={proj.project_url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{proj.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic font-semibold">No projects listed.</p>
            )}
          </Card>

          {/* 6. Certifications Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Certifications</h3>
            </div>

            {application.certifications && application.certifications.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {application.certifications.map((cert, idx) => (
                  <span
                    key={cert.id || idx}
                    className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 px-3.5 py-1.5 rounded-xl"
                  >
                    {cert.name || cert}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic font-semibold">No certifications listed.</p>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN - Hiring Pipeline, Application Details, AI Analysis, Recruiter Notes */}
        <div className="space-y-6">
          
          {/* 1. Hiring Pipeline Card (Vertical Timeline matching exact design screenshot) */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Hiring Pipeline</h3>
            </div>

            {/* Vertical timeline of pipeline stages */}
            <VerticalPipelineTimeline
              currentStage={application.status}
              history={statusHistory}
              appliedAt={application.applied_at || application.created_at}
            />

            {/* Stage Selector Dropdown + Update Stage Button */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <StageSelector
                applicationId={id || application?.id}
                currentStage={application.status}
                onUpdateSuccess={async (newStage) => {
                  triggerStatusChangeNotifications(newStage, application);
                  await loadAllDetails();
                }}
              />
            </div>
          </Card>

          {/* 2. Application Details Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Application Details</h3>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Applied On</span>
                <span className="text-slate-900 dark:text-white font-bold">{formatDate(application.applied_at || application.created_at)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Job Title</span>
                <span className="text-slate-900 dark:text-white font-bold truncate max-w-[150px]">{application.job?.title || 'Software Job'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Job ID</span>
                <span className="text-slate-900 dark:text-white font-bold">JOB-{application.job?.id || '2026-014'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Job Location</span>
                <span className="text-slate-900 dark:text-white font-bold">{application.job?.location || 'Bangalore, India'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Job Type</span>
                <span className="text-slate-900 dark:text-white font-bold">{application.job?.job_type || 'Full-time • Onsite'}</span>
              </div>
            </div>
          </Card>

          {/* 3. AI Analysis Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">AI Analysis</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => triggerToast('Match Score feature is coming soon!', 'info')}
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-all space-y-1 relative group cursor-pointer hover:border-amber-400"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Calculate Match Score</span>
                  </div>
                  <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">Soon</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Analyze resume vs job (Coming Soon)</p>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Skill Alignment feature is coming soon!', 'info')}
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-all space-y-1 relative group cursor-pointer hover:border-amber-400"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs">
                    <BarChart3 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Check Skill Alignment</span>
                  </div>
                  <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">Soon</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">View matched & missing skills (Coming Soon)</p>
              </button>
            </div>
          </Card>

          {/* 4. Recruiter Notes Panel */}
          <RecruiterNotes applicationId={application.id} />
        </div>
      </div>

      {/* Fullscreen PDF View Resume Modal */}
      <Modal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        title="Candidate Resume Preview"
        size="2xl"
      >
        <div className="py-2">
          <ResumeViewer
            resume={resume}
            applicationId={id || application?.id}
            onDownload={handleDownloadResume}
            downloadLoading={downloadLoading}
          />
        </div>
      </Modal>
    </div>
  );
}

export default ApplicantDetails;
