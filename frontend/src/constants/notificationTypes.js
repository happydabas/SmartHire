import { ClipboardList, Calendar, Info, Briefcase, Bell } from 'lucide-react';

export const NOTIFICATION_TYPES = {
  APPLICATION: {
    label: 'Application Update',
    icon: ClipboardList,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/50',
  },
  INTERVIEW: {
    label: 'Interview',
    icon: Calendar,
    colorClass: 'text-purple-600 bg-purple-50 border-purple-100 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900/50',
  },
  STATUS_UPDATE: {
    label: 'Status Update',
    icon: Info,
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/50',
  },
  JOB: {
    label: 'Job Recommendation',
    icon: Briefcase,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50',
  },
  SYSTEM: {
    label: 'System Message',
    icon: Bell,
    colorClass: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/50',
  },
};

export default NOTIFICATION_TYPES;
