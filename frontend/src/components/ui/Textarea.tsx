import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isSuccess?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, isSuccess, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'flex min-h-[120px] w-full rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted shadow-sm',
            'transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed resize-y custom-scrollbar',
            hasError
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : isSuccess
              ? 'border-success focus:border-success focus:ring-success/20'
              : 'border-border-strong hover:border-brand/50 focus:border-brand focus:ring-brand/20',
            className
          )}
          {...props}
        />
        {hasError && (
          <p className="text-xs font-medium text-danger animate-in slide-in-from-top-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
