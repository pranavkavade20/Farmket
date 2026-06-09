import React from 'react';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isSuccess?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isSuccess, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center justify-center text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted shadow-sm',
              'transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
              hasError
                ? 'border-danger focus:border-danger focus:ring-danger/20'
                : isSuccess
                ? 'border-success focus:border-success focus:ring-success/20'
                : 'border-border-strong hover:border-brand/50 focus:border-brand focus:ring-brand/20',
              icon ? 'pl-11' : '',
              (hasError || isSuccess) ? 'pr-11' : '',
              className
            )}
            {...props}
          />
          {hasError && !isSuccess && (
            <div className="absolute right-3.5 flex items-center justify-center pointer-events-none text-danger">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {isSuccess && !hasError && (
            <div className="absolute right-3.5 flex items-center justify-center pointer-events-none text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>
        {hasError && (
          <p className="text-xs font-medium text-danger animate-in slide-in-from-top-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
