import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  HardDrive,
  GraduationCap,
  Briefcase,
  Award,
  Plus,
  Edit2,
  Calendar,
  School,
  Building2,
  MapPin,
  Brain,
  Sparkles,
  Search,
  User,
  Info,
  FolderKanban,
  FileBadge,
  Eye,
  FileCheck,
  ChevronRight,
  TrendingUp,
  X,
  PlusCircle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resumeService } from '@/services/resume/resumeService';
import { educationService } from '@/services/education/educationService';
import { experienceService } from '@/services/experience/experienceService';
import { skillsService } from '@/services/skills/skillsService';
import { profileService } from '@/services/profile/profileService';
import { projectService } from '@/services/project/projectService';
import { certificationService } from '@/services/certification/certificationService';
import { formatDate } from '@/utils/formatDate';
import { extractErrorMessage } from '@/utils/errorParser';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import Badge from '@/components/ui/Badge';
import SearchableSelect from '@/components/ui/SearchableSelect';
import SkillChip from '@/components/ui/SkillChip';
import SkeletonProfile from '@/components/common/SkeletonProfile';
import EmptyState from '@/components/common/EmptyState';

// Master skills catalog
const MASTER_SKILLS_CATALOG = [
  { id: 1, skill_name: 'React', category: 'Frontend' },
  { id: 2, skill_name: 'Angular', category: 'Frontend' },
  { id: 3, skill_name: 'Vue.js', category: 'Frontend' },
  { id: 4, skill_name: 'HTML5 & CSS3', category: 'Frontend' },
  { id: 5, skill_name: 'Tailwind CSS', category: 'Frontend' },
  { id: 6, skill_name: 'FastAPI', category: 'Backend' },
  { id: 7, skill_name: 'Node.js', category: 'Backend' },
  { id: 8, skill_name: 'Django', category: 'Backend' },
  { id: 9, skill_name: 'Flask', category: 'Backend' },
  { id: 10, skill_name: 'Express.js', category: 'Backend' },
  { id: 11, skill_name: 'PostgreSQL', category: 'Database' },
  { id: 12, skill_name: 'MongoDB', category: 'Database' },
  { id: 13, skill_name: 'Redis', category: 'Database' },
  { id: 14, skill_name: 'MySQL', category: 'Database' },
  { id: 15, skill_name: 'Docker', category: 'DevOps' },
  { id: 16, skill_name: 'Kubernetes', category: 'DevOps' },
  { id: 17, skill_name: 'AWS', category: 'DevOps' },
  { id: 18, skill_name: 'Git & GitHub', category: 'DevOps' },
];

// Helper to sanitize dates for standard format YYYY-MM-DD
function cleanDate(dateStr) {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {}
  const match = dateStr.match(/\b(19|20)\d{2}\b/);
  if (match) {
    return `${match[0]}-01-01`;
  }
  return null;
}

