import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ResumeReviewForm({ parsedData, onSave, onCancel, saving }) {
  const [personalInfo, setPersonalInfo] = useState(parsedData?.personal_info || { name: '', email: '', phone: '', location: '', linkedin_url: '', github_url: '', portfolio_website: '' });
  const [summary, setSummary] = useState(parsedData?.summary || '');
  const [skills, setSkills] = useState(parsedData?.skills || []);
  const [education, setEducation] = useState(parsedData?.education || []);
  const [experience, setExperience] = useState(parsedData?.experience || []);
  const [projects, setProjects] = useState(parsedData?.projects || []);
  const [certifications, setCertifications] = useState(parsedData?.certifications || []);

  const [newSkill, setNewSkill] = useState('');

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    setEducation(prev => [...prev, { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '' }]);
  };

  const handleEducationChange = (index, field, value) => {
    const nextEdu = [...education];
    nextEdu[index][field] = value;
    setEducation(nextEdu);
  };

  const handleRemoveEducation = (index) => {
    setEducation(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddExperience = () => {
    setExperience(prev => [...prev, { company_name: '', job_title: '', employment_type: 'Full-time', start_date: '', end_date: '', current_job: false, responsibilities: '' }]);
  };

  const handleExperienceChange = (index, field, value) => {
    const nextExp = [...experience];
    nextExp[index][field] = value;
    setExperience(nextExp);
  };

  const handleRemoveExperience = (index) => {
    setExperience(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddProject = () => {
    setProjects(prev => [...prev, { project_name: '', description: '', technologies_used: '', github_link: '', live_demo_link: '' }]);
  };

  const handleProjectChange = (index, field, value) => {
    const nextProj = [...projects];
    nextProj[index][field] = value;
    setProjects(nextProj);
  };

  const handleRemoveProject = (index) => {
    setProjects(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddCertification = () => {
    setCertifications(prev => [...prev, { certification_name: '', organization: '', issue_date: '', expiry_date: '', credential_url: '' }]);
  };

  const handleCertificationChange = (index, field, value) => {
    const nextCert = [...certifications];
    nextCert[index][field] = value;
    setCertifications(nextCert);
  };

  const handleRemoveCertification = (index) => {
    setCertifications(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personalInfo.name?.trim()) {
      toast.error('Full name is required in Personal Information');
      return;
    }
    
    const cleanedProjects = projects.map(p => ({
      ...p,
      technologies_used: typeof p.technologies_used === 'string' 
        ? p.technologies_used.split(',').map(t => t.trim()).filter(Boolean)
        : p.technologies_used
    }));

    onSave({
      personal_info: personalInfo,
      summary,
      skills,
      education,
      experience,
      projects: cleanedProjects,
      certifications
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      
      {/* 1. Personal Info Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            id="review-name"
            label="Full Name"
            value={personalInfo.name || ''}
            onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
            required
          />
          <Input
            id="review-email"
            label="Email"
            type="email"
            value={personalInfo.email || ''}
            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
          />
          <Input
            id="review-phone"
            label="Phone Number"
            value={personalInfo.phone || ''}
            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
          />
          <Input
            id="review-location"
            label="Location"
            value={personalInfo.location || ''}
            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
          />
          <Input
            id="review-linkedin"
            label="LinkedIn URL"
            value={personalInfo.linkedin_url || ''}
            onChange={(e) => handlePersonalInfoChange('linkedin_url', e.target.value)}
          />
          <Input
            id="review-github"
            label="GitHub URL"
            value={personalInfo.github_url || ''}
            onChange={(e) => handlePersonalInfoChange('github_url', e.target.value)}
          />
        </div>
      </div>

      {/* 2. Professional Summary */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
          Professional Summary
        </h3>
        <div className="space-y-1.5">
          <label htmlFor="review-summary" className="block text-xs font-bold text-slate-550">Summary Text</label>
          <textarea
            id="review-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* 3. Skills */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
          Skills
        </h3>
        <div className="flex gap-2 max-w-md">
          <Input
            id="review-new-skill"
            placeholder="Add a skill (e.g. FastAPI)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddSkill}
            className="rounded-xl px-4 font-bold shrink-0 self-end mb-1"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill, index) => (
            <div key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700">
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label={`Remove skill ${skill}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Education */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            Education
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddEducation}
            className="rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Education
          </Button>
        </div>
        <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
          {education.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6 first:pt-0">
              <Input
                id={`edu-inst-${index}`}
                label="Institution"
                value={edu.institution || ''}
                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                required
              />
              <Input
                id={`edu-deg-${index}`}
                label="Degree"
                value={edu.degree || ''}
                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                required
              />
              <Input
                id={`edu-field-${index}`}
                label="Field of Study"
                value={edu.field_of_study || ''}
                onChange={(e) => handleEducationChange(index, 'field_of_study', e.target.value)}
                required
              />
              <Input
                id={`edu-start-${index}`}
                label="Start Date"
                placeholder="YYYY-MM-DD"
                value={edu.start_date || ''}
                onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                required
              />
              <Input
                id={`edu-end-${index}`}
                label="End Date"
                placeholder="YYYY-MM-DD"
                value={edu.end_date || ''}
                onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
              />
              <Input
                id={`edu-grade-${index}`}
                label="Grade / CGPA"
                value={edu.grade || ''}
                onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
              />
              <div className="flex items-end pb-1 col-span-full md:col-span-1 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveEducation(index)}
                  className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50/50 flex items-center gap-1 text-xs px-3 py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Education
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Experience */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            Work Experience
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddExperience}
            className="rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Experience
          </Button>
        </div>
        <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
          {experience.map((exp, index) => (
            <div key={index} className="space-y-4 pt-6 first:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  id={`exp-comp-${index}`}
                  label="Company Name"
                  value={exp.company_name || ''}
                  onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                  required
                />
                <Input
                  id={`exp-title-${index}`}
                  label="Job Title"
                  value={exp.job_title || ''}
                  onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500">Employment Type</label>
                  <select
                    value={exp.employment_type || 'Full-time'}
                    onChange={(e) => handleExperienceChange(index, 'employment_type', e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <Input
                  id={`exp-start-${index}`}
                  label="Start Date"
                  placeholder="YYYY-MM-DD"
                  value={exp.start_date || ''}
                  onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                  required
                />
                {!exp.current_job && (
                  <Input
                    id={`exp-end-${index}`}
                    label="End Date"
                    placeholder="YYYY-MM-DD"
                    value={exp.end_date || ''}
                    onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                    required
                  />
                )}
                <div className="flex items-center gap-2 pt-6 pl-2">
                  <input
                    type="checkbox"
                    id={`exp-current-${index}`}
                    checked={exp.current_job || false}
                    onChange={(e) => handleExperienceChange(index, 'current_job', e.target.checked)}
                    className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor={`exp-current-${index}`} className="text-xs font-bold text-slate-450">Currently work here</label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-450">Responsibilities</label>
                <textarea
                  value={exp.responsibilities || ''}
                  onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveExperience(index)}
                  className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50/50 flex items-center gap-1 text-xs px-3 py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Experience
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Projects */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            Projects
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddProject}
            className="rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </Button>
        </div>
        <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
          {projects.map((proj, index) => (
            <div key={index} className="space-y-4 pt-6 first:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  id={`proj-name-${index}`}
                  label="Project Name"
                  value={proj.project_name || ''}
                  onChange={(e) => handleProjectChange(index, 'project_name', e.target.value)}
                />
                <Input
                  id={`proj-tech-${index}`}
                  label="Technologies Used"
                  value={Array.isArray(proj.technologies_used) ? proj.technologies_used.join(', ') : proj.technologies_used || ''}
                  onChange={(e) => handleProjectChange(index, 'technologies_used', e.target.value)}
                />
                <Input
                  id={`proj-git-${index}`}
                  label="GitHub Link"
                  value={proj.github_link || ''}
                  onChange={(e) => handleProjectChange(index, 'github_link', e.target.value)}
                />
                <Input
                  id={`proj-live-${index}`}
                  label="Live Demo Link"
                  value={proj.live_demo_link || ''}
                  onChange={(e) => handleProjectChange(index, 'live_demo_link', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-450">Project Description</label>
                <textarea
                  value={proj.description || ''}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveProject(index)}
                  className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50/50 flex items-center gap-1 text-xs px-3 py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Project
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Certifications */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            Certifications
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCertification}
            className="rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Certification
          </Button>
        </div>
        <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
          {certifications.map((cert, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6 first:pt-0">
              <Input
                id={`cert-name-${index}`}
                label="Certification Name"
                value={cert.certification_name || ''}
                onChange={(e) => handleCertificationChange(index, 'certification_name', e.target.value)}
              />
              <Input
                id={`cert-org-${index}`}
                label="Issuing Organization"
                value={cert.organization || ''}
                onChange={(e) => handleCertificationChange(index, 'organization', e.target.value)}
              />
              <Input
                id={`cert-issue-${index}`}
                label="Issue Date"
                value={cert.issue_date || ''}
                onChange={(e) => handleCertificationChange(index, 'issue_date', e.target.value)}
              />
              <Input
                id={`cert-exp-${index}`}
                label="Expiry Date"
                value={cert.expiry_date || ''}
                onChange={(e) => handleCertificationChange(index, 'expiry_date', e.target.value)}
              />
              <Input
                id={`cert-url-${index}`}
                label="Credential URL"
                value={cert.credential_url || ''}
                onChange={(e) => handleCertificationChange(index, 'credential_url', e.target.value)}
              />
              <div className="flex items-end pb-1 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveCertification(index)}
                  className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50/50 flex items-center gap-1 text-xs px-3 py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Certification
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl font-bold px-6 py-2.5"
        >
          Cancel & Exit
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
          className="rounded-xl font-black px-6 py-2.5 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>{saving ? 'Saving Records...' : 'Confirm and Save Data'}</span>
        </Button>
      </div>

    </form>
  );
}

export default ResumeReviewForm;
