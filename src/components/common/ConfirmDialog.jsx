import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 ${
              isDestructive ? 'bg-rose-500/10 text-rose-400' : 'bg-cyan-500/10 text-cyan-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#29344D]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 bg-[#1D2740] hover:bg-[#24304F] rounded-lg transition-colors border border-[#29344D]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
