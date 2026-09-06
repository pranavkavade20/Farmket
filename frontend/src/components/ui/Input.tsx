import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isSuccess?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      isSuccess,
      icon,
      rightElement,
      inputSize = 'md',
      showPasswordToggle = true,
      className,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const computedType = isPasswordType && showPassword ? 'text' : type;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    const sizeStyles = {
      sm: 'h-9 text-xs px-3 rounded-lg',
      md: 'h-11 text-sm px-3.5 rounded-xl',
      lg: 'h-12 text-base px-4 rounded-xl',
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold uppercase tracking-wider text-foreground-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center justify-center text-muted pointer-events-none transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={cn(
              'block w-full border bg-surface text-foreground placeholder:text-muted/70 shadow-sm font-medium',
              'transition-all duration-200 ease-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-elevated/40',
              sizeStyles[inputSize],
              hasError
                ? 'border-danger focus:border-danger focus:ring-danger/15'
                : isSuccess
                ? 'border-success focus:border-success focus:ring-success/15'
                : 'border-border-strong hover:border-foreground-secondary/60 focus:border-brand focus:ring-brand/15',
              icon ? 'pl-11' : '',
              (hasError || isSuccess || isPasswordType || rightElement) ? 'pr-11' : '',
              className
            )}
            {...props}
          />
          {isPasswordType && showPasswordToggle && !hasError && !isSuccess && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 flex items-center justify-center text-muted hover:text-foreground transition-colors p-1 rounded-md focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          {rightElement && !hasError && !isSuccess && !isPasswordType && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
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
          <p className="text-xs font-semibold text-danger animate-in slide-in-from-top-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
