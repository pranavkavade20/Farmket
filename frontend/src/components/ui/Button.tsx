import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-ring active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';
    
    const variants = {
      primary: 'bg-brand text-white hover:bg-brand-hover shadow-sm hover:shadow-md dark:shadow-none border border-transparent',
      secondary: 'bg-secondary text-foreground hover:bg-secondary-hover shadow-sm border border-border-subtle',
      outline: 'bg-transparent text-foreground border border-border-strong hover:bg-state-hover dark:hover:bg-state-hover',
      ghost: 'bg-transparent text-foreground hover:bg-state-hover dark:hover:bg-state-hover',
      danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm border border-transparent',
      success: 'bg-success text-white hover:bg-success/90 shadow-sm border border-transparent',
    };

    const sizes = {
      sm: 'py-1.5 px-3 text-xs rounded-md',
      md: 'py-2 px-4 text-sm rounded-lg',
      lg: 'py-3 px-6 text-base rounded-xl',
      icon: 'h-10 w-10 rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
          {children}
        </span>
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
