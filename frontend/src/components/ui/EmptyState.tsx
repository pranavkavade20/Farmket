import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Button, type ButtonVariant } from './Button';

export interface EmptyStateActionConfig {
  label: string;
  onClick?: () => void;
  variant?: ButtonVariant;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode | EmptyStateActionConfig;
  secondaryAction?: React.ReactNode | EmptyStateActionConfig;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function renderAction(action?: React.ReactNode | EmptyStateActionConfig, defaultVariant: ButtonVariant = 'primary') {
  if (!action) return null;
  if (React.isValidElement(action)) return action;
  if (typeof action === 'object' && 'label' in action) {
    const config = action as EmptyStateActionConfig;
    return (
      <Button
        variant={config.variant || defaultVariant}
        onClick={config.onClick}
      >
        {config.label}
      </Button>
    );
  }
  return action as React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
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
    md: 'py-16 px-6',
    lg: 'py-24 px-8',
  };

  const renderedAction = renderAction(action, 'primary');
  const renderedSecondaryAction = renderAction(secondaryAction, 'outline');

  return (
    <div
      className={cn(
        'w-full flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border-strong bg-surface',
        padClasses[size],
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center text-foreground-secondary mb-5 shadow-inner',
            iconSizeClasses[size]
          )}
        >
          {icon}
        </div>
      )}
      <h3 className="text-xl font-display font-bold text-foreground mb-2 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-foreground-secondary max-w-sm leading-relaxed mb-6 font-medium">
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
