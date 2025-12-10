import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';
import { ToastMessage } from '../../types/settings';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
  };

  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-500 text-white',
  };

  return (
    <div className={clsx(
      "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right duration-300 pointer-events-auto",
      styles[toast.type]
    )}>
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      <p className="text-sm font-medium flex-grow">{toast.message}</p>
      <button 
        onClick={() => onClose(toast.id)}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
