import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  AlertCircle 
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { applicationService } from '@/services/applications/applicationService';
import { STAGE_LABELS } from '@/constants/ats';
import Card from '@/components/ui/Card';
import StageBadge from '@/components/ats/StageBadge';

const ICON_MAP = {
  applied: ClipboardList,
  screening: Search,
  interview: MessageSquare,
  selected: CheckCircle,
  rejected: XCircle
};

export const ApplicationTimeline = ({ applicationId, currentStage }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationService.getApplicationStatusHistory(applicationId);
      // Sort oldest to newest
      const sorted = [...data].sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
      setHistory(sorted);
    } catch (err) {
      console.error('Error fetching application status history:', err);
      setError('Failed to retrieve application status history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchHistory();
    }
  }, [applicationId, currentStage]);

  const formatLocalDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const formatLocalTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
        <Clock className="w-4.5 h-4.5 text-blue-600 shrink-0" />
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Application Status History</h3>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading status history...">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="w-0.5 h-12 bg-slate-200 mt-1" />
              </div>
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-3.5 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-5 border border-rose-100 bg-rose-50/10 rounded-2xl text-center space-y-3">
          <div className="mx-auto w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">{error}</p>
          <button 
            onClick={fetchHistory}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
          >
            Retry Connection
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center space-y-2 text-slate-400">
          <ClipboardList className="w-8 h-8 mx-auto text-slate-300 animate-bounce" strokeWidth={1.5} />
          <p className="text-xs font-bold">No status history available.</p>
        </div>
      ) : (
        <div className="relative pl-1">
          {history.map((record, index) => {
            const isLast = index === history.length - 1;
            const stage = (record.status || 'applied').toLowerCase();
            const label = STAGE_LABELS[stage] || record.status;
            const Icon = ICON_MAP[stage] || ClipboardList;
            
            return (
              <div key={record.id || index} className="flex gap-4 group">
                {/* Timeline visual line */}
                <div className="flex flex-col items-center shrink-0">
                  <div 
                    className={twMerge(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      isLast 
                        ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md shadow-blue-500/10" 
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isLast && (
                    <div className="w-0.5 h-12 bg-slate-100 group-hover:bg-slate-200 transition-colors" aria-hidden="true" />
                  )}
                </div>

                {/* Content details */}
                <div className="pb-8 space-y-1.5 pt-0.5 flex-1 min-w-0" role="text">
                  <div className="flex flex-wrap items-center gap-2">
                    <StageBadge stage={stage} />
                    {isLast && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full select-none uppercase tracking-wider">
                        Current Stage
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center text-[11px] text-slate-400 font-semibold gap-x-2 gap-y-1">
                    <time dateTime={record.updated_at} className="text-slate-500 flex items-center gap-1 font-bold">
                      <span>{formatLocalDate(record.updated_at)}</span>
                      <span>•</span>
                      <span>{formatLocalTime(record.updated_at)}</span>
                    </time>
                    {record.recruiter_name && (
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Updated by {record.recruiter_name}</span>
                      </span>
                    )}
                  </div>

                  {record.comment && (
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold italic border-l-2 border-slate-100 pl-2 mt-1">
                      "{record.comment}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ApplicationTimeline;
