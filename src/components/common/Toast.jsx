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
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    info: 'border-cyan-500/30',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[#151C30] border ${
          borders[toast.type] || borders.info
        } shadow-2xl max-w-md backdrop-blur-md`}
      >
        {icons[toast.type] || icons.info}
        <p className="text-sm text-slate-100 font-medium">{toast.message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-[#1D2740] transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
