interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'blue';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({ 
  isOpen, title, message, confirmText = 'Confirm',
  cancelText = 'Cancel', confirmColor = 'blue',
  onConfirm, onCancel 
}: ConfirmDialogProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 font-sans">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors shadow-sm ${
              confirmColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
