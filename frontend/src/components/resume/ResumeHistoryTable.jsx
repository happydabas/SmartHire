import React from 'react';
import { FileText, Trash2, Eye, Calendar, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils';

export function ResumeHistoryTable({ history = [], onDelete, onView }) {
  const getStatusColorClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'failed':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-slate-950/30">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
          No parsing history
        </h4>
        <p className="text-xs text-slate-500 font-bold mt-1 dark:text-slate-450">
          Upload your resume to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800 animate-fadeIn">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Parsing Run History
        </h4>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Resume Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Upload Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3 text-right text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:bg-slate-900 dark:divide-slate-800">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-805/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white truncate max-w-xs">
                      {item.resume_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500 dark:text-slate-400">
                  {formatDate(item.upload_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getStatusColorClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-2">
                    {item.status?.toLowerCase() === 'completed' && onView && (
                      <button
                        onClick={() => onView(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-950/20"
                        title="View extracted data details"
                        aria-label="View parsed data"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-950/20"
                      title="Delete run history entry"
                      aria-label="Delete history entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResumeHistoryTable;
