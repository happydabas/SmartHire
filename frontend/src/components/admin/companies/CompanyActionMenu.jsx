import React, { useState } from 'react';
import { Eye, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export function CompanyActionMenu({ company, onView, onVerify, onSuspend, onReactivate, onDelete }) {
  const [verifyConfirmOpen, setVerifyConfirmOpen] = useState(false);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleVerify = () => {
    setVerifyConfirmOpen(false);
    onVerify(company.id);
  };

  const handleSuspend = () => {
    setSuspendConfirmOpen(false);
    onSuspend(company.id);
  };

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDelete(company.id);
  };

  return (
    <div className="relative flex items-center gap-1.5 justify-end">
      {/* View Details button */}
      <button
        onClick={() => onView(company.id)}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
        title="View details"
        aria-label="View company details"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Verify Action */}
      {company.verification_status !== 'verified' && (
        <button
          onClick={() => setVerifyConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:hover:bg-slate-800"
          title="Verify company"
          aria-label="Verify company"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
      )}

      {/* Toggle Status Action (Suspend / Reactivate) */}
      {company.status === 'suspended' ? (
        <button
          onClick={() => onReactivate(company.id)}
          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:hover:bg-slate-800"
          title="Reactivate company"
          aria-label="Reactivate company"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setSuspendConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-amber-500 dark:hover:bg-slate-800"
          title="Suspend company"
          aria-label="Suspend company"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      )}

      {/* Delete Action */}
      <button
        onClick={() => setDeleteConfirmOpen(true)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-rose-500 dark:hover:bg-slate-800"
        title="Delete company"
        aria-label="Delete company"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Verify confirmation dialog */}
      <ConfirmationDialog
        isOpen={verifyConfirmOpen}
        onClose={() => setVerifyConfirmOpen(false)}
        title="Verify Company?"
        message={`Are you sure you want to verify ${company.name}? This will mark them as a trusted employer.`}
        onConfirm={handleVerify}
        confirmText="Verify"
        cancelText="Cancel"
      />

      {/* Suspend confirmation dialog */}
      <ConfirmationDialog
        isOpen={suspendConfirmOpen}
        onClose={() => setSuspendConfirmOpen(false)}
        title="Suspend Company?"
        message={`Are you sure you want to suspend the corporate account for ${company.name}? All recruiters belonging to this company will lose access.`}
        onConfirm={handleSuspend}
        confirmText="Suspend"
        cancelText="Cancel"
      />

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Company?"
        message={`Are you sure you want to permanently delete the profile for ${company.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default CompanyActionMenu;
