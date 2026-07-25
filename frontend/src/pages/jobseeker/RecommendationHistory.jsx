import React, { useState, useEffect } from 'react';
import { recommendationService } from '@/services/recommendationService';
import RecommendationHistoryTable from '@/components/ai/RecommendationHistoryTable';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function RecommendationHistory() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await recommendationService.getRecommendationHistory();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load recommendation history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      await recommendationService.clearRecommendationHistory();
      toast.success("Recommendation history cleared successfully!");
      setHistory([]);
    } catch (err) {
      toast.error("Failed to clear recommendation logs.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white flex items-center gap-2.5">
            <History className="w-8 h-8 text-indigo-600 animate-pulse" />
            <span>Recommendation History</span>
          </h1>
          <p className="text-slate-555 text-sm mt-1 dark:text-slate-400">
            Browse through previous job suggestions generated for your profile.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="danger"
            onClick={handleClearHistory}
            className="rounded-xl font-black text-xs px-5 py-3 shrink-0 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Clear History</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <Spinner size="md" />
          <p className="text-xs font-bold text-slate-400 animate-pulse">Loading history logs...</p>
        </div>
      ) : (
        <RecommendationHistoryTable history={history} />
      )}
    </div>
  );
}

export default RecommendationHistory;
