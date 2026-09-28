import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-l-4 border-l-emerald-500 bg-white text-slate-800 shadow-xl shadow-emerald-500/10',
    error: 'border-l-4 border-l-rose-500 bg-white text-slate-800 shadow-xl shadow-rose-500/10',
    warning: 'border-l-4 border-l-amber-500 bg-white text-slate-800 shadow-xl shadow-amber-500/10',
    info: 'border-l-4 border-l-sky-500 bg-white text-slate-800 shadow-xl shadow-sky-500/10',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in max-w-sm w-full">
      <div className={`p-4 rounded-xl border border-slate-200 flex items-start gap-3 ${borderColors[toast.type] || borderColors.info}`}>
        {icons[toast.type] || icons.info}
        <div className="flex-1 min-w-0">
          {toast.title && <h4 className="font-semibold text-sm text-slate-900">{toast.title}</h4>}
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
