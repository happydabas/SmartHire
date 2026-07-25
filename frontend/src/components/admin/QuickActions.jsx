import React from 'react';
import { Users, Building2, ShieldAlert, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Manage Users',
      description: 'Moderate platform accounts and roles.',
      icon: Users,
      path: '/admin/users',
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      label: 'Manage Companies',
      description: 'Approve and manage corporate profiles.',
      icon: Building2,
      path: '/admin/companies',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
    },
    {
      label: 'Moderate Jobs',
      description: 'Review pending postings and moderations.',
      icon: ShieldAlert,
      path: '/admin/jobs/moderate',
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
    },
    {
      label: 'View Reports',
      description: 'Access system logs and custom reports.',
      icon: FileText,
      path: '/admin/reports',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
    }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <h3 className="text-base font-extrabold text-slate-800 mb-6 dark:text-white">
        Quick Admin Operations
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              onClick={() => navigate(act.path)}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/10 transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/20"
              aria-label={act.label}
            >
              <div className="flex gap-4 items-center min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                    {act.label}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5 leading-normal dark:text-slate-400">
                    {act.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;
