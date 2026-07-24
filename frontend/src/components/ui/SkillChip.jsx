import React from 'react';
import { Trash2, Edit2, Award, Clock } from 'lucide-react';
import Badge from './Badge';
import Card from './Card';

export const SkillChip = ({ 
  skill, 
  onEdit, 
  onDelete, 
  ...props 
}) => {
  const getProficiencyVariant = (level) => {
    if (!level) return 'neutral';
    const l = level.toLowerCase();
    if (l === 'expert') return 'success';
    if (l === 'advanced') return 'primary';
    if (l === 'intermediate') return 'warning';
    return 'neutral';
  };

  return (
    <Card 
      className="p-4 border border-slate-100 bg-white hover:shadow-lg transition-all duration-200 flex items-center justify-between gap-4"
      {...props}
    >
      <div className="space-y-1.5 min-w-0">
        <h4 className="font-bold text-slate-800 text-sm truncate" title={skill.skill_name}>
          {skill.skill_name}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getProficiencyVariant(skill.proficiency_level)} className="text-[10px] py-0.5">
            {skill.proficiency_level || 'Intermediate'}
          </Badge>
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            {skill.years_of_experience} {skill.years_of_experience === 1 ? 'year' : 'years'}
          </span>
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit?.(skill)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="Edit Details"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete?.(skill.id)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title="Remove Skill"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};

export default SkillChip;
