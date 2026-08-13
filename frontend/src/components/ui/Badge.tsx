import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'outline';
  size?: 'sm' | 'md' | 'lg' | string;
  className?: string;
}

const variantStyles = {
  default: 'bg-surface border border-border-subtle text-foreground-secondary',
  brand: 'bg-brand-muted text-brand',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  info: 'bg-info-muted text-info',
  outline: 'bg-transparent border border-border-strong text-foreground-secondary',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
      variantStyles[variant],
      className
    )}
  >
    {children}
  </span>
);

// Status badge for orders
import type { OrderStatus } from '@/types';

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const map: Record<OrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pending:    { label: 'Pending',    variant: 'warning' },
    confirmed:  { label: 'Confirmed',  variant: 'info' },
    processing: { label: 'Processing', variant: 'brand' },
    shipped:    { label: 'Shipped',    variant: 'default' },
    delivered:  { label: 'Delivered',  variant: 'success' },
    cancelled:  { label: 'Cancelled',  variant: 'danger' },
  };

  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
};
