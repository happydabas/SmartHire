import React from 'react';
import { Sparkles, Trash2, Eye, Calendar, Award } from 'lucide-react';
import { formatDate } from '@/utils';

export function AnalysisHistoryTable({ history = [], onDelete, onView }) {
  if (history.length === 0) {
    return (
      <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
        <div className="w-14 h-14 bg-slate-50 text-slate-405 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-slate-950/30">
          <Sparkles className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
          No analysis history
        </h4>
        <p className="text-xs text-slate-550 font-bold mt-1 dark:text-slate-450">
          Analyze your resume or profile data to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800 animate-fadeIn">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Analysis Run History
        </h4>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Source Document
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Analysis Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Overall Score
              </th>
              <th scope="col" className="relative px-6 py-3 text-right text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:bg-slate-900 dark:divide-slate-800">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white truncate max-w-xs">
                      {item.resume_version}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500 dark:text-slate-400">
                  {formatDate(item.analysis_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    <Award className="w-3.5 h-3.5" />
                    <span>{item.overall_score} / 100</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-950/20"
                        title="View analysis report"
                        aria-label="View analysis report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-950/20"
                      title="Delete run report"
                      aria-label="Delete run report"
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

export default AnalysisHistoryTable;
