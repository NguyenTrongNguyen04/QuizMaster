import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg ${bgColor}`}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColor} hover:bg-opacity-75`}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast; 