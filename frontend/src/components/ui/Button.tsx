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
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand dark:focus-visible:ring-offset-[#0B0F14] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 relative overflow-hidden';
    
    const variants = {
      primary: 'bg-brand text-white hover:bg-brand-hover shadow-sm hover:shadow-md hover:-translate-y-[1px]',
      secondary: 'bg-secondary text-white hover:bg-secondary-hover shadow-sm',
      outline: 'bg-transparent text-foreground border border-border-strong hover:bg-state-hover dark:hover:bg-state-hover',
      ghost: 'bg-transparent text-foreground hover:bg-state-hover dark:hover:bg-state-hover',
      danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm hover:shadow-md hover:-translate-y-[1px]',
      success: 'bg-success text-white hover:bg-success/90 shadow-sm hover:shadow-md hover:-translate-y-[1px]',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs rounded-lg',
      md: 'h-11 px-6 text-sm rounded-xl',
      lg: 'h-14 px-8 text-base rounded-2xl',
      icon: 'h-11 w-11 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <span className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
          {children}
        </span>
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
