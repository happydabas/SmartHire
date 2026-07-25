import React from 'react';
import { Calendar, Trash2, Eye, Award } from 'lucide-react';
import { formatDate } from '@/utils';
import { Link } from 'react-router-dom';

export function RecommendationHistoryTable({ history = [] }) {
  if (history.length === 0) {
    return (
      <div className="text-center p-12 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800 animate-fadeIn">
        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
          No recommendation history logs
        </h4>
        <p className="text-xs text-slate-500 font-semibold mt-1 dark:text-slate-450">
          Personalized recommendations will appear here once generated.
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
                Recommended Job
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Date Generated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Fit Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                AI Reason Explanation
              </th>
              <th scope="col" className="relative px-6 py-3 text-right text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:bg-slate-900 dark:divide-slate-800 text-xs font-semibold">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="min-w-0">
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white block truncate max-w-xs">
                      {item.job_title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold dark:text-slate-400 block mt-0.5">
                      {item.company_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-450">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                    <Award className="w-3.5 h-3.5" />
                    <span>{item.match_score}%</span>
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                  {item.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/jobs/${item.job_id}`}
                    className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 rounded-lg transition-colors inline-block dark:hover:bg-indigo-950/20 mr-2"
                    title="View job opportunity"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecommendationHistoryTable;
