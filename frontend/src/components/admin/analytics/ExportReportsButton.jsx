import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export function ExportReportsButton({ onExport }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await onExport();
      toast.success('System audit report exported successfully');
    } catch (err) {
      toast.error('Failed to export analytics report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={exporting}
      className="rounded-xl font-black text-xs px-4 py-2.5 border-slate-200 text-slate-500 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 shrink-0"
      aria-label="Export report as CSV"
    >
      {exporting ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          <span>Export Report</span>
        </>
      )}
    </Button>
  );
}

export default ExportReportsButton;
