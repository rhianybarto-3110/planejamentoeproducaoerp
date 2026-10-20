import React from 'react';
import { useERP } from '../../context/ERPContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useERP();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-purple-600" />;
        let borderClass = 'border-purple-200';
        let bgClass = 'bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
          borderClass = 'border-emerald-200';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600" />;
          borderClass = 'border-rose-200';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
          borderClass = 'border-amber-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border ${borderClass} ${bgClass} shadow-lg shadow-purple-950/10 flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 duration-200`}
            role="status"
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="mt-1 text-xs text-slate-600 leading-relaxed break-words">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors shrink-0"
              aria-label="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
