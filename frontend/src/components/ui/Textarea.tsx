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
            'flex min-h-[120px] w-full rounded-md border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted shadow-sm',
            'transition-all duration-200 ease-out focus-ring disabled:opacity-50 disabled:cursor-not-allowed resize-y custom-scrollbar',
            hasError
              ? 'border-danger focus-visible:ring-danger/50'
              : isSuccess
              ? 'border-success focus-visible:ring-success/50'
              : 'border-border-strong hover:border-brand/50',
            className
          )}
          {...props}
        />
        {hasError && (
          <p className="text-sm font-medium text-danger animate-in slide-in-from-top-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
