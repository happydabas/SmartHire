import React from 'react';
import { Briefcase, GraduationCap, Calendar, Award } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

export const Timeline = ({ items = [], type = 'experience' }) => {
  if (!items || items.length === 0) {
    return (
      <p className="text-xs text-slate-400 font-semibold italic text-center py-4 bg-slate-50 border border-dashed rounded-2xl">
        No records listed on profile.
      </p>
    );
  }

  const isEdu = type === 'education';

  return (
    <div className="relative border-l border-slate-100 pl-6 ml-3.5 space-y-6 py-2 animate-in fade-in duration-200">
      {items.map((item, index) => {
        const title = isEdu ? item.degree : (item.role_title || item.title || 'Role Name');
        const subtitle = isEdu 
          ? `${item.field_of_study} at ${item.institution_name}` 
          : `${item.company_name} ${item.location ? `• ${item.location}` : ''}`;
        
        const dateRange = `${formatDate(item.start_date)} – ${
          item.end_date ? formatDate(item.end_date) : 'Present'
        }`;

        return (
          <div key={item.id || index} className="relative group">
            {/* Dot indicator */}
            <span className="absolute -left-10 top-1 w-7 h-7 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-all shadow-sm">
              {isEdu ? <GraduationCap className="w-4 h-4 shrink-0" /> : <Briefcase className="w-4.5 h-4.5 shrink-0" />}
            </span>

            {/* Content Details */}
            <div className="space-y-1 bg-white hover:bg-slate-50/50 p-4 border border-slate-100 rounded-2xl transition-colors shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <h4 className="font-extrabold text-slate-800 text-sm">{title}</h4>
                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dateRange}</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
              {isEdu && item.grade && (
                <div className="text-[10.5px] font-bold text-teal-600 flex items-center gap-1 mt-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Grade: {item.grade}</span>
                </div>
              )}
              {item.description && (
                <p className="text-xs font-medium text-slate-400 mt-2 whitespace-pre-line leading-relaxed border-t border-slate-50 pt-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
