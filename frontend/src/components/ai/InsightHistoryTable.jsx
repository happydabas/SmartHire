import React from 'react';
import { Calendar, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/utils';

export function InsightHistoryTable({ history = [], onDelete }) {
  if (history.length === 0) {
    return (
      <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800 animate-fadeIn">
        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
          No insight history logs
        </h4>
        <p className="text-xs text-slate-500 font-semibold mt-1 dark:text-slate-450">
          History records appear here after generating insights.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800 animate-fadeIn">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Summary
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Date Generated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Type
              </th>
              <th scope="col" className="relative px-6 py-3 text-right text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:bg-slate-900 dark:divide-slate-800 text-xs font-semibold">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 max-w-sm truncate text-slate-800 dark:text-slate-200">
                  {item.summary}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-450">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-100 dark:bg-slate-805 dark:text-slate-400 dark:border-slate-800">
                    {item.insight_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-block dark:hover:bg-rose-950/20"
                    title="Delete log record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InsightHistoryTable;
