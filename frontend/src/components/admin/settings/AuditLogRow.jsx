import React from 'react';
import { formatDate } from '@/utils';

export function AuditLogRow({ log }) {
  const isSuccess = log.status?.toLowerCase() === 'success';

  return (
    <tr className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
      {/* Timestamp */}
      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-400 dark:text-slate-500">
        {formatDate(log.timestamp)}
      </td>

      {/* Admin Name */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-slate-800 dark:text-white">
        {log.admin}
      </td>

      {/* Action */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-350">
        {log.action}
      </td>

      {/* Module */}
      <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {log.module}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
          isSuccess 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
        }`}>
          {log.status}
        </span>
      </td>

      {/* IP Address */}
      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-550 dark:text-slate-400">
        {log.ip || '—'}
      </td>
    </tr>
  );
}

export default AuditLogRow;
