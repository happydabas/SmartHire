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
  FolderDot
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { applicationService } from '@/services/applications/applicationService';
import { formatDate } from '@/utils/formatDate';

// Reusable UI components
import ProfileCard from '@/components/ui/ProfileCard';
import ResumeViewer from '@/components/ui/ResumeViewer';
import Timeline from '@/components/ui/Timeline';
import NotesCard from '@/components/ui/NotesCard';
import StatusDropdown from '@/components/ui/StatusDropdown';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import Card from '@/components/ui/Card';

export function ApplicantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  // Data states
  const [application, setApplication] = useState(null);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Confirmation dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStatusVal, setConfirmStatusVal] = useState('');

  // Fetch all details on mount / ID change
  const loadAllDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch application details
      const appData = await applicationService.getApplicationDetails(id);
      setApplication(appData);

      // Fetch recruiter notes
      const notesData = await applicationService.getNotes(id);
      setNotes(notesData);
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

  // 1. Status Update Confirmation
  const handleStatusChangeTrigger = (newStatus) => {
    setConfirmStatusVal(newStatus);
    setConfirmOpen(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      setStatusLoading(true);
      setConfirmOpen(false);
      await applicationService.updateApplicationStatus(id, confirmStatusVal);
      
      triggerToast('Application status updated successfully!', 'success');
      
      // Reload details to reflect new status
      await loadAllDetails();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update status.', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  // 2. Notes Event Handlers
  const handleAddNote = async (content) => {
    try {
      setNotesLoading(true);
      const recruiterName = user?.name || 'Recruiter';
      const recruiterId = user?.id || 999;
      
      const newNote = await applicationService.addNote(id, content, recruiterName, recruiterId);
      setNotes(prev => [newNote, ...prev]);
      triggerToast('Note added successfully.', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to log note.', 'error');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleEditNote = async (noteId, newContent) => {
    try {
      setNotesLoading(true);
      const updated = await applicationService.updateNote(id, noteId, newContent);
      setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
      triggerToast('Note updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update note.', 'error');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setNotesLoading(true);
      await applicationService.deleteNote(id, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      triggerToast('Note deleted successfully.', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to delete note.', 'error');
    } finally {
      setNotesLoading(false);
    }
  };

  // 3. Resume download
  const handleDownloadResume = async () => {
    if (!application?.resume) return;
    try {
      setDownloadLoading(true);
      const name = application.resume.resume_file_name || 'resume.pdf';
      await applicationService.downloadResume(name);
      triggerToast('Resume download completed.', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to download resume file.', 'error');
    } finally {
      setDownloadLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toUpperCase();
    if (s === 'APPLIED') return 'primary';
    if (s === 'SCREENING') return 'warning';
    if (s === 'INTERVIEW') return 'info';
    if (s === 'SELECTED') return 'success';
    if (s === 'REJECTED') return 'danger';
    return 'neutral';
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const s = status.toUpperCase();
    if (s === 'APPLIED') return 'Applied';
    if (s === 'SCREENING') return 'Screening';
    if (s === 'INTERVIEW') return 'Interview';
    if (s === 'SELECTED') return 'Selected';
    if (s === 'REJECTED') return 'Rejected';
    if (s === 'WITHDRAWN') return 'Withdrawn';
    return status;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Retrieving applicant files...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-100/50">
        <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Record Unavailable</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{error || 'This application profile cannot be found.'}</p>
        <Button variant="secondary" size="md" onClick={() => navigate('/recruiter/applicants')} className="w-full mt-2 rounded-xl">
          Return to Applicants List
        </Button>
      </div>
    );
  }

  const candidate = application.candidate || {};
  const resume = application.resume;
  const matchScore = application.matchScore || 70;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      {/* Toast notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Status Transition"
        message={`Are you sure you want to change this applicant's recruitment status to ${getStatusLabel(confirmStatusVal)}?`}
        onConfirm={confirmStatusUpdate}
        confirmText="Confirm Change"
      />

      {/* Back Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/recruiter/applicants')}
          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
          title="Back to Applicants list"
          disabled={statusLoading}
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Applicant Portfolio</h1>
          <p className="text-slate-500 text-sm mt-1">Review qualifications, inspect match indexes, and logs recruiter comments.</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Candidate Portfolio details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. Basic Profile */}
          <ProfileCard
            profile={candidate.profile || {}}
            name={candidate.name}
            email={candidate.email}
            phone={candidate.profile?.phone_number}
          />

          {/* B. Resume Viewer */}
          <ResumeViewer
            resume={resume}
            onDownload={handleDownloadResume}
            downloadLoading={downloadLoading}
          />

          {/* C & D. Education & Experience Timeline Card */}
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Professional Qualifications Timeline</h3>
            </div>
            
            <div className="space-y-6">
              {/* Experience Subtitle */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 select-none">Work History</span>
                <Timeline items={application.experience} type="experience" />
              </div>

              {/* Education Subtitle */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 select-none">Education Background</span>
                <Timeline items={application.education} type="education" />
              </div>
            </div>
          </Card>

          {/* E, F, G. Skills, Projects & Certifications */}
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Skills & Additional Portfolios</h3>
            </div>

            <div className="space-y-6">
              {/* Skills Chips */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 select-none">Skills Summary</span>
                {application.skills && application.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {application.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-default"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No skills listed on profile.</p>
                )}
              </div>

              {/* Projects List */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 select-none">Personal & Professional Projects</span>
                {application.projects && application.projects.length > 0 ? (
                  <div className="space-y-3">
                    {application.projects.map((project) => (
                      <div key={project.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-1 hover:bg-slate-50 transition-colors">
                        <h4 className="font-extrabold text-slate-700 text-xs flex items-center gap-1.5">
                          <FolderDot className="w-4 h-4 text-slate-400" />
                          <span>{project.title}</span>
                        </h4>
                        <p className="text-xs text-slate-400 font-medium pl-5.5 leading-relaxed">{project.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No projects listed on profile.</p>
                )}
              </div>

              {/* Certifications List */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 select-none">Certifications</span>
                {application.certifications && application.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {application.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between text-xs font-semibold p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                        <div className="space-y-0.5">
                          <span className="text-slate-800 font-bold block">{cert.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">{cert.issuer}</span>
                        </div>
                        {cert.issue_date && (
                          <span className="text-[10px] text-slate-400 font-medium bg-slate-50 border px-2 py-0.5 rounded-lg shrink-0">
                            Issued {formatDate(cert.issue_date)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No certifications listed.</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN - Application Summary, Status and notes */}
        <div className="space-y-6">
          
          {/* Application Summary */}
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Application Status summary</h3>
            </div>

            {/* Match score display */}
            <div className="flex items-center gap-4.5 bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-bold text-blue-400 uppercase tracking-wide">AI Match Score Match</span>
                <h3 className="text-2xl font-black text-blue-700 tracking-tight">{matchScore}%</h3>
              </div>
            </div>

            {/* Details Fields */}
            <div className="space-y-3.5 pt-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">Applied Job</span>
                <span className="text-slate-800 text-right truncate max-w-[150px]" title={application.job?.title}>{application.job?.title}</span>
              </div>
              
              <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">Date Applied</span>
                <span className="text-slate-700">{formatDate(application.applied_at || application.created_at)}</span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">Current Status</span>
                <Badge variant={getStatusBadgeVariant(application.status)} className="capitalize text-[10px] px-2.5">
                  {getStatusLabel(application.status)}
                </Badge>
              </div>
            </div>

            {/* Change Status Dropdown */}
            <div className="border-t border-slate-100 pt-5 mt-2">
              <StatusDropdown
                currentStatus={application.status}
                onChange={handleStatusChangeTrigger}
                isLoading={statusLoading}
              />
            </div>
          </Card>

          {/* Recruiter Notes Card */}
          <NotesCard
            notes={notes}
            onAdd={handleAddNote}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            currentRecruiterId={user?.id || 999}
            isLoading={notesLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default ApplicantDetails;
