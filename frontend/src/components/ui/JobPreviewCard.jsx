import React from 'react';
import {
  MapPin,
  DollarSign,
  Calendar,
  Layers,
  UserCheck,
  GraduationCap,
  Eye
} from 'lucide-react';
import Card from './Card';
import Badge from './Badge';

export const JobPreviewCard = ({
  formFields,
  pipelineStages = [],
  availableSkills = [],
  companyRecruiters = [],
  selectedRecruiterIds = []
}) => {
  const {
    title,
    department,
    job_type,
    work_mode,
    location,
    experience_level,
    salary_min,
    salary_max,
    application_deadline,
    description,
    required_skills = []
  } = formFields;

  // Selected skill names lookup
  const selectedSkills = required_skills.map(skillId => {
    const found = availableSkills.find(s => s.id === skillId || s.id === Number(skillId) || s.skill_name === skillId || s.label === skillId);
    return found ? (found.skill_name || found.label) : String(skillId);
  }).filter(Boolean);

  // Selected recruiters lookup
  const assignedRecruiters = companyRecruiters.filter(r => selectedRecruiterIds.includes(r.id));

  // Salary range string formatter
  const formatSalary = () => {
    if (!salary_min && !salary_max) return 'Salary not specified';
    if (salary_min && salary_max) return `$${Number(salary_min).toLocaleString()} - $${Number(salary_max).toLocaleString()}`;
    if (salary_min) return `From $${Number(salary_min).toLocaleString()}`;
    return `Up to $${Number(salary_max).toLocaleString()}`;
  };

  // Format date helper
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'No deadline';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return dateStr;
  };

  return (
    <Card className="p-4 md:p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl space-y-3.5 shadow-lg relative overflow-hidden">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5 text-blue-500" />
          <span>Live Candidate Preview</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Realtime
        </span>
      </div>

      {/* Main Title & Department */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {department && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {department}
            </span>
          )}
          {job_type && (
            <Badge variant="primary" className="text-[10px] px-2 py-0.5 font-bold">
              {job_type}
            </Badge>
          )}
          {work_mode && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-bold bg-slate-100 dark:bg-slate-800">
              {work_mode}
            </Badge>
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
          {title.trim() || 'Untitled Position'}
        </h3>
      </div>

      {/* Location, Salary & Deadline Metadata */}
      <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50/80 dark:bg-[#0d1017] p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{location.trim() || 'Location not specified'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{formatSalary()}</span>
          </div>
          {experience_level && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md">
              {experience_level}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-800 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500">Deadline: <strong className="text-slate-700 dark:text-slate-300">{formatDateDisplay(application_deadline)}</strong></span>
        </div>
      </div>

      {/* Description Snippet */}
      {description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed italic">
          "{description}"
        </p>
      )}

      {/* Required Skills Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-blue-500" />
            Skills ({selectedSkills.length})
          </span>
        </div>

        {selectedSkills.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">No skills selected</p>
        ) : (
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
            {selectedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hiring Pipeline Sequence Summary */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3 h-3 text-blue-500" />
          Pipeline ({pipelineStages.length} Stages)
        </span>
        <div className="flex flex-wrap gap-1">
          {pipelineStages.map((st, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {idx + 1}. {st}
            </span>
          ))}
        </div>
      </div>

      {/* Assigned Recruiters Summary */}
      {assignedRecruiters.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-blue-500" />
            Assigned Recruiters ({assignedRecruiters.length})
          </span>
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {assignedRecruiters.slice(0, 5).map((r) => (
              <div
                key={r.id}
                title={r.name}
                className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#15161e]"
              >
                {r.name?.charAt(0) || 'R'}
              </div>
            ))}
            {assignedRecruiters.length > 5 && (
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#15161e]">
                +{assignedRecruiters.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default JobPreviewCard;
