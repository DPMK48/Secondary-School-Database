import React from 'react';
import { cn } from '../../utils/helpers';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className,
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-500" />,
      title: 'text-blue-800',
      content: 'text-blue-700',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: 'text-green-800',
      content: 'text-green-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      title: 'text-yellow-800',
      content: 'text-yellow-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: 'text-red-800',
      content: 'text-red-700',
    },
  };

  const styles = variants[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        styles.container,
        className
      )}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn('text-sm font-medium', styles.title)}>{title}</h3>
          )}
          <div className={cn('text-sm', title && 'mt-1', styles.content)}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 inline-flex text-secondary-400 hover:text-secondary-500"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