// AlertBanner helper
function AlertBanner({ type, message }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div
      className={`flex items-center gap-3 p-4 text-sm font-medium rounded-2xl animate-fadeIn ${
        isError
          ? 'text-red-700 bg-red-50 border border-red-200'
          : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
      ) : (
        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
      )}
      <span>{message}</span>
    </div>
  );
}

export function ResumePage() {
  const { user } = useAuth();

  // Unified loading & data states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [globalSuccess, setGlobalSuccess] = useState(null);

  // Entities records
  const [resumeMetadata, setResumeMetadata] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [educationRecords, setEducationRecords] = useState([]);
  const [experienceRecords, setExperienceRecords] = useState([]);
  const [skillsRecords, setSkillsRecords] = useState([]);
  const [projectsRecords, setProjectsRecords] = useState([]);
  const [certificationsRecords, setCertificationsRecords] = useState([]);

  // File Upload states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isDeleteResumeModalOpen, setIsDeleteResumeModalOpen] = useState(false);

  // Modals state managers
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isProfSummaryOpen, setIsProfSummaryOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isCertificationOpen, setIsCertificationOpen] = useState(false);

  // Deletion modals state
  const [deletingRecord, setDeletingRecord] = useState(null); // { type, id }
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Edit / Form Fields States
  const [editingId, setEditingId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [personalForm, setPersonalForm] = useState({ name: '', phone: '', dob: '', gender: '', address: '', city: '', state: '', country: '', headline: '' });
  const [summaryForm, setSummaryForm] = useState({ headline: '', bio: '' });
  const [educationForm, setEducationForm] = useState({ degree: '', field_of_study: '', institution_name: '', start_date: '', end_date: '', currently_studying: false, grade: '', description: '' });
  const [experienceForm, setExperienceForm] = useState({ job_title: '', company_name: '', employment_type: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' });
  const [skillForm, setSkillForm] = useState({ skill_id: '', proficiency_level: 'Intermediate', years_of_experience: 1 });
  const [projectForm, setProjectForm] = useState({ project_name: '', description: '', technologies_used: '', github_link: '', live_demo_link: '' });
  const [certificationForm, setCertificationForm] = useState({ certification_name: '', organization: '', issue_date: '', expiry_date: '', credential_url: '' });

  // AI Resume tools states
  const [isParserOpen, setIsParserOpen] = useState(false);
  const [parserStep, setParserStep] = useState(1); // 1 = Upload, 2 = Progress, 3 = Confirm Preview
  const [parsedData, setParsedData] = useState(null);
  const [parserProgressText, setParserProgressText] = useState('Initializing AI model...');

  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Retrieve all unified profile details
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setGlobalError(null);

      // Resume metadata
      try {
        const data = await resumeService.getResumeMetadata();
        setResumeMetadata(data);
      } catch (err) {
        if (err.response?.status === 404) setResumeMetadata(null);
      }

      // Profile details
      try {
        const prof = await profileService.getProfile();
        setProfileData(prof);
      } catch (err) {
        if (err.response?.status === 404) setProfileData(null);
      }

      // Education
      try {
        const edu = await educationService.getEducationList();
        setEducationRecords(edu || []);
      } catch {}

      // Experience
      try {
        const exp = await experienceService.getExperienceList();
        const sorted = (exp || []).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        setExperienceRecords(sorted);
      } catch {}

      // Skills
      try {
        const associated = await skillsService.getSkillsList();
        const loaded = (associated || []).map(skill => {
          const key = `skill_details_${user?.id}_${skill.id}`;
          const saved = localStorage.getItem(key);
          const parsed = saved ? JSON.parse(saved) : { proficiency_level: 'Intermediate', years_of_experience: 1 };
          return { ...skill, ...parsed };
        });
        setSkillsRecords(loaded);
      } catch {}

      // Mock LocalStorage services
      if (user?.id) {
        const proj = await projectService.getProjectsList(user.id);
        setProjectsRecords(proj || []);
        const cert = await certificationService.getCertificationsList(user.id);
        setCertificationsRecords(cert || []);
      }
    } catch {
      setGlobalError('Failed to fetch resume settings portfolio. Please refresh page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAllData();
    }
  }, [user]);

  // Alert dismiss timeouts
  useEffect(() => {
    if (globalSuccess) {
      const t = setTimeout(() => setGlobalSuccess(null), 5000);
      return () => clearTimeout(t);
    }
  }, [globalSuccess]);

  // Size formatter helper
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle manual resume file upload/replace
  const handleResumeFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith('.pdf') && !nameLower.endsWith('.docx')) {
      setGlobalError('Unsupported file type. Only PDF and DOCX documents are accepted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setGlobalError('File size exceeds the 10MB limit.');
      return;
    }

    setGlobalError(null);
    setGlobalSuccess(null);
    setIsUploading(true);
    setUploadProgress(15);

    // Simulate progress bar
    const interval = setInterval(() => {
      setUploadProgress(prev => (prev >= 85 ? 85 : prev + 15));
    }, 150);

    try {
      if (resumeMetadata) {
        await resumeService.updateResume(file);
        setGlobalSuccess('Resume replaced successfully!');
      } else {
        await resumeService.uploadResume(file);
        setGlobalSuccess('Resume uploaded successfully!');
      }
      setUploadProgress(100);
      clearInterval(interval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        fetchAllData();
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      setGlobalError(extractErrorMessage(err) || 'Failed to complete resume upload.');
    }
  };

  const handleDownloadResume = async () => {
    if (!resumeMetadata) return;
    try {
      await resumeService.downloadResume(resumeMetadata.file_name || 'resume.pdf');
      setGlobalSuccess('Download started.');
    } catch {
      setGlobalError('Could not process download request.');
    }
  };

  const handleDeleteResume = async () => {
    try {
      setActionLoading(true);
      await resumeService.deleteResume();
      setResumeMetadata(null);
      setIsDeleteResumeModalOpen(false);
      setGlobalSuccess('Resume file deleted successfully.');
      fetchAllData();
    } catch {
      setGlobalError('Failed to remove resume record.');
    } finally {
      setActionLoading(false);
    }
  };

  // Generic Deletion confirmations
  const handleOpenDeleteConfirm = (type, id) => {
    setDeletingRecord({ type, id });
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmExecute = async () => {
    if (!deletingRecord) return;
    const { type, id } = deletingRecord;
    try {
      setActionLoading(true);
      setGlobalError(null);
      if (type === 'education') {
        await educationService.deleteEducation(id);
        setGlobalSuccess('Academic credential deleted.');
      } else if (type === 'experience') {
        await experienceService.deleteExperience(id);
        setGlobalSuccess('Employment history removed.');
      } else if (type === 'skill') {
        await skillsService.deleteSkill(id);
        localStorage.removeItem(`skill_details_${user?.id}_${id}`);
        setGlobalSuccess('Skill record deleted.');
      } else if (type === 'project') {
        await projectService.deleteProject(user?.id, id);
        setGlobalSuccess('Portfolio project deleted.');
      } else if (type === 'certification') {
        await certificationService.deleteCertification(user?.id, id);
        setGlobalSuccess('Certification credential deleted.');
      }
      setIsDeleteConfirmOpen(false);
      setDeletingRecord(null);
      await fetchAllData();
    } catch {
      setGlobalError(`Failed to delete selected ${type} entry.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Form submit handles
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setGlobalError(null);
      const payload = {
        phone: personalForm.phone.trim(),
        dob: cleanDate(personalForm.dob),
        gender: personalForm.gender,
        address: personalForm.address.trim(),
        city: personalForm.city.trim(),
        state: personalForm.state.trim(),
        country: personalForm.country.trim(),
        headline: personalForm.headline.trim(),
        bio: profileData?.bio || ''
      };

      if (profileData) {
        await profileService.updateProfile(payload);
        setGlobalSuccess('Personal Information updated successfully!');
      } else {
        await profileService.createProfile(payload);
        setGlobalSuccess('Personal Profile created successfully!');
      }
      setIsPersonalInfoOpen(false);
      fetchAllData();
    } catch {
      setGlobalError('Failed to update personal information details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProfSummarySubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setGlobalError(null);
      const payload = {
        phone: profileData?.phone || '',
        dob: profileData?.dob || null,
        gender: profileData?.gender || 'Other',
        address: profileData?.address || '',
        city: profileData?.city || '',
        state: profileData?.state || '',
        country: profileData?.country || '',
        headline: summaryForm.headline.trim(),
        bio: summaryForm.bio.trim()
      };

      if (profileData) {
        await profileService.updateProfile(payload);
        setGlobalSuccess('Professional Summary updated successfully!');
      } else {
        await profileService.createProfile(payload);
        setGlobalSuccess('Professional Summary initialized successfully!');
      }
      setIsProfSummaryOpen(false);
      fetchAllData();
    } catch {
      setGlobalError('Failed to save summary credentials.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEducationSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!educationForm.degree.trim()) errors.degree = 'Required';
    if (!educationForm.field_of_study.trim()) errors.field_of_study = 'Required';
    if (!educationForm.institution_name.trim()) errors.institution_name = 'Required';
    if (!educationForm.start_date) errors.start_date = 'Required';
    if (!educationForm.currently_studying && !educationForm.end_date) errors.end_date = 'Required';
    if (educationForm.start_date && educationForm.end_date && new Date(educationForm.start_date) >= new Date(educationForm.end_date)) {
      errors.end_date = 'End Date must be after Start Date';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        degree: educationForm.degree.trim(),
        field_of_study: educationForm.field_of_study.trim(),
        institution_name: educationForm.institution_name.trim(),
        start_date: educationForm.start_date,
        end_date: educationForm.currently_studying ? null : educationForm.end_date,
        grade: educationForm.grade.trim() || null,
        description: educationForm.description.trim() || null
      };

      if (editingId) {
        await educationService.updateEducation(editingId, payload);
        setGlobalSuccess('Education entry updated!');
      } else {
        await educationService.createEducation(payload);
        setGlobalSuccess('Education credential added!');
      }
      setIsEducationOpen(false);
      fetchAllData();
    } catch {
      setGlobalError('Failed to save education credential.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!experienceForm.job_title.trim()) errors.job_title = 'Required';
    if (!experienceForm.company_name.trim()) errors.company_name = 'Required';
    if (!experienceForm.start_date) errors.start_date = 'Required';
    if (!experienceForm.currently_working && !experienceForm.end_date) errors.end_date = 'Required';
    if (experienceForm.start_date && experienceForm.end_date && new Date(experienceForm.start_date) >= new Date(experienceForm.end_date)) {
      errors.end_date = 'End Date must be after Start Date';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        job_title: experienceForm.job_title.trim(),
        company_name: experienceForm.company_name.trim(),
        employment_type: experienceForm.employment_type || null,
        location: experienceForm.location.trim() || null,
        start_date: experienceForm.start_date,
        end_date: experienceForm.currently_working ? null : experienceForm.end_date,
        currently_working: experienceForm.currently_working,
        description: experienceForm.description.trim() || ''
      };

      if (editingId) {
        await experienceService.updateExperience(editingId, payload);
        setGlobalSuccess('Work experience updated!');
      } else {
        await experienceService.createExperience(payload);
        setGlobalSuccess('Work experience added!');
      }
      setIsExperienceOpen(false);
      fetchAllData();
    } catch {
      setGlobalError('Failed to save experience details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    if (!skillForm.skill_id) {
      setFieldErrors({ skill_id: 'Please select a skill' });
      return;
    }
    if (!editingId && skillsRecords.some(s => s.id === Number(skillForm.skill_id))) {
      setFieldErrors({ skill_id: 'Skill is already associated with your profile' });
      return;
    }

    try {
      setActionLoading(true);
      const skillId = Number(skillForm.skill_id);
      if (!editingId) {
        await skillsService.addSkill(skillId);
      }
      localStorage.setItem(`skill_details_${user?.id}_${skillId}`, JSON.stringify({
        proficiency_level: skillForm.proficiency_level,
        years_of_experience: Number(skillForm.years_of_experience)
      }));
      setGlobalSuccess(editingId ? 'Skill details updated!' : 'Skill added to profile!');
      setIsSkillOpen(false);
      fetchAllData();
    } catch {
      setGlobalError('Failed to associate catalog skill.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.project_name.trim()) {
      setFieldErrors({ project_name: 'Project name is required' });
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        project_name: projectForm.project_name.trim(),
        description: projectForm.description.trim(),
        technologies_used: projectForm.technologies_used,
        github_link: projectForm.github_link.trim(),
        live_demo_link: projectForm.live_demo_link.trim()
      };

      if (editingId) {
        await projectService.updateProject(user?.id, editingId, payload);
        setGlobalSuccess('Portfolio project entry updated!');
      } else {
        await projectService.createProject(user?.id, payload);
        setGlobalSuccess('Portfolio project added!');
      }
      setIsProjectOpen(false);
      fetchAllData();
    } catch {
      setGlobalError('Failed to save project details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCertificationSubmit = async (e) => {
    e.preventDefault();
    if (!certificationForm.certification_name.trim()) {
      setFieldErrors({ certification_name: 'Name is required' });
      return;
    }
    if (!certificationForm.organization.trim()) {
      setFieldErrors({ organization: 'Issuer is required' });
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        certification_name: certificationForm.certification_name.trim(),
        organization: certificationForm.organization.trim(),
        issue_date: certificationForm.issue_date || null,
        expiry_date: certificationForm.expiry_date || null,
        credential_url: certificationForm.credential_url.trim()
      };

      if (editingId) {
        await certificationService.updateCertification(user?.id, editingId, payload);
        setGlobalSuccess('Certification credential updated!');
      } else {
        await certificationService.createCertification(user?.id, payload);
        setGlobalSuccess('Certification added to profile!');
      }
      setIsCertificationOpen(false);
      fetchAllData();
    } catch {
      setGlobalError('Failed to save certification details.');
    } finally {
      setActionLoading(false);
    }
  };

  // Forms open helpers
  const openPersonalEdit = () => {
    setPersonalForm({
      name: user?.name || '',
      phone: profileData?.phone || '',
      dob: profileData?.dob || '',
      gender: profileData?.gender || 'Other',
      address: profileData?.address || '',
      city: profileData?.city || '',
      state: profileData?.state || '',
      country: profileData?.country || '',
      headline: profileData?.headline || ''
    });
    setFieldErrors({});
    setIsPersonalInfoOpen(true);
  };

  const openProfSummaryEdit = () => {
    setSummaryForm({
      headline: profileData?.headline || '',
      bio: profileData?.bio || ''
    });
    setIsProfSummaryOpen(true);
  };

  const openEducationAdd = () => {
    setEditingId(null);
    setEducationForm({ degree: '', field_of_study: '', institution_name: '', start_date: '', end_date: '', currently_studying: false, grade: '', description: '' });
    setFieldErrors({});
    setIsEducationOpen(true);
  };

  const openEducationEdit = (record) => {
    setEditingId(record.id);
    setEducationForm({
      degree: record.degree || '',
      field_of_study: record.field_of_study || '',
      institution_name: record.institution_name || '',
      start_date: record.start_date || '',
      end_date: record.end_date || '',
      currently_studying: !record.end_date,
      grade: record.grade || '',
      description: record.description || ''
    });
    setFieldErrors({});
    setIsEducationOpen(true);
  };

  const openExperienceAdd = () => {
    setEditingId(null);
    setExperienceForm({ job_title: '', company_name: '', employment_type: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' });
    setFieldErrors({});
    setIsExperienceOpen(true);
  };

  const openExperienceEdit = (record) => {
    setEditingId(record.id);
    setExperienceForm({
      job_title: record.job_title || '',
      company_name: record.company_name || '',
      employment_type: record.employment_type || '',
      location: record.location || '',
      start_date: record.start_date || '',
      end_date: record.end_date || '',
      currently_working: record.currently_working || false,
      description: record.description || ''
    });
    setFieldErrors({});
    setIsExperienceOpen(true);
  };

  const openSkillAdd = () => {
    setEditingId(null);
    setSkillForm({ skill_id: '', proficiency_level: 'Intermediate', years_of_experience: 1 });
    setFieldErrors({});
    setIsSkillOpen(true);
  };

  const openSkillEdit = (skill) => {
    setEditingId(skill.id);
    setSkillForm({
      skill_id: skill.id,
      proficiency_level: skill.proficiency_level,
      years_of_experience: skill.years_of_experience
    });
    setFieldErrors({});
    setIsSkillOpen(true);
  };

  const openProjectAdd = () => {
    setEditingId(null);
    setProjectForm({ project_name: '', description: '', technologies_used: '', github_link: '', live_demo_link: '' });
    setFieldErrors({});
    setIsProjectOpen(true);
  };

  const openProjectEdit = (record) => {
    setEditingId(record.id);
    setProjectForm({
      project_name: record.project_name || '',
      description: record.description || '',
      technologies_used: Array.isArray(record.technologies_used) ? record.technologies_used.join(', ') : record.technologies_used || '',
      github_link: record.github_link || '',
      live_demo_link: record.live_demo_link || ''
    });
    setFieldErrors({});
    setIsProjectOpen(true);
  };

  const openCertificationAdd = () => {
    setEditingId(null);
    setCertificationForm({ certification_name: '', organization: '', issue_date: '', expiry_date: '', credential_url: '' });
    setFieldErrors({});
    setIsCertificationOpen(true);
  };

  const openCertificationEdit = (record) => {
    setEditingId(record.id);
    setCertificationForm({
      certification_name: record.certification_name || '',
      organization: record.organization || '',
      issue_date: record.issue_date || '',
      expiry_date: record.expiry_date || '',
      credential_url: record.credential_url || ''
    });
    setFieldErrors({});
    setIsCertificationOpen(true);
  };

  // Parser Actions
  const handleParserFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith('.pdf') && !nameLower.endsWith('.docx')) {
      alert('Only PDF and DOCX formats are supported.');
      return;
    }

    setParserStep(2);
    setParserProgressText('Reading document bytes...');

    const statuses = [
      'Extracting text characters...',
      'Analyzing segment entities...',
      'Mapping education credentials...',
      'Parsing employment timeline...',
      'Filtering skill keyword densities...',
      'Running AI structured formatting...'
    ];

    let statusIdx = 0;
    const progressTimer = setInterval(() => {
      if (statusIdx < statuses.length) {
        setParserProgressText(statuses[statusIdx]);
        statusIdx += 1;
      }
    }, 450);

    try {
      const data = await resumeService.parseResume(file);
      clearInterval(progressTimer);
      setParsedData(data);
      setParserStep(3);
    } catch (err) {
      clearInterval(progressTimer);
      alert(extractErrorMessage(err) || 'AI parser encountered an internal server error.');
      setIsParserOpen(false);
      setParserStep(1);
    }
  };

  const handleConfirmParserUpdates = async () => {
    if (!parsedData) return;
    try {
      setActionLoading(true);

      // 1. Update Profile summary & headline
      const pi = parsedData.personal_info || {};
      const profilePayload = {
        phone: pi.phone || profileData?.phone || '',
        dob: cleanDate(pi.dob) || profileData?.dob || null,
        gender: pi.gender || profileData?.gender || 'Other',
        address: pi.location || profileData?.address || '',
        city: profileData?.city || '',
        state: profileData?.state || '',
        country: profileData?.country || '',
        headline: pi.headline || pi.name || profileData?.headline || '',
        bio: parsedData.summary || profileData?.bio || ''
      };

      if (profileData) {
        await profileService.updateProfile(profilePayload);
      } else {
        await profileService.createProfile(profilePayload);
      }

      // 2. Associate Skills
      const extractedSkills = parsedData.skills || [];
      const skillIdsToAssociate = [];
      for (const skillName of extractedSkills) {
        const matched = MASTER_SKILLS_CATALOG.find(
          s => s.skill_name.toLowerCase() === skillName.trim().toLowerCase()
        );
        if (matched && !skillsRecords.some(s => s.id === matched.id)) {
          skillIdsToAssociate.push(matched.id);
        }
      }

      for (const sId of skillIdsToAssociate) {
        try {
          await skillsService.addSkill(sId);
          localStorage.setItem(`skill_details_${user?.id}_${sId}`, JSON.stringify({
            proficiency_level: 'Intermediate',
            years_of_experience: 2
          }));
        } catch {}
      }

      // 3. Create Education
      const extractedEducation = parsedData.education || [];
      for (const edu of extractedEducation) {
        try {
          await educationService.createEducation({
            degree: edu.degree || 'Degree',
            field_of_study: edu.field_of_study || 'General',
            institution_name: edu.institution || 'University',
            start_date: cleanDate(edu.start_date) || new Date().toISOString().split('T')[0],
            end_date: cleanDate(edu.end_date),
            currently_studying: !edu.end_date,
            grade: edu.grade || '',
            description: ''
          });
        } catch {}
      }

      // 4. Create Experience
      const extractedExperience = parsedData.experience || [];
      for (const exp of extractedExperience) {
        try {
          await experienceService.createExperience({
            job_title: exp.job_title || 'Role',
            company_name: exp.company_name || 'Organization',
            employment_type: exp.employment_type || 'Full-time',
            location: '',
            start_date: cleanDate(exp.start_date) || new Date().toISOString().split('T')[0],
            end_date: cleanDate(exp.end_date),
            currently_working: !exp.end_date,
            description: exp.responsibilities || ''
          });
        } catch {}
      }

      // 5. Create Projects (localStorage)
      const extractedProjects = parsedData.projects || [];
      for (const proj of extractedProjects) {
        try {
          await projectService.createProject(user?.id, {
            project_name: proj.project_name || 'Project Name',
            description: proj.description || '',
            technologies_used: proj.technologies_used || [],
            github_link: proj.github_link || '',
            live_demo_link: proj.live_demo_link || ''
          });
        } catch {}
      }

      // 6. Create Certifications (localStorage)
      const extractedCertifications = parsedData.certifications || [];
      for (const cert of extractedCertifications) {
        try {
          await certificationService.createCertification(user?.id, {
            certification_name: cert.certification_name || 'Certification Name',
            organization: cert.organization || 'Organization',
            issue_date: cleanDate(cert.issue_date) || new Date().toISOString().split('T')[0],
            expiry_date: cleanDate(cert.expiry_date),
            credential_url: cert.credential_url || ''
          });
        } catch {}
      }

      setGlobalSuccess('Resume analysis complete. Profile details synchronized successfully!');
      setIsParserOpen(false);
      setParsedData(null);
      setParserStep(1);
      fetchAllData();
    } catch {
      alert('Unable to confirm profile updates.');
    } finally {
      setActionLoading(false);
    }
  };

  // Analyzer Actions
  const handleRunAnalysis = async () => {
    if (!resumeMetadata && !profileData) {
      setGlobalError('You must upload a resume or fill details first before analyzing.');
      return;
    }

    try {
      setAnalyzerLoading(true);
      setIsAnalyzerOpen(true);
      setAnalysisResult(null);
      const res = await resumeService.analyzeResume();
      setAnalysisResult(res);
    } catch (err) {
      alert(extractErrorMessage(err) || 'ATS Analysis failure.');
      setIsAnalyzerOpen(false);
    } finally {
      setAnalyzerLoading(false);
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  // Calculate skill mapping categories
  const skillsByCategory = skillsRecords.reduce((acc, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600 dark:text-white" />
            <span>My Resume</span>
          </h1>
          <p className="text-slate-550 dark:text-slate-400 text-sm">
            Manage your resume file, seeking credentials, and execute automated AI diagnostics.
          </p>
        </div>
      </div>

      <AlertBanner type="error" message={globalError} />
      <AlertBanner type="success" message={globalSuccess} />

      {/* 1. RESUME UPLOAD SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UploadCloud className="w-6 h-6 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Resume File Upload</h2>
        </div>

        {!resumeMetadata ? (
          <div>
            <input ref={fileInputRef} type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleResumeFileSelect} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-4 bg-white dark:bg-[#15161e] border border-slate-150/60 dark:border-slate-800 p-8 rounded-2xl shadow-sm max-w-md mx-auto animate-fadeIn">
                <Spinner className="w-8 h-8 text-blue-650 animate-spin" />
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-sm font-semibold text-slate-650 dark:text-slate-450">Uploading and validating file: {uploadProgress}%</p>
              </div>
            ) : (
              <EmptyState
                title="No resume uploaded"
                description="Upload a PDF or DOCX copy of your CV to start applying for jobs."
                icon={FileText}
                primaryButton={{
                  label: "Upload Resume File",
                  onClick: () => fileInputRef.current?.click()
                }}
                className="w-full py-16"
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 border border-slate-150/60 dark:border-slate-800 shadow-sm space-y-6 bg-white dark:bg-[#15161e] rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/80 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 rounded-full flex items-center justify-center shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug">Primary Curriculum Vitae</h3>
                    <p className="text-xs text-slate-400">Used for search matches and online applications</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" onClick={handleDownloadResume} className="rounded-xl flex items-center gap-2 border border-slate-200 font-bold bg-white text-slate-700">
                    <Download className="w-4 h-4" /> Download PDF
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setIsDeleteResumeModalOpen(true)} className="rounded-xl flex items-center gap-2 border border-red-100 text-red-600 hover:bg-red-50 font-bold bg-white">
                    <Trash2 className="w-4 h-4 text-red-500" /> Delete Resume
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Uploaded Date</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatDate(resumeMetadata.uploaded_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">File Name</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]" title={resumeMetadata.file_name}>{resumeMetadata.file_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">File Size</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatFileSize(resumeMetadata.file_size)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-slate-150/60 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-black/30 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Replace your Resume File</h4>
                <p className="text-xs text-slate-550 dark:text-slate-450 max-w-md leading-relaxed">Choose a new PDF/DOCX document to replace the active CV on your search profile.</p>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <input ref={fileInputRef} type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleResumeFileSelect} />
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4 text-blue-650 animate-spin" />
                    <span className="text-xs font-semibold text-slate-500">Replacing: {uploadProgress}%</span>
                  </div>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-slate-200 dark:border-slate-800 font-semibold bg-white dark:bg-[#15161e] text-slate-700 dark:text-white">Choose New File</Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* 2. PERSONAL INFORMATION SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Personal Information</h2>
          </div>
          <Button variant="secondary" size="sm" onClick={openPersonalEdit} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161e] font-semibold text-slate-700 dark:text-white flex items-center gap-2">
            <Edit2 className="w-3.5 h-3.5" /> Edit Personal Information
          </Button>
        </div>

        {!profileData ? (
          <EmptyState title="No Personal Information" description="Complete your seeker profile so recruiters can identify you." icon={<User className="w-12 h-12 text-slate-400" />} />
        ) : (
          <Card className="p-6 border border-slate-150/60 dark:border-slate-800 shadow-sm bg-white dark:bg-[#15161e] rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{user?.name || 'Not Specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{profileData.phone || 'Not Specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Professional Headline</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{profileData.headline || 'Not Specified'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Location / Address</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {profileData.address ? `${profileData.address}, ` : ''}
                  {profileData.city || ''} {profileData.state || ''} {profileData.country || ''}
                  {(!profileData.address && !profileData.city && !profileData.country) && 'Not Specified'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Date of Birth</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{profileData.dob ? formatDate(profileData.dob) : 'Not Specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Gender</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{profileData.gender || 'Not Specified'}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* 3. PROFESSIONAL SUMMARY SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Professional Summary</h2>
          </div>
          <Button variant="secondary" size="sm" onClick={openProfSummaryEdit} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161e] font-semibold text-slate-700 dark:text-white flex items-center gap-2">
            <Edit2 className="w-3.5 h-3.5" /> Edit Summary
          </Button>
        </div>

        {!profileData?.bio ? (
          <EmptyState title="No Professional Summary" description="Add a career summary highlighting your highlights and aspirations." icon={<Info className="w-12 h-12 text-slate-400" />} />
        ) : (
          <Card className="p-6 border border-slate-150/60 dark:border-slate-800 shadow-sm bg-white dark:bg-[#15161e] rounded-2xl space-y-3">
            {profileData.headline && <h3 className="text-base font-bold text-slate-800 dark:text-white">{profileData.headline}</h3>}
            <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">{profileData.bio}</p>
          </Card>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* 4. SKILLS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Skills</h2>
          </div>
          <Button variant="primary" size="sm" onClick={openSkillAdd} className="rounded-xl shadow-md font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Skill
          </Button>
        </div>

        {skillsRecords.length === 0 ? (
          <EmptyState title="No Associated Skills" description="Add tech stacks, platforms, and languages from the master catalog." icon={<Award className="w-12 h-12 text-slate-400" />} />
        ) : (
          <div className="space-y-6">
            {Object.keys(skillsByCategory).map(category => (
              <div key={category} className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pl-1">{category} ({skillsByCategory[category].length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {skillsByCategory[category].map(skill => (
                    <SkillChip key={skill.id} skill={skill} onEdit={openSkillEdit} onDelete={(id) => handleOpenDeleteConfirm('skill', id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* 5. EDUCATION SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Education</h2>
          </div>
          <Button variant="primary" size="sm" onClick={openEducationAdd} className="rounded-xl shadow-md font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Education
          </Button>
        </div>

        {educationRecords.length === 0 ? (
          <EmptyState title="No Education Records" description="Register degrees, certifications, or credentials." icon={<GraduationCap className="w-12 h-12 text-slate-400" />} />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {educationRecords.map(record => (
              <Card key={record.id} className="p-6 border border-slate-150/60 dark:border-slate-800 hover:shadow-md transition-all duration-200 bg-white dark:bg-[#15161e] rounded-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 rounded-full flex items-center justify-center shadow-inner shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-snug">{record.degree} in {record.field_of_study}</h3>
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5"><School className="w-4 h-4 text-slate-400" /> {record.institution_name}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(record.start_date)} — {record.end_date ? formatDate(record.end_date) : 'Present'}</span>
                        {record.grade && <span className="flex items-center gap-1 bg-slate-55 dark:bg-[#090a0f] px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-350">Grade: {record.grade}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEducationEdit(record)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleOpenDeleteConfirm('education', record.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {record.description && <div className="mt-4 text-sm text-slate-600 dark:text-slate-350 border-t border-slate-50 dark:border-slate-800/80 pt-3 leading-relaxed whitespace-pre-line">{record.description}</div>}
              </Card>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* 6. EXPERIENCE SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Experience</h2>
          </div>
          <Button variant="primary" size="sm" onClick={openExperienceAdd} className="rounded-xl shadow-md font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Experience
          </Button>
        </div>

        {experienceRecords.length === 0 ? (
          <EmptyState title="No Work History" description="Record employment experiences, internships, or freelance roles." icon={<Briefcase className="w-12 h-12 text-slate-400" />} />
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8">
            {experienceRecords.map(record => (
              <div key={record.id} className="relative">
                <span className="absolute -left-[35px] md:-left-[43px] mt-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-blue-500 shadow-sm shrink-0">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                </span>
                <Card className="p-6 border border-slate-150/60 dark:border-slate-800 hover:shadow-md hover:border-slate-250/80 transition-all duration-200 bg-white dark:bg-[#15161e] rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight leading-snug">{record.job_title}</h3>
                        <p className="text-sm font-semibold text-slate-505 dark:text-slate-400 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400" /> {record.company_name}
                          {record.employment_type && <span className="text-xs bg-slate-50 dark:bg-[#090a0f] text-slate-600 dark:text-slate-350 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 font-semibold ml-1">{record.employment_type}</span>}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(record.start_date)} — {record.currently_working ? 'Present' : formatDate(record.end_date)}</span>
                        {record.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{record.location}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 self-start sm:self-auto">
                      <button onClick={() => openExperienceEdit(record)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleOpenDeleteConfirm('experience', record.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {record.description && <div className="mt-4 text-sm text-slate-600 dark:text-slate-350 border-t border-slate-50 dark:border-slate-800/80 pt-3 leading-relaxed whitespace-pre-line">{record.description}</div>}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* 7. PROJECTS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Projects</h2>
          </div>
          <Button variant="primary" size="sm" onClick={openProjectAdd} className="rounded-xl shadow-md font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        </div>

        {projectsRecords.length === 0 ? (
          <EmptyState title="No Portfolio Projects" description="Highlight side-projects, open-source works, or deployments." icon={<FolderKanban className="w-12 h-12 text-slate-400" />} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectsRecords.map(project => (
              <Card key={project.id} className="p-6 border border-slate-150/60 dark:border-slate-800 hover:shadow-md transition-all duration-200 bg-white dark:bg-[#15161e] rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">{project.project_name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => openProjectEdit(project)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleOpenDeleteConfirm('project', project.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-3">{project.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/80 mt-4 space-y-3">
                  {project.technologies_used && project.technologies_used.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies_used.map(t => (
                        <span key={t} className="text-[10px] bg-slate-50 dark:bg-[#090a0f] text-slate-650 dark:text-slate-350 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded font-semibold">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    {project.github_link && <a href={project.github_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GitHub Code</a>}
                    {project.live_demo_link && <a href={project.live_demo_link} target="_blank" rel="noreferrer" className="text-emerald-650 hover:underline">Live Demo</a>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* 8. CERTIFICATIONS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileBadge className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Certifications</h2>
          </div>
          <Button variant="primary" size="sm" onClick={openCertificationAdd} className="rounded-xl shadow-md font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Certification
          </Button>
        </div>

        {certificationsRecords.length === 0 ? (
          <EmptyState title="No Certifications Listed" description="Add AWS, Scrum, or other professional training course completions." icon={<FileBadge className="w-12 h-12 text-slate-400" />} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {certificationsRecords.map(cert => (
              <Card key={cert.id} className="p-5 border border-slate-150/60 dark:border-slate-800 hover:shadow-md bg-white dark:bg-[#15161e] rounded-2xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{cert.certification_name}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{cert.organization}</p>
                  <p className="text-[10px] text-slate-405 dark:text-slate-400 pt-1">
                    Issued: {cert.issue_date ? formatDate(cert.issue_date) : 'N/A'}
                    {cert.expiry_date ? ` — Expires: ${formatDate(cert.expiry_date)}` : ''}
                  </p>
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noreferrer" className="inline-block text-[10px] text-blue-600 font-bold hover:underline pt-2">Verify Credential</a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openCertificationEdit(cert)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleOpenDeleteConfirm('certification', cert.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* 9. AI RESUME TOOLS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Resume Tools</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Resume Parser */}
          <Card className="p-6 border border-slate-150/60 dark:border-slate-800 shadow-sm bg-white dark:bg-[#15161e] space-y-4 rounded-2xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 rounded-full shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">AI Resume Parser</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload your resume and automatically extract education, experience, skills, projects, and certifications to pre-populate your seeker profile details.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="md" onClick={() => { setIsParserOpen(true); setParserStep(1); }} className="w-full rounded-xl font-semibold flex items-center justify-center gap-2">
                <FileCheck className="w-4 h-4" /> Parse Resume
              </Button>
            </div>
          </Card>

          {/* Card 2: Resume Analyzer */}
          <Card className="p-6 border border-slate-150/60 dark:border-slate-800 shadow-sm bg-white dark:bg-[#15161e] space-y-4 rounded-2xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#6366f1]/10 text-indigo-500 dark:bg-[#6366f1]/10 dark:text-indigo-400 rounded-full shadow-inner">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">AI Resume Analyzer</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Analyze your resume for ATS compatibility and receive detailed structural feedback, score summaries, and missing keyword recommendations.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleRunAnalysis} className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 rounded-xl font-bold flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" /> Analyze Resume
              </Button>
            </div>
          </Card>
        </div>
      </div>


      {/* ─── MODALS DIALOGS ────────────────────────────────────────────────── */}

      {/* Generic Delete Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">Are you absolutely sure you want to delete this {deletingRecord?.type} entry? This action is permanent and cannot be undone.</p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteConfirmOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleDeleteConfirmExecute} isLoading={actionLoading} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold">Confirm Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Resume PDF Modal */}
      <Modal isOpen={isDeleteResumeModalOpen} onClose={() => setIsDeleteResumeModalOpen(false)} title="Delete CV Document">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">Are you sure you want to delete your active resume file? Search engines and job matches rely on this copy.</p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteResumeModalOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleDeleteResume} isLoading={actionLoading} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold">Confirm Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Personal Info Modal */}
      <Modal isOpen={isPersonalInfoOpen} onClose={() => setIsPersonalInfoOpen(false)} title="Edit Personal Information" className="max-w-2xl">
        <form onSubmit={handlePersonalSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Seeker Name" id="name" value={personalForm.name} onChange={(e) => setPersonalForm({...personalForm, name: e.target.value})} disabled placeholder="Name synced with account" />
            <Input label="Phone Number" id="phone" value={personalForm.phone} onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})} placeholder="e.g. +1 (555) 019-2834" disabled={actionLoading} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Date of Birth" id="dob" type="date" value={personalForm.dob} onChange={(e) => setPersonalForm({...personalForm, dob: e.target.value})} disabled={actionLoading} />
            <div className="space-y-1">
              <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">Gender</label>
              <select id="gender" value={personalForm.gender} onChange={(e) => setPersonalForm({...personalForm, gender: e.target.value})} disabled={actionLoading} className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
          <Input label="Professional Headline" id="headline" value={personalForm.headline} onChange={(e) => setPersonalForm({...personalForm, headline: e.target.value})} placeholder="e.g. Senior Frontend Architect / Product Manager" disabled={actionLoading} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Street Address" id="address" value={personalForm.address} onChange={(e) => setPersonalForm({...personalForm, address: e.target.value})} placeholder="e.g. 100 Main St" disabled={actionLoading} />
            <Input label="City" id="city" value={personalForm.city} onChange={(e) => setPersonalForm({...personalForm, city: e.target.value})} placeholder="e.g. San Francisco" disabled={actionLoading} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="State / Province" id="state" value={personalForm.state} onChange={(e) => setPersonalForm({...personalForm, state: e.target.value})} placeholder="e.g. CA" disabled={actionLoading} />
            <Input label="Country" id="country" value={personalForm.country} onChange={(e) => setPersonalForm({...personalForm, country: e.target.value})} placeholder="e.g. United States" disabled={actionLoading} />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsPersonalInfoOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">Save Information</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Bio Summary Modal */}
      <Modal isOpen={isProfSummaryOpen} onClose={() => setIsProfSummaryOpen(false)} title="Edit Professional Summary" className="max-w-2xl">
        <form onSubmit={handleProfSummarySubmit} className="space-y-4">
          <Input label="Resume Headline" id="headline" value={summaryForm.headline} onChange={(e) => setSummaryForm({...summaryForm, headline: e.target.value})} placeholder="e.g. Full Stack Engineer specialized in high-scale Web APIs" disabled={actionLoading} />
          <Textarea label="Career Narrative / Bio summary" id="bio" value={summaryForm.bio} onChange={(e) => setSummaryForm({...summaryForm, bio: e.target.value})} placeholder="Outline your key highlights, career timeline, and skills..." rows={6} disabled={actionLoading} required />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsProfSummaryOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">Save Summary</Button>
          </div>
        </form>
      </Modal>

      {/* Education Modal */}
      <Modal isOpen={isEducationOpen} onClose={() => setIsEducationOpen(false)} title={editingId ? 'Edit Education credential' : 'Add Education credential'} className="max-w-2xl">
        <form onSubmit={handleEducationSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Degree / Certificate" id="degree" value={educationForm.degree} onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})} error={fieldErrors.degree} placeholder="e.g. Bachelor of Science" disabled={actionLoading} required />
            <Input label="Field of Study" id="field_of_study" value={educationForm.field_of_study} onChange={(e) => setEducationForm({...educationForm, field_of_study: e.target.value})} error={fieldErrors.field_of_study} placeholder="e.g. Computer Science" disabled={actionLoading} required />
          </div>
          <Input label="School / University Name" id="institution_name" value={educationForm.institution_name} onChange={(e) => setEducationForm({...educationForm, institution_name: e.target.value})} error={fieldErrors.institution_name} placeholder="e.g. Stanford University" disabled={actionLoading} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Input label="Start Date" id="start_date" type="date" value={educationForm.start_date} onChange={(e) => setEducationForm({...educationForm, start_date: e.target.value})} error={fieldErrors.start_date} disabled={actionLoading} required />
            <div className="space-y-4">
              <Input label="End Date" id="end_date" type="date" value={educationForm.currently_studying ? '' : educationForm.end_date} onChange={(e) => setEducationForm({...educationForm, end_date: e.target.value})} error={fieldErrors.end_date} disabled={educationForm.currently_studying || actionLoading} />
              <Checkbox label="I am currently studying here" id="currently_studying" checked={educationForm.currently_studying} onChange={(e) => setEducationForm({...educationForm, currently_studying: e.target.checked})} disabled={actionLoading} />
            </div>
          </div>
          <Input label="Grade / CGPA (Optional)" id="grade" value={educationForm.grade} onChange={(e) => setEducationForm({...educationForm, grade: e.target.value})} placeholder="e.g. 3.92 GPA" disabled={actionLoading} />
          <Textarea label="Details / Honors (Optional)" id="description" value={educationForm.description} onChange={(e) => setEducationForm({...educationForm, description: e.target.value})} placeholder="Describe coursework, honors, or publications..." rows={3} disabled={actionLoading} />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsEducationOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">Confirm Details</Button>
          </div>
        </form>
      </Modal>

      {/* Experience Modal */}
      <Modal isOpen={isExperienceOpen} onClose={() => setIsExperienceOpen(false)} title={editingId ? 'Edit Work Experience' : 'Add Work Experience'} className="max-w-2xl">
        <form onSubmit={handleExperienceSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Job Title" id="job_title" value={experienceForm.job_title} onChange={(e) => setExperienceForm({...experienceForm, job_title: e.target.value})} error={fieldErrors.job_title} placeholder="e.g. Senior Software Architect" disabled={actionLoading} required />
            <Input label="Company Name" id="company_name" value={experienceForm.company_name} onChange={(e) => setExperienceForm({...experienceForm, company_name: e.target.value})} error={fieldErrors.company_name} placeholder="e.g. Google LLC" disabled={actionLoading} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label htmlFor="employment_type" className="block text-sm font-semibold text-slate-700">Employment Type</label>
              <select id="employment_type" value={experienceForm.employment_type} onChange={(e) => setExperienceForm({...experienceForm, employment_type: e.target.value})} disabled={actionLoading} className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none">
                <option value="">Select Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <Input label="Location (Optional)" id="location" value={experienceForm.location} onChange={(e) => setExperienceForm({...experienceForm, location: e.target.value})} placeholder="e.g. Remote / San Francisco, CA" disabled={actionLoading} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Input label="Start Date" id="start_date" type="date" value={experienceForm.start_date} onChange={(e) => setExperienceForm({...experienceForm, start_date: e.target.value})} error={fieldErrors.start_date} disabled={actionLoading} required />
            <div className="space-y-4">
              <Input label="End Date" id="end_date" type="date" value={experienceForm.currently_working ? '' : experienceForm.end_date} onChange={(e) => setExperienceForm({...experienceForm, end_date: e.target.value})} error={fieldErrors.end_date} disabled={experienceForm.currently_working || actionLoading} />
              <Checkbox label="I am currently working in this role" id="currently_working" checked={experienceForm.currently_working} onChange={(e) => setExperienceForm({...experienceForm, currently_working: e.target.checked})} disabled={actionLoading} />
            </div>
          </div>
          <Textarea label="Description / Responsibilities" id="description" value={experienceForm.description} onChange={(e) => setExperienceForm({...experienceForm, description: e.target.value})} placeholder="Outline your deliverables, technology stack, and career accomplishments..." rows={4} disabled={actionLoading} required />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsExperienceOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">Confirm Experience</Button>
          </div>
        </form>
      </Modal>

      {/* Skill Association Modal */}
      <Modal isOpen={isSkillOpen} onClose={() => setIsSkillOpen(false)} title={editingId ? 'Edit Skill details' : 'Add Catalog Skill'} className="max-w-md">
        <form onSubmit={handleSkillSubmit} className="space-y-4">
          {editingId ? (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Name</label>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 font-bold">
                {MASTER_SKILLS_CATALOG.find(s => s.id === editingId)?.skill_name}
              </div>
            </div>
          ) : (
            <SearchableSelect label="Select Master Skill" id="skill_id" options={MASTER_SKILLS_CATALOG} value={skillForm.skill_id} onChange={(e) => setSkillForm({...skillForm, skill_id: e.target.value})} error={fieldErrors.skill_id} placeholder="Search skills catalog..." disabled={actionLoading} required />
          )}

          <div className="space-y-1">
            <label htmlFor="proficiency_level" className="block text-sm font-semibold text-slate-700">Proficiency Level</label>
            <select id="proficiency_level" value={skillForm.proficiency_level} onChange={(e) => setSkillForm({...skillForm, proficiency_level: e.target.value})} disabled={actionLoading} className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <Input label="Years of Experience" id="years_of_experience" type="number" min="0" value={skillForm.years_of_experience} onChange={(e) => setSkillForm({...skillForm, years_of_experience: e.target.value})} disabled={actionLoading} required />

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsSkillOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">{editingId ? 'Save Changes' : 'Associate Skill'}</Button>
          </div>
        </form>
      </Modal>

      {/* Project Modal */}
      <Modal isOpen={isProjectOpen} onClose={() => setIsProjectOpen(false)} title={editingId ? 'Edit Project details' : 'Add Project'} className="max-w-2xl">
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <Input label="Project Name" id="project_name" value={projectForm.project_name} onChange={(e) => setProjectForm({...projectForm, project_name: e.target.value})} error={fieldErrors.project_name} placeholder="e.g. SmartRecruiter Dashboard" disabled={actionLoading} required />
          <Textarea label="Project Description" id="description" value={projectForm.description} onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} placeholder="Describe features, metrics, and architecture..." rows={4} disabled={actionLoading} />
          <Input label="Technologies Used (comma separated)" id="technologies_used" value={projectForm.technologies_used} onChange={(e) => setProjectForm({...projectForm, technologies_used: e.target.value})} placeholder="e.g. React, FastApi, MongoDB" disabled={actionLoading} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="GitHub Code Link" id="github_link" value={projectForm.github_link} onChange={(e) => setProjectForm({...projectForm, github_link: e.target.value})} placeholder="e.g. https://github.com/..." disabled={actionLoading} />
            <Input label="Live Demo Link" id="live_demo_link" value={projectForm.live_demo_link} onChange={(e) => setProjectForm({...projectForm, live_demo_link: e.target.value})} placeholder="e.g. https://demo.example.com" disabled={actionLoading} />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsProjectOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">Confirm Project</Button>
          </div>
        </form>
      </Modal>

      {/* Certification Modal */}
      <Modal isOpen={isCertificationOpen} onClose={() => setIsCertificationOpen(false)} title={editingId ? 'Edit Certification' : 'Add Certification'} className="max-w-2xl">
        <form onSubmit={handleCertificationSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Certification Name" id="certification_name" value={certificationForm.certification_name} onChange={(e) => setCertificationForm({...certificationForm, certification_name: e.target.value})} error={fieldErrors.certification_name} placeholder="e.g. AWS Certified Solutions Architect" disabled={actionLoading} required />
            <Input label="Organization / Issuer" id="organization" value={certificationForm.organization} onChange={(e) => setCertificationForm({...certificationForm, organization: e.target.value})} error={fieldErrors.organization} placeholder="e.g. Amazon Web Services" disabled={actionLoading} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Issue Date" id="issue_date" type="date" value={certificationForm.issue_date} onChange={(e) => setCertificationForm({...certificationForm, issue_date: e.target.value})} disabled={actionLoading} />
            <Input label="Expiration Date (Optional)" id="expiry_date" type="date" value={certificationForm.expiry_date} onChange={(e) => setCertificationForm({...certificationForm, expiry_date: e.target.value})} disabled={actionLoading} />
          </div>
          <Input label="Verification Credential URL" id="credential_url" value={certificationForm.credential_url} onChange={(e) => setCertificationForm({...certificationForm, credential_url: e.target.value})} placeholder="e.g. https://aws.amazon.com/verify/..." disabled={actionLoading} />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsCertificationOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">Confirm Credential</Button>
          </div>
        </form>
      </Modal>

      {/* AI Resume Parser Modal */}
      <Modal isOpen={isParserOpen} onClose={() => { if (!actionLoading) setIsParserOpen(false); }} title="AI Resume Parsing Assistant" className="max-w-3xl">
        {parserStep === 1 && (
          <div className="space-y-6 py-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-800">Select Resume to Parse</h3>
              <p className="text-xs text-slate-400">PDF and DOCX formats are supported. Uploading will trigger text extraction.</p>
            </div>
            <input type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" id="parser_file_input" onChange={handleParserFileSelect} />
            <Button variant="primary" size="md" onClick={() => document.getElementById('parser_file_input').click()} className="rounded-xl font-bold flex items-center gap-2">
              Select Document
            </Button>
          </div>
        )}

        {parserStep === 2 && (
          <div className="space-y-4 py-8 flex flex-col items-center animate-fadeIn">
            <Spinner className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-bold text-slate-700">{parserProgressText}</p>
            <p className="text-xs text-slate-400">This might take up to a minute. AI is structuring raw content blocks...</p>
          </div>
        )}

        {parserStep === 3 && parsedData && (
          <div className="space-y-6 py-2 animate-fadeIn">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 leading-relaxed">
              <strong>Confirm Extraction Results:</strong> Check the preview below. Clicking <strong>Confirm & Update Profile</strong> will add these entities to your portfolio. Existing files and values will NOT be automatically overridden.
            </div>

            <div className="max-h-[350px] overflow-y-auto border border-slate-150/60 dark:border-slate-800 rounded-2xl p-4 space-y-4 bg-slate-50/50 dark:bg-[#090a0f]/40 text-xs">
              {/* Personal Preview */}
              <div className="space-y-1 bg-white dark:bg-[#15161e] p-3 rounded-xl border border-slate-150/60 dark:border-slate-800">
                <h4 className="font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider text-[10px]">Extracted Personal Information</h4>
                <p><strong>Name:</strong> {parsedData.personal_info?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {parsedData.personal_info?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {parsedData.personal_info?.phone || 'N/A'}</p>
                <p><strong>Headline:</strong> {parsedData.personal_info?.headline || 'N/A'}</p>
                <p><strong>Location:</strong> {parsedData.personal_info?.location || 'N/A'}</p>
              </div>

              {/* Bio Summary Preview */}
              {parsedData.summary && (
                <div className="space-y-1 bg-white dark:bg-[#15161e] p-3 rounded-xl border border-slate-150/60 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider text-[10px]">Professional Summary</h4>
                  <p className="italic leading-relaxed">{parsedData.summary}</p>
                </div>
              )}

              {/* Skills Preview */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <div className="space-y-1.5 bg-white dark:bg-[#15161e] p-3 rounded-xl border border-slate-150/60 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider text-[10px]">Extracted Skills ({parsedData.skills.length})</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {parsedData.skills.map(s => (
                      <span key={s} className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Preview */}
              {parsedData.education && parsedData.education.length > 0 && (
                <div className="space-y-2 bg-white dark:bg-[#15161e] p-3 rounded-xl border border-slate-150/60 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider text-[10px]">Extracted Education ({parsedData.education.length})</h4>
                  {parsedData.education.map((edu, idx) => (
                    <div key={idx} className="border-b border-slate-50 pb-1.5 last:border-b-0 last:pb-0">
                      <p><strong>{edu.degree}</strong> ({edu.field_of_study || 'General'})</p>
                      <p className="text-[10px] text-slate-400">{edu.institution} | {edu.start_date || 'N/A'} — {edu.end_date || 'Present'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience Preview */}
              {parsedData.experience && parsedData.experience.length > 0 && (
                <div className="space-y-2 bg-white dark:bg-[#15161e] p-3 rounded-xl border border-slate-150/60 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider text-[10px]">Extracted Experience ({parsedData.experience.length})</h4>
                  {parsedData.experience.map((exp, idx) => (
                    <div key={idx} className="border-b border-slate-50 pb-1.5 last:border-b-0 last:pb-0">
                      <p><strong>{exp.job_title}</strong> at {exp.company_name}</p>
                      <p className="text-[10px] text-slate-400">{exp.start_date || 'N/A'} — {exp.end_date || 'Present'}</p>
                      {exp.responsibilities && <p className="text-[10px] text-slate-500 pt-1 line-clamp-2">{exp.responsibilities}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Projects Preview */}
              {parsedData.projects && parsedData.projects.length > 0 && (
                <div className="space-y-2 bg-white dark:bg-[#15161e] p-3 rounded-xl border border-slate-150/60 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider text-[10px]">Extracted Projects ({parsedData.projects.length})</h4>
                  {parsedData.projects.map((proj, idx) => (
                    <div key={idx} className="border-b border-slate-50 pb-1.5 last:border-b-0 last:pb-0">
                      <p><strong>{proj.project_name}</strong></p>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications Preview */}
              {parsedData.certifications && parsedData.certifications.length > 0 && (
                <div className="space-y-2 bg-white dark:bg-[#15161e] p-3 rounded-xl border border-slate-150/60 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider text-[10px]">Extracted Certifications ({parsedData.certifications.length})</h4>
                  {parsedData.certifications.map((cert, idx) => (
                    <div key={idx} className="border-b border-slate-50 pb-1.5 last:border-b-0 last:pb-0">
                      <p><strong>{cert.certification_name}</strong> | {cert.organization}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button variant="secondary" size="sm" onClick={() => { setParsedData(null); setParserStep(1); }} disabled={actionLoading} className="rounded-xl font-bold">Restart</Button>
              <Button variant="primary" size="sm" onClick={handleConfirmParserUpdates} isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">Confirm & Update Profile</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Resume Analyzer Modal */}
      <Modal isOpen={isAnalyzerOpen} onClose={() => { if (!analyzerLoading) setIsAnalyzerOpen(false); }} title="AI ATS Compatibility Analyzer" className="max-w-3xl">
        {analyzerLoading && (
          <div className="space-y-4 py-12 flex flex-col items-center animate-fadeIn">
            <Spinner className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-700">Running ATS audit analysis...</p>
            <p className="text-xs text-slate-400">Comparing your profile keywords and records schema structure against standard hiring checks.</p>
          </div>
        )}

        {!analyzerLoading && analysisResult && (
          <div className="space-y-6 py-2 max-h-[500px] overflow-y-auto pr-1 animate-fadeIn">
            {/* Score Ring Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="48" cy="48" r="40" stroke="#4f46e5" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * analysisResult.overall_score) / 100} />
                  </svg>
                  <span className="absolute text-xl font-black text-slate-800">{analysisResult.overall_score}%</span>
                </div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Overall Profile Score</p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (analysisResult.ats_score || 0)) / 100} />
                  </svg>
                  <span className="absolute text-xl font-black text-slate-800">{analysisResult.ats_score || 0}%</span>
                </div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">ATS Compatibility</p>
              </div>
            </div>

            {/* AI Summary Block */}
            {analysisResult.ai_summary && (
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">AI Executive Summary</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-4 rounded-xl whitespace-pre-line">{analysisResult.ai_summary}</p>
              </div>
            )}

            {/* Strengths & Weaknesses details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Profile Strengths</h4>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc pl-4 leading-relaxed">
                  {analysisResult.skill_gap?.strong_skills?.length > 0 ? (
                    analysisResult.skill_gap.strong_skills.map((st, i) => <li key={i}>{st}</li>)
                  ) : (
                    <li>Robust details and timeline records validated.</li>
                  )}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-500" /> Improvement Areas</h4>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc pl-4 leading-relaxed">
                  {analysisResult.skill_gap?.weak_skills?.length > 0 ? (
                    analysisResult.skill_gap.weak_skills.map((wk, i) => <li key={i}>{wk}</li>)
                  ) : (
                    <li>No severe layout issues detected.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Missing Skills and Keywords */}
            {(analysisResult.skill_gap?.missing_technical?.length > 0 || analysisResult.keywords?.missing_keywords?.length > 0) && (
              <div className="space-y-2 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl">
                <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Suggested Missing Tech Stacks & Keywords</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysisResult.skill_gap?.missing_technical?.map(sk => (
                    <span key={sk} className="bg-indigo-100 border border-indigo-200 text-indigo-800 px-2.5 py-0.5 rounded font-semibold text-[10px]">{sk}</span>
                  ))}
                  {analysisResult.keywords?.missing_keywords?.map(kw => (
                    <span key={kw} className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded font-semibold text-[10px]">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions table */}
            {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Detailed Recommendations Checklist</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  {analysisResult.suggestions.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-6 p-3 bg-white border-b border-slate-50 last:border-b-0">
                      <span className="text-slate-600 font-medium leading-normal">{item.text}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        item.importance === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                        item.importance === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>{item.importance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setIsAnalyzerOpen(false)} className="rounded-xl font-bold bg-slate-100 hover:bg-slate-200 border-none text-slate-700 px-6">Close Audit Report</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ResumePage;
