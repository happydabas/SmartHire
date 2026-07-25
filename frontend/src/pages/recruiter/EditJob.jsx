import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  Sparkles,
  ClipboardList,
  ArrowLeft,
  GraduationCap,
  Building,
  RotateCcw,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { jobService } from '@/services/jobs/jobService';
import { skillsService } from '@/services/skills/skillsService';
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
import { parseFormErrors, extractErrorMessage } from '@/utils/errorParser';

// Predefined hiring pipeline templates (matching CreateJob presets)
const PIPELINE_TEMPLATES = [
  {
    id: 'standard_tech',
    name: 'Standard Technical Pipeline',
    stages: ['Applied', 'Technical Screening', 'Coding Challenge', 'Technical Interview', 'HR Interview', 'Offer']
  },
  {
    id: 'standard_commercial',
    name: 'Standard Sales / Commercial Pipeline',
    stages: ['Applied', 'Screening Call', 'Case Presentation', 'Final Interview', 'Offer']
  },
  {
    id: 'fast_track',
    name: 'Simple Fast-track Pipeline',
    stages: ['Applied', 'Final Interview', 'Offer']
  },
  {
    id: 'default',
    name: 'Default Pipeline',
    stages: ['Applied', 'Screening', 'Technical Interview', 'Hr Interview', 'Offer']
  }
];

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
    pipeline_template_id: 'default',
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
      // Main description is text before the first section heading
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

  // Helper to match pipeline template by stage names
  const getPipelineTemplateId = (pipeline) => {
    if (!pipeline || !pipeline.stages || pipeline.stages.length === 0) return 'default';
    const stageNames = pipeline.stages.map(s => s.stage_name);
    
    const matched = PIPELINE_TEMPLATES.find(p => 
      p.stages.length === stageNames.length && 
      p.stages.every((st, idx) => st.toLowerCase() === stageNames[idx].toLowerCase())
    );
    
    return matched ? matched.id : 'default';
  };

  // 1. Fetch skills and job details on mount
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        setGlobalError(null);

        // Fetch skills list
        let skillsCatalog = MASTER_SKILLS_CATALOG;
        try {
          setSkillsLoading(true);
          const data = await skillsService.getSkillsList();
          if (data && data.length > 0) {
            skillsCatalog = data;
          }
        } catch (err) {
          console.warn('Skills endpoint 403 or failure, falling back to static skills catalog.');
        }
        setAvailableSkills(skillsCatalog);

        // Fetch Job details
        const job = await jobService.getJobDetails(id);
        setOriginalStatus(job.status);
        
        // Enforce ownership: only job creator or company owner can edit
        if (user.role === 'recruiter' && job.recruiter_id !== user.id) {
          throw new Error('Access denied: You are not authorized to edit this job posting.');
        }

        const parsedDesc = parseDescription(job.description);
        const deadlineDate = job.application_deadline 
          ? new Date(job.application_deadline).toISOString().split('T')[0] 
          : '';

        // Map skill names back to IDs in our catalog
        const selectedSkillIds = (job.skills || []).map(skill => {
          const match = skillsCatalog.find(s => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase());
          return match ? match.id : skill.id;
        });

        // Resolve pipeline template
        const pipelineId = getPipelineTemplateId(job.pipeline);

        // Try to guess department from title
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
          pipeline_template_id: pipelineId,
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

      // Map selected skill IDs to skill_name strings
      const mappedSkills = formFields.required_skills.map(skillId => {
        const found = availableSkills.find(s => s.id === skillId);
        return found ? found.skill_name : skillId;
      });

      // Find the pipeline stages list
      const selectedPipelineObj = PIPELINE_TEMPLATES.find(p => p.id === formFields.pipeline_template_id);
      const pipelineStages = selectedPipelineObj ? selectedPipelineObj.stages : PIPELINE_TEMPLATES[3].stages;

      // Clean salary numbers
      const salaryMinVal = formFields.salary_min ? parseFloat(formFields.salary_min) : null;
      const salaryMaxVal = formFields.salary_max ? parseFloat(formFields.salary_max) : null;

      // Format description with sub-sections
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
        status: updatedStatus, // 'draft' or 'open' or 'closed'
        salary_min: salaryMinVal,
        salary_max: salaryMaxVal,
        application_deadline: formFields.application_deadline ? new Date(formFields.application_deadline).toISOString() : null,
        required_skills: mappedSkills,
        hiring_pipeline: pipelineStages
      };

      await jobService.updateJob(id, jobPayload);
      
      triggerToast('Job listing updated successfully!');

      // Trigger notification if status changed
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

  const selectedPipeline = PIPELINE_TEMPLATES.find(p => p.id === formFields.pipeline_template_id) || PIPELINE_TEMPLATES[3];
  const isDraftStatus = formFields.status?.toLowerCase() === 'draft';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast alert popup */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
          title="Back to Job Listings"
          disabled={submitting}
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Edit Job Posting</h1>
          <p className="text-slate-500 text-sm mt-1">Modify details, skills checklist, or publish this listing.</p>
        </div>
      </div>

      {globalError && (
        <div className="flex items-center gap-3 p-4 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Form panel */}
      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Main configurations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card A: Basic Info */}
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">A. Basic Information</h2>
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

              <Input
                label="Application Deadline"
                id="application_deadline"
                type="date"
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

          {/* Card B: Details descriptions */}
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">B. Job Details</h2>
            </div>

            <div className="space-y-5">
              <Textarea
                label="Job Description * (Markdown supported)"
                id="description"
                rows={5}
                value={formFields.description}
                onChange={handleInputChange}
                error={fieldErrors.description}
                placeholder="Describe the job position, company overview..."
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
        </div>

        {/* RIGHT COLUMN - Skills, flow templates, actions */}
        <div className="space-y-6">
          {/* Card C: Required Skills */}
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">C. Required Skills</h2>
            </div>

            <MultiSelect
              label="Select Master Skills *"
              id="required_skills"
              options={availableSkills}
              selectedValues={formFields.required_skills}
              onChange={handleMultiSelectChange}
              error={fieldErrors.required_skills}
              placeholder="Search & add skills..."
              disabled={submitting || skillsLoading}
            />
            {skillsLoading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Spinner size="sm" />
                <span>Syncing skills catalog...</span>
              </div>
            )}
          </Card>

          {/* Card D: Hiring Pipeline selection */}
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">D. Hiring Pipeline</h2>
            </div>

            <Select
              label="Choose Recruitment Flow"
              id="pipeline_template_id"
              value={formFields.pipeline_template_id}
              onChange={handleInputChange}
              options={PIPELINE_TEMPLATES.map(p => ({ label: p.name, value: p.id }))}
              disabled={submitting}
            />

            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hiring Stages Sequence</label>
              <div className="flex flex-col gap-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3.5 max-h-48 overflow-y-auto">
                {selectedPipeline.stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-extrabold">{idx + 1}</span>
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card E: Actions submit buttons */}
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">E. Save Changes</h2>
            </div>

            <div className="flex flex-col gap-3">
              {/* If it's currently a Draft, offer the ability to publish it directly! */}
              {isDraftStatus ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleUpdate('open')}
                    isLoading={submitting}
                    disabled={submitting}
                    className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2"
                  >
                    <span>Publish Job Listing</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleUpdate('draft')}
                    isLoading={submitting}
                    disabled={submitting}
                    className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50"
                  >
                    <span>Save Draft Changes</span>
                  </Button>
                </>
              ) : (
                // If it's already Active (open) or Closed, allow updating its content directly
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleUpdate(formFields.status)}
                  isLoading={submitting}
                  disabled={submitting}
                  className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2"
                >
                  <span>Save Job Details</span>
                </Button>
              )}

              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/recruiter/jobs')}
                disabled={submitting}
                className="w-full rounded-xl py-3 font-bold border border-transparent hover:bg-slate-100 text-slate-500"
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
