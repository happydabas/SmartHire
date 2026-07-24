import React from 'react';
import Modal from './Modal';
import Button from './Button';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  title = 'Are you sure?',
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  ...props
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} {...props}>
      <div className="space-y-6">
        {message && (
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {message}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl font-bold"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            className="rounded-xl font-bold px-6"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
