import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
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
