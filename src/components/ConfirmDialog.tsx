import { X } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-sm w-full modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
