import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  Sparkles,
  ClipboardList,
  GraduationCap,
  Building,
  RotateCcw,
  AlertCircle,
  FileCheck,
  Sliders,
  ListTodo
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { jobService } from '@/services/jobs/jobService';
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
import SkeletonProfile from '@/components/common/SkeletonProfile';
import SegmentedDateInput from '@/components/ui/SegmentedDateInput';
import PipelineCustomizerModal from '@/components/ui/PipelineCustomizerModal';
import JobPreviewCard from '@/components/ui/JobPreviewCard';
import PageHeader from '@/components/ui/PageHeader';
import { parseFormErrors, extractErrorMessage } from '@/utils/errorParser';

const DEFAULT_PIPELINE = ['Applied', 'Screening', 'Technical Interview', 'HR Interview', 'Offer'];

export function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [originalStatus, setOriginalStatus] = useState('draft');

  // Loading, Submitting & Success states
  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Available list options
  const [availableSkills, setAvailableSkills] = useState([]);
  const [globalError, setGlobalError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Hiring pipeline state
  const [pipelineStages, setPipelineStages] = useState(DEFAULT_PIPELINE);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

  // Form Fields
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
    required_skills: [],
    status: 'draft'
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Helper to parse description sections back into separate fields
  const parseDescription = (desc) => {
    if (!desc) return { description: '', responsibilities: '', requirements: '', benefits: '' };
    
    let description = desc;
    let responsibilities = '';
    let requirements = '';
    let benefits = '';

    const respIndex = desc.indexOf('### Responsibilities');
    const reqIndex = desc.indexOf('### Requirements');
    const benIndex = desc.indexOf('### Benefits');

    const indexes = [
      { key: 'resp', index: respIndex },
      { key: 'req', index: reqIndex },
      { key: 'ben', index: benIndex }
    ].filter(i => i.index !== -1).sort((a, b) => a.index - b.index);

    if (indexes.length > 0) {
      description = desc.substring(0, indexes[0].index).trim();
      
      for (let i = 0; i < indexes.length; i++) {
        const current = indexes[i];
        const next = indexes[i + 1];
        
        let headerLabel = '';
        if (current.key === 'resp') headerLabel = '### Responsibilities';
        if (current.key === 'req') headerLabel = '### Requirements';
        if (current.key === 'ben') headerLabel = '### Benefits';

        const contentStart = current.index + headerLabel.length;
        const contentEnd = next ? next.index : desc.length;
        const content = desc.substring(contentStart, contentEnd).trim();
        
        if (current.key === 'resp') responsibilities = content;
        if (current.key === 'req') requirements = content;
        if (current.key === 'ben') benefits = content;
      }
    }

    return { description, responsibilities, requirements, benefits };
  };

  // Fetch skills and job details on mount
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        setGlobalError(null);

        setAvailableSkills(MASTER_SKILLS_CATALOG);
        setSkillsLoading(false);

        const job = await jobService.getJobDetails(id);
        setOriginalStatus(job.status);
        
        if (user.role === 'recruiter' && job.recruiter_id !== user.id) {
          throw new Error('Access denied: You are not authorized to edit this job posting.');
        }

        const parsedDesc = parseDescription(job.description);
        const deadlineDate = job.application_deadline 
          ? new Date(job.application_deadline).toISOString().split('T')[0] 
          : '';

        const selectedSkillIds = (job.skills || []).map(skill => {
          const match = MASTER_SKILLS_CATALOG.find(s => s.skill_name.toLowerCase() === (skill.skill_name || '').toLowerCase());
          return match ? match.id : skill.id;
        });

        if (job.pipeline?.stages && job.pipeline.stages.length > 0) {
          setPipelineStages(job.pipeline.stages.map(s => s.stage_name));
        } else {
          setPipelineStages(DEFAULT_PIPELINE);
        }

        const getDepartmentGuess = (title) => {
          const t = title?.toLowerCase() || '';
          if (t.includes('engineer') || t.includes('dev') || t.includes('tech') || t.includes('data') || t.includes('software')) return 'Engineering';
          if (t.includes('product') || t.includes('pm')) return 'Product';
          if (t.includes('design') || t.includes('ux') || t.includes('ui')) return 'Design';
          if (t.includes('marketing')) return 'Marketing';
          if (t.includes('sales')) return 'Sales';
          if (t.includes('hr') || t.includes('talent')) return 'Human Resources';
          return 'Engineering';
        };

        setFormFields({
          title: job.title || '',
          department: getDepartmentGuess(job.title),
          job_type: job.job_type?.value || job.job_type || 'Full-time',
          work_mode: job.work_mode?.value || job.work_mode || 'Onsite',
          location: job.location || '',
          experience_level: job.experience_level?.value || job.experience_level || 'Entry',
          salary_min: job.salary_min !== null ? String(job.salary_min) : '',
          salary_max: job.salary_max !== null ? String(job.salary_max) : '',
          application_deadline: deadlineDate,
          description: parsedDesc.description,
          responsibilities: parsedDesc.responsibilities,
          requirements: parsedDesc.requirements,
          benefits: parsedDesc.benefits,
          required_skills: selectedSkillIds,
          status: job.status || 'draft'
        });
      } catch (err) {
        console.error('Initialize EditJob error:', err);
        setGlobalError(err.message || 'Failed to retrieve job details. Check connection.');
      } finally {
        setLoading(false);
        setSkillsLoading(false);
      }
    };

    initializeForm();
  }, [id, user]);

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

  // Form validation checks
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

  // Handle Update Submit
  const handleUpdate = async (updatedStatus) => {
    if (!validateForm() || submitting) {
      triggerToast('Please correct validation errors first', 'error');
      return;
    }

    try {
      setSubmitting(true);
      setGlobalError(null);

      const mappedSkills = formFields.required_skills.map(skillId => {
        const found = availableSkills.find(s => s.id === skillId || s.id === Number(skillId) || s.skill_name === skillId);
        return found ? found.skill_name : String(skillId);
      });

      const salaryMinVal = formFields.salary_min ? parseFloat(formFields.salary_min) : null;
      const salaryMaxVal = formFields.salary_max ? parseFloat(formFields.salary_max) : null;

      let fullDescription = formFields.description;
      if (formFields.responsibilities.trim()) {
        fullDescription += `\n\n### Responsibilities\n${formFields.responsibilities}`;
      }
      if (formFields.requirements.trim()) {
        fullDescription += `\n\n### Requirements\n${formFields.requirements}`;
      }
      if (formFields.benefits.trim()) {
        fullDescription += `\n\n### Benefits\n${formFields.benefits}`;
      }

      const jobPayload = {
        title: formFields.title.trim(),
        description: fullDescription,
        location: formFields.location.trim(),
        job_type: formFields.job_type,
        experience_level: formFields.experience_level,
        work_mode: formFields.work_mode,
        status: updatedStatus,
        salary_min: salaryMinVal,
        salary_max: salaryMaxVal,
        application_deadline: formFields.application_deadline ? new Date(formFields.application_deadline).toISOString() : null,
        required_skills: mappedSkills,
        hiring_pipeline: pipelineStages
      };

      await jobService.updateJob(id, jobPayload);
      
      triggerToast('Job listing updated successfully!');

      if (originalStatus !== updatedStatus) {
        if (updatedStatus === 'open') {
          if (originalStatus === 'draft') {
            notificationService.notifyJobPublished(Number(id), jobPayload.title, user)
              .catch(err => console.error('Notification publishing trigger error:', err));
          } else if (originalStatus === 'closed') {
            notificationService.notifyJobReopened(Number(id), jobPayload.title, user)
              .catch(err => console.error('Notification reopening trigger error:', err));
          }
        } else if (updatedStatus === 'closed' && originalStatus === 'open') {
          notificationService.notifyJobClosed(Number(id), jobPayload.title, user)
            .catch(err => console.error('Notification closure trigger error:', err));
        }
      }
      
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1500);
    } catch (err) {
      console.error('Job update error:', err);
      const errorsMap = parseFormErrors(err);
      if (errorsMap) {
        setFieldErrors(errorsMap);
        triggerToast('Please correct validation errors first', 'error');
      } else {
        const backendMessage = extractErrorMessage(err);
        setGlobalError(backendMessage || 'Failed to update job posting. Please check your connection.');
        triggerToast(backendMessage || 'Failed to update job posting', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  if (globalError && !formFields.title) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-lg">
        <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Access Denied</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{globalError}</p>
        <Button variant="secondary" size="md" onClick={() => navigate('/recruiter/jobs')} className="w-full mt-2 rounded-xl">
          Return to Manage Jobs
        </Button>
      </div>
    );
  }

  const isDraftStatus = formFields.status?.toLowerCase() === 'draft';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast alert popup */}
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
        title="Edit Job Posting"
        subtitle="Modify job parameters, required competencies, or update publishing status."
        backUrl="/recruiter/jobs"
      />

      {globalError && (
        <div className="flex items-center gap-3 p-4 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{globalError}</span>
        </div>
      )}

      {/* 2-COLUMN GRID FORM PANEL */}
      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* LEFT COLUMN: Input Form Sections (A, B, C, D) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Card A: Basic Info */}
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
        </div>

        {/* RIGHT COLUMN: COMPLETELY FIXED IN VIEWPORT WITHOUT SCROLLING */}
        <div className="lg:col-span-1 sticky top-28 self-start space-y-4">
          
          {/* Real-time Live Job Preview Card */}
          <JobPreviewCard
            formFields={formFields}
            pipelineStages={pipelineStages}
            availableSkills={availableSkills}
          />

          {/* Save Changes Action Card */}
          <Card className="p-5 border border-slate-200/80 bg-white dark:bg-[#15161e] rounded-3xl space-y-3 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">Save Changes</h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {isDraftStatus ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleUpdate('open')}
                    isLoading={submitting}
                    disabled={submitting}
                    className="w-full rounded-2xl py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                  >
                    <span>Publish Job Listing</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleUpdate('draft')}
                    isLoading={submitting}
                    disabled={submitting}
                    className="w-full rounded-2xl py-3 font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span>Save Draft Changes</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleUpdate(formFields.status)}
                  isLoading={submitting}
                  disabled={submitting}
                  className="w-full rounded-2xl py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                >
                  <span>Save Job Details</span>
                </Button>
              )}

              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/recruiter/jobs')}
                disabled={submitting}
                className="w-full rounded-2xl py-3 font-bold border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <span>Cancel</span>
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default EditJob;
