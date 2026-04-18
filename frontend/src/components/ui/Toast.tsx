import { useEffect } from 'react';
import type { ToastItem } from '../../types/index';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: 'bg-green-500', border: 'border-green-600', icon: '✓', iconBg: 'bg-green-600' },
    error: { bg: 'bg-red-500', border: 'border-red-600', icon: '✕', iconBg: 'bg-red-600' },
    info: { bg: 'bg-blue-500', border: 'border-blue-600', icon: 'ℹ', iconBg: 'bg-blue-600' },
    warning: { bg: 'bg-amber-500', border: 'border-amber-600', icon: '⚠', iconBg: 'bg-amber-600' }
  };

  const style = styles[type];

  return (
    <div className={`relative flex items-center gap-3 pl-2 pr-4 py-3 rounded-xl text-white shadow-2xl min-w-[320px] max-w-[420px] border ${style.bg} ${style.border} animate-slide-in overflow-hidden`}>
      <div className={`${style.iconBg} rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg`}>
        {style.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-tight">
          {type === 'success' ? 'Success' : 
           type === 'error' ? 'Error' :
           type === 'warning' ? 'Warning' : 'Info'}
        </p>
        <p className="text-xs opacity-90 mt-0.5 leading-snug">
          {message}
        </p>
      </div>
      <button 
        onClick={onClose} 
        className="text-white opacity-70 hover:opacity-100 ml-1 flex-shrink-0 text-lg leading-none"
      >
        ✕
      </button>
      <div className="absolute bottom-0 left-0 h-1 rounded-b-xl bg-white opacity-30 animate-toast-progress" style={{ width: '100%' }} />
    </div>
  );
};

export const ToastContainer = ({ 
  toasts, 
  onClose 
}: { 
  toasts: ToastItem[], 
  onClose: (id: string) => void 
}) => {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ marginTop: index * 0 }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onClose(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
