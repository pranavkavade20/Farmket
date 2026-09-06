import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked = false, onChange, label, description, error, className, disabled, id, ...props }, ref) => {
    const inputId = id ?? (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <label
          htmlFor={inputId}
          className={cn(
            'flex items-start gap-3 select-none cursor-pointer group',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={handleChange}
              className="sr-only"
              {...props}
            />
            <div
              className={cn(
                'h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-200 focus-ring',
                checked
                  ? 'bg-brand border-brand text-white'
                  : 'bg-surface border-border-strong group-hover:border-foreground-secondary',
                error && 'border-danger'
              )}
            >
              {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </div>
          </div>
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-xs text-foreground-secondary mt-0.5">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && <p className="text-xs text-danger font-medium ml-8">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
