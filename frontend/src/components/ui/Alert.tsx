import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const variantConfig = {
  info: {
    container: 'bg-info-muted text-info border-info/30',
    icon: <Info className="h-5 w-5 shrink-0 text-info" />,
  },
  success: {
    container: 'bg-success-muted text-success border-success/30',
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />,
  },
  warning: {
    container: 'bg-warning-muted text-warning border-warning/30',
    icon: <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />,
  },
  danger: {
    container: 'bg-danger-muted text-danger border-danger/30',
    icon: <AlertCircle className="h-5 w-5 shrink-0 text-danger" />,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  onClose,
  action,
  className,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-xl border p-4 flex gap-3.5 items-start shadow-sm',
        config.container,
        className
      )}
    >
      <div className="mt-0.5">{icon ?? config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className="font-semibold text-sm leading-none tracking-tight mb-1 text-foreground">
            {title}
          </h5>
        )}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
        {action && <div className="mt-3 flex items-center gap-2">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 -mt-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity focus-ring"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
