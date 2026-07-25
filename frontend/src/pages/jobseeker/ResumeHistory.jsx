import React, { useState, useEffect, useCallback } from 'react';
import { resumeParserService } from '@/services/resumeParserService';
import ResumeHistoryTable from '@/components/resume/ResumeHistoryTable';
import Spinner from '@/components/ui/Spinner';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ResumeHistory({ onView }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resumeParserService.getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load parsing history:", err);
      setError("Unable to retrieve parsing history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    try {
      await resumeParserService.deleteHistory(id);
      toast.success("History log deleted successfully");
      fetchHistory();
    } catch (err) {
      toast.error("Failed to delete history log");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Spinner size="md" />
        <p className="text-xs font-bold text-slate-400">Loading parsing logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      <ResumeHistoryTable
        history={history}
        onDelete={handleDelete}
        onView={onView}
      />
    </div>
  );
}

export default ResumeHistory;
