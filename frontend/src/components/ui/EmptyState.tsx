import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Button, type ButtonVariant } from './Button';

export interface EmptyStateActionConfig {
  label: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  iconVariant?: 'brand' | 'neutral' | 'warning' | 'danger';
  title: string;
  description?: string;
  action?: React.ReactNode | EmptyStateActionConfig;
  secondaryAction?: React.ReactNode | EmptyStateActionConfig;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function renderAction(
  action?: React.ReactNode | EmptyStateActionConfig,
  defaultVariant: ButtonVariant = 'brand'
) {
  if (!action) return null;
  if (React.isValidElement(action)) return action;
  if (typeof action === 'object' && 'label' in action) {
    const config = action as EmptyStateActionConfig;
    return (
      <Button
        variant={config.variant || defaultVariant}
        onClick={config.onClick}
        leftIcon={config.icon}
      >
        {config.label}
      </Button>
    );
  }
  return action as React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconVariant = 'brand',
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const iconSizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  const padClasses = {
    sm: 'py-8 px-4',
    md: 'py-14 px-6',
    lg: 'py-20 px-8',
  };

  const iconVariantClasses = {
    brand: 'bg-brand-muted/50 border-brand/20 text-brand dark:text-brand-vivid',
    neutral: 'bg-surface-elevated border-border-subtle text-foreground-secondary',
    warning: 'bg-warning-muted/60 border-warning/30 text-warning',
    danger: 'bg-danger-muted/60 border-danger/30 text-danger',
  };

  const renderedAction = renderAction(action, 'brand');
  const renderedSecondaryAction = renderAction(secondaryAction, 'outline');

  return (
    <div
      role="status"
      className={cn(
        'w-full flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border-strong/70 bg-surface/50 backdrop-blur-xs',
        padClasses[size],
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'rounded-2xl border flex items-center justify-center mb-5 shadow-xs transition-transform duration-200 hover:scale-105',
            iconSizeClasses[size],
            iconVariantClasses[iconVariant]
          )}
        >
          {icon}
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-foreground-secondary max-w-md leading-relaxed mb-6 font-medium">
          {description}
        </p>
      )}
      {(renderedAction || renderedSecondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {renderedAction}
          {renderedSecondaryAction}
        </div>
      )}
    </div>
  );
};
