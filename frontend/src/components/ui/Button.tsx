import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-[14px] font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-[#0B0F14] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100';
    
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md hover:-translate-y-[1px]',
      secondary: 'bg-surface text-foreground border border-border-subtle hover:bg-gray-50 dark:hover:bg-white/5',
      outline: 'bg-transparent text-foreground border border-border-subtle hover:bg-gray-50 dark:hover:bg-white/5',
      ghost: 'bg-transparent text-foreground hover:bg-gray-100 dark:hover:bg-white/10',
    };

    const sizes = {
      sm: 'h-10 px-6 text-xs',
      md: 'h-12 px-8 text-sm',
      lg: 'h-14 px-10 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
