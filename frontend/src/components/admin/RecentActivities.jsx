import React from 'react';
import { UserPlus, Building, Briefcase, FileCheck, CircleX, Clock } from 'lucide-react';
import { formatNotificationTimestamp } from '@/utils/notificationUtils';

export function RecentActivities({ activities = [] }) {
  const getActivityStyles = (type) => {
    switch (type) {
      case 'user_registered':
        return {
          icon: UserPlus,
          color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
        };
      case 'company_registered':
        return {
          icon: Building,
          color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
        };
      case 'job_published':
        return {
          icon: Briefcase,
          color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
        };
      case 'job_closed':
        return {
          icon: CircleX,
          color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        };
      case 'application_submitted':
        return {
          icon: FileCheck,
          color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
        };
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-slate-400" />
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
          Recent Activities
        </h3>
      </div>

      {activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-slate-400 font-semibold dark:text-slate-500">No activities recorded today.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-2">
          {activities.map((act) => {
            const style = getActivityStyles(act.type);
            const Icon = style.icon;
            return (
              <div key={act.id} className="flex gap-3 text-left items-start p-1.5 hover:bg-slate-50/50 rounded-xl transition-all duration-200 dark:hover:bg-slate-800/30">
                <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 ${style.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 leading-normal break-words dark:text-slate-300">
                    {act.description}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                    {formatNotificationTimestamp(act.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentActivities;
