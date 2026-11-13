import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'brand'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'link'
  | 'neutral';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus-ring active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none relative select-none whitespace-nowrap cursor-pointer';

    const variants: Record<ButtonVariant, string> = {
      // Signature Farmket brand emerald primary CTA
      primary:
        'bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active shadow-sm hover:shadow-brand/20 active:translate-y-0 hover:-translate-y-0.5 border border-transparent',
      // Explicit brand variant synonymous with primary
      brand:
        'bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active shadow-sm hover:shadow-brand/20 active:translate-y-0 hover:-translate-y-0.5 border border-transparent',
      // Neutral elevated card surface with subtle border
      secondary:
        'bg-surface-elevated text-foreground border border-border-strong hover:bg-state-hover hover:border-foreground-secondary/40 shadow-xs active:translate-y-0 hover:-translate-y-0.5',
      // Clean transparent outline button
      outline:
        'bg-transparent text-foreground border border-border-strong hover:bg-state-hover hover:border-foreground-secondary/60 active:translate-y-0 hover:-translate-y-0.5',
      // Subtle ghost button
      ghost:
        'bg-transparent text-foreground-secondary hover:text-foreground hover:bg-state-hover',
      // High-contrast neutral button (dark in light mode, light in dark mode)
      neutral:
        'bg-foreground text-background hover:bg-foreground/90 shadow-sm border border-transparent active:bg-foreground/80',
      // Destructive action
      danger:
        'bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-sm border border-transparent active:translate-y-0 hover:-translate-y-0.5',
      // Semantic success (maps to brand)
      success:
        'bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active shadow-sm border border-transparent active:translate-y-0 hover:-translate-y-0.5',
      // Inline text link
      link:
        'bg-transparent text-brand hover:underline underline-offset-4 p-0 h-auto font-medium',
    };

    const sizes = {
      sm: 'min-h-[36px] py-1.5 px-3 text-xs font-semibold rounded-xl gap-1.5',
      md: 'min-h-[44px] py-2 px-4.5 text-sm font-semibold rounded-xl gap-2',
      lg: 'min-h-[48px] py-2.5 px-6 text-base font-semibold rounded-xl gap-2.5',
      xl: 'min-h-[54px] py-3.5 px-8 text-base font-bold rounded-2xl gap-3',
      icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0 rounded-xl justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== 'link' && sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        <span
          className={cn(
            'inline-flex items-center justify-center gap-2',
            isLoading && 'opacity-0'
          )}
        >
          {leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
        </span>
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" role="status">
            <Loader2 className="h-4 w-4 animate-spin text-current" aria-hidden="true" />
            <span className="sr-only">Loading...</span>
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
