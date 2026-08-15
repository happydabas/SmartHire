import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  PlusCircle,
  FileClock,
  Sparkles,
  ClipboardList,
  GraduationCap,
  Building,
  ListTodo,
  ShieldAlert,
  RotateCcw,
  AlertCircle,
  Sliders
} from 'lucide-react';
import { UserCheck, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { jobService } from '@/services/jobs/jobService';
import { companyService } from '@/services/company/companyService';
import { notificationService } from '@/services/notificationService';
import { MASTER_SKILLS_CATALOG } from '@/pages/jobseeker/Skills';

// Reusable UI components
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import MultiSelect from '@/components/ui/MultiSelect';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import SegmentedDateInput from '@/components/ui/SegmentedDateInput';
import PipelineCustomizerModal from '@/components/ui/PipelineCustomizerModal';
import JobPreviewCard from '@/components/ui/JobPreviewCard';
import PageHeader from '@/components/ui/PageHeader';
import { parseFormErrors, extractErrorMessage } from '@/utils/errorParser';

const DEFAULT_PIPELINE = ['Applied', 'Screening', 'Technical Interview', 'HR Interview', 'Offer'];

export function CreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Loading & Error States
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  
  // Available list options
  const [availableSkills, setAvailableSkills] = useState([]);
  const [globalError, setGlobalError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Hiring pipeline state
  const [pipelineStages, setPipelineStages] = useState(DEFAULT_PIPELINE);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

  // Form Field values
  const [formFields, setFormFields] = useState({
    title: '',
    department: 'Engineering',
    job_type: 'Full-time',
    work_mode: 'Onsite',
    location: '',
    experience_level: 'Entry',
    salary_min: '',
    salary_max: '',
    application_deadline: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    required_skills: []
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // 1. Load available skills catalog
  useEffect(() => {
    setAvailableSkills(MASTER_SKILLS_CATALOG);
    setSkillsLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormFields(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleMultiSelectChange = (e) => {
    const { id, value } = e.target;
    setFormFields(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Form Validations
  const validateForm = () => {
    const errors = {};

    if (!formFields.title.trim()) {
      errors.title = 'Job Title is required';
    }
    if (!formFields.location.trim()) {
      errors.location = 'Job Location is required';
    }
    if (!formFields.description.trim()) {
      errors.description = 'Job Description is required';
    }
    if (formFields.required_skills.length === 0) {
      errors.required_skills = 'At least one required skill must be selected';
    }

    const sMin = parseFloat(formFields.salary_min);
    const sMax = parseFloat(formFields.salary_max);

    if (formFields.salary_min && isNaN(sMin)) {
      errors.salary_min = 'Min salary must be a number';
    }
    if (formFields.salary_max && isNaN(sMax)) {
      errors.salary_max = 'Max salary must be a number';
    }

    if (!isNaN(sMin) && !isNaN(sMax) && sMax < sMin) {
      errors.salary_max = 'Maximum salary cannot be less than minimum salary';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [companyRecruiters, setCompanyRecruiters] = useState([]);
  const [recruitersLoading, setRecruitersLoading] = useState(false);
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState([]);

  // Fetch company recruiters for assignment
  useEffect(() => {
    const loadCompanyRecruiters = async () => {
      if (!user?.company_id) return;
      try {
        setRecruitersLoading(true);
        const data = await companyService.getRecruiters(user.company_id);
        const recruitersList = Array.isArray(data) ? data : (data.recruiters || []);
        setCompanyRecruiters(recruitersList);
        setSelectedRecruiterIds(recruitersList.map(r => r.id));
      } catch (err) {
        console.error('Failed to load company recruiters:', err);
      } finally {
        setRecruitersLoading(false);
      }
    };
    loadCompanyRecruiters();
  }, [user?.company_id]);

  const toggleRecruiter = (recruiterId) => {
    setSelectedRecruiterIds(prev =>
      prev.includes(recruiterId)
        ? prev.filter(id => id !== recruiterId)
        : [...prev, recruiterId]
    );
  };

  const handleSelectAllRecruiters = () => {
    if (selectedRecruiterIds.length === companyRecruiters.length) {
      setSelectedRecruiterIds([]);
    } else {
      setSelectedRecruiterIds(companyRecruiters.map(r => r.id));
    }
  };

  // Submit Handler
  const handleSubmit = async (submitStatus) => {
    if (!validateForm() || submitting) {
      triggerToast('Please correct validation errors first', 'error');
      return;
    }

    try {
      setSubmitting(true);
      setGlobalError(null);

      // Map selected skill IDs back to skill_name strings
      const mappedSkills = formFields.required_skills.map(skillId => {
        const found = availableSkills.find(s => s.id === skillId || s.id === Number(skillId) || s.skill_name === skillId || s.label === skillId);
        if (found) return found.skill_name || found.label || String(skillId);
        return String(skillId);
      }).filter(Boolean);

      // Clean salary fields
      const salaryMinVal = formFields.salary_min && !isNaN(parseFloat(formFields.salary_min)) ? parseFloat(formFields.salary_min) : null;
      const salaryMaxVal = formFields.salary_max && !isNaN(parseFloat(formFields.salary_max)) ? parseFloat(formFields.salary_max) : null;

      // Format application deadline safely (set to 23:59:59Z if YYYY-MM-DD string)
      let formattedDeadline = null;
      if (formFields.application_deadline) {
        const dateStr = formFields.application_deadline.includes('T')
          ? formFields.application_deadline
          : `${formFields.application_deadline}T23:59:59Z`;
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          formattedDeadline = d.toISOString();
        }
      }

      // Structure Description (concat responsibilities/requirements/benefits if not empty)
      let fullDescription = formFields.description.trim();
      if (formFields.responsibilities.trim()) {
        fullDescription += `\n\n### Responsibilities\n${formFields.responsibilities.trim()}`;
      }
      if (formFields.requirements.trim()) {
        fullDescription += `\n\n### Requirements\n${formFields.requirements.trim()}`;
      }
      if (formFields.benefits.trim()) {
        fullDescription += `\n\n### Benefits\n${formFields.benefits.trim()}`;
      }

      // Build schema matching payload
      const jobPayload = {
        title: formFields.title.trim(),
        description: fullDescription,
        location: formFields.location.trim(),
        job_type: formFields.job_type,
        experience_level: formFields.experience_level,
        work_mode: formFields.work_mode,
        status: submitStatus, // 'draft' or 'open'
        salary_min: salaryMinVal,
        salary_max: salaryMaxVal,
        application_deadline: formattedDeadline,
        required_skills: mappedSkills,
        hiring_pipeline: pipelineStages,
        recruiter_ids: (selectedRecruiterIds || []).map(id => Number(id)).filter(id => !isNaN(id) && id > 0)
      };

      console.log('Sending job creation payload:', jobPayload);
      const createdJob = await jobService.createJob(jobPayload);
      
      triggerToast(
        submitStatus === 'open' 
          ? 'Job listing has been published successfully!' 
          : 'Job draft has been saved successfully!'
      );
      setSuccessMode(true);

      if (submitStatus === 'open' && createdJob) {
        notificationService.notifyJobPublished(createdJob.id, createdJob.title || formFields.title, user)
          .catch(err => console.error('Notification publishing trigger error:', err));
      }
    } catch (err) {
      console.error('Job creation error:', err, 'Response data:', err.response?.data);
      const errorsMap = parseFormErrors(err);
      const backendMessage = extractErrorMessage(err);
      if (errorsMap) {
        setFieldErrors(errorsMap);
        const detailedMsg = Object.entries(errorsMap).map(([field, msg]) => `${field}: ${msg}`).join(', ');
        setGlobalError(detailedMsg || backendMessage);
        triggerToast('Please correct validation errors first', 'error');
      } else {
        setGlobalError(backendMessage || 'Failed to create job posting. Please check your connection and try again.');
        triggerToast(backendMessage || 'Failed to save job posting', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormFields({
      title: '',
      department: 'Engineering',
      job_type: 'Full-time',
      work_mode: 'Onsite',
      location: '',
      experience_level: 'Entry',
      salary_min: '',
      salary_max: '',
      application_deadline: '',
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      required_skills: []
    });
    setPipelineStages(DEFAULT_PIPELINE);
    setFieldErrors({});
    setGlobalError(null);
    setSuccessMode(false);
  };

  const isAuthorized = Boolean(user?.is_owner || user?.role === 'company_owner' || (user?.role === 'recruiter' && user?.company_id));

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4 bg-white dark:bg-[#0d1017] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-lg animate-in fade-in duration-200">
        <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Access Restricted</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          You must be a Recruiter or Company Owner linked to a registered company to create job postings.
        </p>
      </div>
    );
  }

  if (successMode) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}
        <Card className="text-center p-8 sm:p-12 border border-slate-100 bg-white rounded-3xl space-y-6 shadow-xl shadow-slate-100/50">
          <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Job Posting Saved!</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Your job posting is now stored in the recruitment registry. Candidates can apply matching its criteria.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={handleReset}
              className="w-full sm:w-auto rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Create Another Job</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/recruiter/jobs')}
              className="w-full sm:w-auto rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Go to Manage Jobs</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast popup */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Custom Pipeline Modal */}
      <PipelineCustomizerModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        initialStages={pipelineStages}
        onSaveStages={(newStages) => setPipelineStages(newStages)}
      />

      <PageHeader
        title="Create Job Posting"
        subtitle="Configure recruitment parameters, required skills, and publish candidate search listings."
      />

      {globalError && (
        <div className="flex items-center gap-3 p-4 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{globalError}</span>
        </div>
      )}

      {/* 2-COLUMN GRID FORM PANEL */}
      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Form Sections (A, B, C, D, E) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Card A: Basic Information */}
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                <Building className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">A. Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input
                  label="Job Title *"
                  id="title"
                  value={formFields.title}
                  onChange={handleInputChange}
                  error={fieldErrors.title}
                  placeholder="e.g. Senior Fullstack Engineer"
                  disabled={submitting}
                  required
                />
              </div>

              <Select
                label="Department"
                id="department"
                value={formFields.department}
                onChange={handleInputChange}
                options={['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Human Resources', 'Finance']}
                disabled={submitting}
              />

              <Select
                label="Employment Type"
                id="job_type"
                value={formFields.job_type}
                onChange={handleInputChange}
                options={['Full-time', 'Part-time', 'Contract', 'Internship']}
                disabled={submitting}
              />

              <Select
                label="Work Mode"
                id="work_mode"
                value={formFields.work_mode}
                onChange={handleInputChange}
                options={['Remote', 'Hybrid', 'Onsite']}
                disabled={submitting}
              />

              <Input
                label="Location *"
                id="location"
                value={formFields.location}
                onChange={handleInputChange}
                error={fieldErrors.location}
                placeholder="e.g. San Francisco, CA or Remote"
                disabled={submitting}
                required
              />

              <Select
                label="Experience Required"
                id="experience_level"
                value={formFields.experience_level}
                options={['Fresher', 'Entry', 'Mid', 'Senior']}
                onChange={handleInputChange}
                disabled={submitting}
              />

              {/* Segmented Auto-Advancing Application Deadline */}
              <SegmentedDateInput
                label="Application Deadline"
                id="application_deadline"
                value={formFields.application_deadline}
                onChange={handleInputChange}
                disabled={submitting}
              />

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <Input
                  label="Min Salary ($ / year)"
                  id="salary_min"
                  type="number"
                  value={formFields.salary_min}
                  onChange={handleInputChange}
                  error={fieldErrors.salary_min}
                  placeholder="e.g. 80000"
                  disabled={submitting}
                />
                <Input
                  label="Max Salary ($ / year)"
                  id="salary_max"
                  type="number"
                  value={formFields.salary_max}
                  onChange={handleInputChange}
                  error={fieldErrors.salary_max}
                  placeholder="e.g. 120000"
                  disabled={submitting}
                />
              </div>
            </div>
          </Card>

          {/* Card B: Job Details */}
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">B. Job Details</h2>
            </div>

            <div className="space-y-5">
              <Textarea
                label="Job Description * (Markdown supported)"
                id="description"
                rows={5}
                value={formFields.description}
                onChange={handleInputChange}
                error={fieldErrors.description}
                placeholder="Describe the job position, company, overview details..."
                disabled={submitting}
                required
              />

              <Textarea
                label="Responsibilities"
                id="responsibilities"
                rows={3}
                value={formFields.responsibilities}
                onChange={handleInputChange}
                placeholder="What responsibilities will this role take on?"
                disabled={submitting}
              />

              <Textarea
                label="Requirements"
                id="requirements"
                rows={3}
                value={formFields.requirements}
                onChange={handleInputChange}
                placeholder="What qualifications or requirements does the role require?"
                disabled={submitting}
              />

              <Textarea
                label="Benefits"
                id="benefits"
                rows={3}
                value={formFields.benefits}
                onChange={handleInputChange}
                placeholder="Benefits, healthcare, PTO, equity options..."
                disabled={submitting}
              />
            </div>
          </Card>

          {/* Card C: REQUIRED SKILLS SECTION */}
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  C. Required Skills & Competencies *
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full">
                  {formFields.required_skills.length} Skills Selected
                </span>
              </div>
            </div>

            <MultiSelect
              id="required_skills"
              options={availableSkills}
              selectedValues={formFields.required_skills}
              onChange={handleMultiSelectChange}
              error={fieldErrors.required_skills}
              placeholder="Search skills (e.g. React, Python, Docker)..."
              disabled={submitting || skillsLoading}
              inline={true}
              showCategoryFilters={false}
            />
            {skillsLoading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Spinner size="sm" />
                <span>Syncing skills registry...</span>
              </div>
            )}
          </Card>

          {/* Card D: Hiring Pipeline */}
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">D. Hiring Pipeline</h2>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsPipelineModalOpen(true)}
                className="rounded-xl font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 transition-all"
              >
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Customize Hiring Pipeline</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
              {pipelineStages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{stage}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Card E: Assign Recruiters */}
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">E. Assign Recruiters</h2>
              </div>
              {companyRecruiters.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllRecruiters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {selectedRecruiterIds.length === companyRecruiters.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {recruitersLoading ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 py-2">
                <Spinner size="sm" />
                <span>Loading recruiters...</span>
              </div>
            ) : companyRecruiters.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">No recruiters found in company.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {companyRecruiters.map(recruiter => {
                  const isSelected = selectedRecruiterIds.includes(recruiter.id);
                  return (
                    <div
                      key={recruiter.id}
                      onClick={() => toggleRecruiter(recruiter.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 shadow-2xs'
                          : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {recruiter.name?.charAt(0) || 'R'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{recruiter.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">{recruiter.email}</p>
                        </div>
                      </div>
                      <div>
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: COMPLETELY FIXED IN VIEWPORT WITHOUT SCROLLING */}
        <div className="lg:col-span-1 sticky top-28 self-start space-y-4">
          
          {/* Real-time Live Job Preview Card */}
          <JobPreviewCard
            formFields={formFields}
            pipelineStages={pipelineStages}
            availableSkills={availableSkills}
            companyRecruiters={companyRecruiters}
            selectedRecruiterIds={selectedRecruiterIds}
          />

          {/* Publish & Draft Actions Section Card */}
          <Card className="p-5 border border-slate-200/80 bg-white dark:bg-[#15161e] rounded-3xl space-y-3 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <ListTodo className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">Publish & Save</h3>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleSubmit('open')}
                isLoading={submitting}
                disabled={submitting}
                className="w-full rounded-2xl py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Publish Job Posting</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => handleSubmit('draft')}
                isLoading={submitting}
                disabled={submitting}
                className="w-full rounded-2xl py-3 font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FileClock className="w-4.5 h-4.5" />
                <span>Save as Draft</span>
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default CreateJob;
