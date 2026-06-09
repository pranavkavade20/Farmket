import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-[14px] border border-border-subtle bg-surface px-5 py-3.5 text-sm font-medium text-foreground placeholder-muted shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
              'transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-brand/25 focus:border-brand',
              'dark:bg-surface dark:shadow-none',
              error
                ? 'border-error focus:ring-error/25 focus:border-error'
                : 'hover:border-gray-300 dark:hover:border-gray-600',
              icon ? 'pl-11' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
