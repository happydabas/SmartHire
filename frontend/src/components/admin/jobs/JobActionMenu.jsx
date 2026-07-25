import React, { useState } from 'react';
import { Eye, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export function JobActionMenu({ job, onView, onApprove, onReject, onRemove }) {
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const handleApprove = () => {
    setApproveConfirmOpen(false);
    onApprove(job.id);
  };

  const handleReject = () => {
    setRejectConfirmOpen(false);
    onReject(job.id);
  };

  const handleConfirmRemove = () => {
    setRemoveConfirmOpen(false);
    onRemove(job.id);
  };

  const isPending = job.status === 'pending';
  const isRemoveable = job.status === 'published' || job.status === 'closed';

  return (
    <div className="relative flex items-center gap-1.5 justify-end">
      {/* View Details button */}
      <button
        onClick={() => onView(job.id)}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
        title="View details"
        aria-label="View job details"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Approve Action */}
      {isPending && (
        <button
          onClick={() => setApproveConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:hover:bg-slate-800"
          title="Approve job"
          aria-label="Approve job listing"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
      )}

      {/* Reject Action */}
      {isPending && (
        <button
          onClick={() => setRejectConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-rose-500 dark:hover:bg-slate-800"
          title="Reject job"
          aria-label="Reject job listing"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      )}

      {/* Remove Action */}
      {isRemoveable && (
        <button
          onClick={() => setRemoveConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-rose-500 dark:hover:bg-slate-800"
          title="Remove job"
          aria-label="Remove job listing"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Approve confirmation dialog */}
      <ConfirmationDialog
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        title="Approve Job?"
        message={`Are you sure you want to approve and publish the listing for "${job.title}"?`}
        onConfirm={handleApprove}
        confirmText="Approve"
        cancelText="Cancel"
      />

      {/* Reject confirmation dialog */}
      <ConfirmationDialog
        isOpen={rejectConfirmOpen}
        onClose={() => setRejectConfirmOpen(false)}
        title="Reject Job?"
        message={`Are you sure you want to reject the listing for "${job.title}"?`}
        onConfirm={handleReject}
        confirmText="Reject"
        cancelText="Cancel"
      />

      {/* Remove confirmation dialog */}
      <ConfirmationDialog
        isOpen={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
        title="Remove Job?"
        message={`Are you sure you want to permanently remove and delete the listing for "${job.title}"?`}
        onConfirm={handleConfirmRemove}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}

export default JobActionMenu;
