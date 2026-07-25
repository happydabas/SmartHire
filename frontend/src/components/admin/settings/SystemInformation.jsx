import React from 'react';
import { Cpu, Server, Database, Activity, LayoutGrid, Clock } from 'lucide-react';
import { formatDate } from '@/utils';

export function SystemInformation({ info }) {
  const cards = [
    { label: 'SmartHire Version', value: info?.version || 'v1.4.2', icon: Cpu, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'System Environment', value: info?.environment || 'Development', icon: Server, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Database Sync', value: info?.dbStatus || 'Connected', icon: Database, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Backend API Status', value: info?.apiStatus || 'Healthy', icon: Activity, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { label: 'Frontend Engine', value: info?.feVersion || 'v0.9.8', icon: LayoutGrid, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' },
    { label: 'Last Deployment', value: info?.lastDeployment ? formatDate(info.lastDeployment) : 'Just Now', icon: Clock, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white">
          System Information
        </h3>
        <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">
          Read-only system status, microservice health, and engine build parameters
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800">
              <div className={`p-3 rounded-xl shrink-0 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider dark:text-slate-500">
                  {card.label}
                </p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SystemInformation;
