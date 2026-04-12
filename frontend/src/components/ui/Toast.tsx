import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500', 
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg min-w-[300px] ${colors[type]} animate-slide-in`}>
      <span className="text-lg font-bold">{icons[type]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="text-white hover:text-gray-200 font-bold ml-2">✕</button>
    </div>
  );
};
