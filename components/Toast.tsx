
import React from 'react';
import { X, CheckCircle, AlertCircle, Info, Megaphone } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'announcement';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-full fade-in
            ${toast.type === 'success' ? 'bg-green-50/95 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : ''}
            ${toast.type === 'error' ? 'bg-red-50/95 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' : ''}
            ${toast.type === 'info' ? 'bg-blue-50/95 dark:bg-blue-900/90 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200' : ''}
            ${toast.type === 'announcement' ? 'bg-orange-50/95 dark:bg-orange-900/90 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200' : ''}
          `}
          role="alert"
        >
          <div className={`p-1.5 rounded-full shrink-0
            ${toast.type === 'success' ? 'bg-green-100 dark:bg-green-800' : ''}
            ${toast.type === 'error' ? 'bg-red-100 dark:bg-red-800' : ''}
            ${toast.type === 'info' ? 'bg-blue-100 dark:bg-blue-800' : ''}
            ${toast.type === 'announcement' ? 'bg-orange-100 dark:bg-orange-800' : ''}
          `}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            {toast.type === 'announcement' && <Megaphone size={18} />}
          </div>
          
          <p className="text-sm font-bold pr-2">{toast.message}</p>
          
          <button 
            onClick={() => onRemove(toast.id)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
