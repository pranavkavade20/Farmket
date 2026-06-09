import React from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  isSuccess?: boolean;
  options: { label: string; value: string | number }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, isSuccess, options, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'block w-full appearance-none rounded-xl border bg-surface px-4 py-3 pr-10 text-sm font-medium text-foreground shadow-sm',
              'transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
              hasError
                ? 'border-danger focus:border-danger focus:ring-danger/20'
                : isSuccess
                ? 'border-success focus:border-success focus:ring-success/20'
                : 'border-border-strong hover:border-brand/50 focus:border-brand focus:ring-brand/20',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 gap-2 text-muted">
            {hasError && !isSuccess && <AlertCircle className="w-4 h-4 text-danger" />}
            {isSuccess && !hasError && <CheckCircle2 className="w-4 h-4 text-success" />}
            <ChevronDown className="h-4 w-4" />
          </div>
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
Select.displayName = 'Select';

export { Select };
