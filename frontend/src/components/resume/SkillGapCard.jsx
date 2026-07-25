import React from 'react';
import { Award, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export function SkillGapCard({ skillGap = {} }) {
  const { 
    strong_skills = [], 
    weak_skills = [], 
    missing_technical = [], 
    missing_soft = [], 
    category = 'Needs Improvement' 
  } = skillGap;

  const getCategoryClass = (val) => {
    switch (val?.toLowerCase()) {
      case 'excellent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'good':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
            Skills Gap Analysis
          </h4>
          <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-450 mt-0.5">
            Evaluates matching technical competencies.
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getCategoryClass(category)}`}>
          {category}
        </div>
      </div>

      <div className="space-y-4">
        {strong_skills.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Strong Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {strong_skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-emerald-50/50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/10 dark:border-emerald-900/50 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {weak_skills.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-wide">
              Needs Improvement
            </span>
            <div className="flex flex-wrap gap-1.5">
              {weak_skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-amber-50/50 border border-amber-100 text-amber-700 dark:bg-amber-950/10 dark:border-amber-900/50 dark:text-amber-400 rounded-lg text-[10px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {missing_technical.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-wide">
              Missing Technical Competencies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missing_technical.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-rose-50/50 border border-rose-100 text-rose-700 dark:bg-rose-950/10 dark:border-rose-900/50 dark:text-rose-400 rounded-lg text-[10px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {missing_soft.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide dark:text-slate-500">
              Missing Soft Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missing_soft.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 rounded-lg text-[10px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillGapCard;
