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
            className="text-sm font-semibold text-foreground-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'block w-full appearance-none rounded-lg border bg-surface px-3 py-2 pr-10 text-sm text-foreground shadow-sm',
              'transition-all duration-200 ease-out focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
              hasError
                ? 'border-danger focus-visible:ring-danger/50'
                : isSuccess
                ? 'border-success focus-visible:ring-success/50'
                : 'border-border-strong hover:border-foreground-secondary',
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
