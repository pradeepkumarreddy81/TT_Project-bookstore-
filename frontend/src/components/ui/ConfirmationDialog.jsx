import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Destructive Action',
  description = 'Are you certain you wish to proceed? This change cannot be undone.',
  confirmLabel = 'Delete Entry',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'terracotta', // 'terracotta' | 'forest'
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="max-w-md"
    >
      <div className="flex items-center gap-3 p-3.5 bg-terracotta/10 border border-terracotta/20 rounded text-xs text-ink leading-relaxed mb-6">
        <AlertTriangle className="w-5 h-5 text-terracotta shrink-0" />
        <span>This record will be permanently altered or expunged from the bookstore database.</span>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-paper-border">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
