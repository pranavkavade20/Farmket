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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
              'block w-full rounded-full border bg-gray-50 px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 shadow-sm',
              'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
              'dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-green-500/30',
              error
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700',
              icon ? 'pl-12' : '',
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
