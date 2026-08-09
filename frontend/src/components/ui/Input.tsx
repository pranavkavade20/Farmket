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
              'block w-full rounded-[10px] border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted shadow-sm',
              'transition-all duration-200 ease-out focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
              hasError
                ? 'border-danger focus-visible:ring-danger/50'
                : isSuccess
                ? 'border-success focus-visible:ring-success/50'
                : 'border-border-strong hover:border-brand/50',
              icon ? 'pl-10' : '',
              (hasError || isSuccess) ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          {hasError && !isSuccess && (
            <div className="absolute right-3.5 flex items-center justify-center pointer-events-none text-danger">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {isSuccess && !hasError && (
            <div className="absolute right-3.5 flex items-center justify-center pointer-events-none text-success">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>
        {hasError && (
          <p className="text-sm font-medium text-danger animate-in slide-in-from-top-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
