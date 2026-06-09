import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'flex min-h-[100px] w-full rounded-[14px] border border-border-subtle bg-surface px-5 py-3.5 text-sm font-medium text-foreground placeholder-muted shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
            'transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-brand/25 focus:border-brand',
            'dark:bg-surface dark:shadow-none',
            error
              ? 'border-error focus:ring-error/25 focus:border-error'
              : 'hover:border-gray-300 dark:hover:border-gray-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
