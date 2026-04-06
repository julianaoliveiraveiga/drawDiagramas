import React from 'react';
import { X } from 'lucide-react';

interface AlertBannerProps {
  type: 'warning' | 'error' | 'success' | 'info';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AlertBanner({ 
  type, 
  message, 
  dismissible = false, 
  onDismiss,
  action 
}: AlertBannerProps) {
  const typeStyles = {
    warning: 'alert-banner',
    error: 'error-banner',
    success: 'bg-green-50 text-green-800 border-l-4 border-green-500 p-4 rounded-lg',
    info: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500 p-4 rounded-lg',
  };

  return (
    <div className={`${typeStyles[type]} flex items-center justify-between`}>
      <p className="flex-1">{message}</p>
      <div className="flex items-center space-x-4 ml-4">
        {action && (
          <button
            onClick={action.onClick}
            className="font-medium underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
        {dismissible && onDismiss && (
          <button onClick={onDismiss} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
