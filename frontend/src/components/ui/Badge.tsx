import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-200',
  success: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  warning: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
  error: 'bg-error/10 text-error dark:bg-error/20 dark:text-error',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
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
    processing: { label: 'Processing', variant: 'info' },
    shipped:    { label: 'Shipped',    variant: 'default' },
    delivered:  { label: 'Delivered',  variant: 'success' },
    cancelled:  { label: 'Cancelled',  variant: 'error' },
  };

  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
};
