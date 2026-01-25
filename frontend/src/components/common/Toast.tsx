import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const variants = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success-50',
      borderColor: 'border-success-500',
      textColor: 'text-success-900',
      iconColor: 'text-success-500',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-error-50',
      borderColor: 'border-error-500',
      textColor: 'text-error-900',
      iconColor: 'text-error-500',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-500',
      textColor: 'text-warning-900',
      iconColor: 'text-warning-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-info-50',
      borderColor: 'border-info-500',
      textColor: 'text-info-900',
      iconColor: 'text-info-500',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg ${config.bgColor} ${config.borderColor} animate-slide-in`}
      role="alert"
    >
      <Icon className={`w-5 h-5 mt-0.5 ${config.iconColor} flex-shrink-0`} />
      <p className={`flex-1 text-sm font-medium ${config.textColor}`}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`${config.textColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
