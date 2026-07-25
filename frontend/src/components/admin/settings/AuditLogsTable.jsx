import React from 'react';
import AuditLogRow from './AuditLogRow';

export function AuditLogsTable({ logs = [], loading }) {
  const headers = [
    'Timestamp',
    'Admin',
    'Action',
    'Module',
    'Status',
    'IP Address'
  ];

  if (loading) {
    return (
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-800 animate-pulse">
            {[1, 2, 3, 4, 5].map((idx) => (
              <tr key={idx}>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-16 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-24 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-32 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-16 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-12 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-20 dark:bg-slate-850" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
        <thead className="bg-slate-50/50 dark:bg-slate-900/50">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-800">
          {logs.map((log) => (
            <AuditLogRow key={log.id} log={log} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AuditLogsTable;
