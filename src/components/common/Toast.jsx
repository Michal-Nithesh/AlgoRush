import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-300 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-700/60',
    error: 'border-red-700/60',
    info: 'border-sky-700/60',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
          borders[toast.type] || borders.info
        } bg-stone-900/95 shadow-xl max-w-md backdrop-blur-md`}
      >
        {icons[toast.type] || icons.info}
        <p className="text-sm text-stone-100 font-medium">{toast.message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-stone-400 hover:text-stone-100 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
