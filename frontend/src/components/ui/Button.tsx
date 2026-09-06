import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'brand' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus-ring active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none relative select-none whitespace-nowrap cursor-pointer';
    
    const variants: Record<ButtonVariant, string> = {
      // High-contrast primary
      primary: 'bg-foreground text-background hover:bg-foreground/90 shadow-sm border border-transparent active:bg-foreground/80',
      // Signature Farmket brand emerald
      brand: 'bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active shadow-sm hover:shadow border border-transparent',
      // Neutral elevated card surface with border
      secondary: 'bg-surface-elevated text-foreground border border-border-strong hover:bg-state-hover shadow-sm',
      // Clean transparent outline
      outline: 'bg-transparent text-foreground border border-border-strong hover:bg-state-hover hover:border-foreground-secondary/40',
      // Subtle ghost button
      ghost: 'bg-transparent text-foreground-secondary hover:text-foreground hover:bg-state-hover',
      // Destructive action
      danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-sm border border-transparent',
      // Semantic success (maps to brand)
      success: 'bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active shadow-sm border border-transparent',
      // Inline text link
      link: 'bg-transparent text-brand hover:underline underline-offset-4 p-0 h-auto font-medium',
    };

    const sizes = {
      sm: 'min-h-[36px] py-1.5 px-3.5 text-xs font-semibold rounded-xl gap-1.5',
      md: 'min-h-[44px] py-2 px-4.5 text-sm font-semibold rounded-xl gap-2',
      lg: 'min-h-[48px] py-2.5 px-6 text-base font-semibold rounded-xl gap-2.5',
      xl: 'min-h-[54px] py-3.5 px-8 text-base font-bold rounded-2xl gap-3',
      icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0 rounded-xl justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], variant !== 'link' && sizes[size], className)}
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
