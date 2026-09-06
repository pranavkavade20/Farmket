import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Leaf } from 'lucide-react';
import type { OrderStatus } from '@/types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'outline';
  size?: 'sm' | 'md' | 'lg';
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

const sizeStyles = {
  sm: 'px-2 py-0.2 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full font-semibold tracking-wide',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
  >
    {children}
  </span>
);

// Status badge for orders
export const OrderStatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({
  status,
  className,
}) => {
  const map: Record<OrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pending: { label: 'Pending', variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'info' },
    processing: { label: 'Processing', variant: 'brand' },
    shipped: { label: 'Shipped', variant: 'default' },
    delivered: { label: 'Delivered', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
  };

  const current = map[status] || { label: status, variant: 'default' };
  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  );
};

// Status badge for crop stages
export type CropStage = 'PLANTED' | 'GROWING' | 'NEAR_HARVEST' | 'HARVESTED';

export const CropStageBadge: React.FC<{ stage: CropStage | string; className?: string }> = ({
  stage,
  className,
}) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PLANTED: { label: 'Planted', variant: 'info' },
    GROWING: { label: 'Actively Growing', variant: 'brand' },
    NEAR_HARVEST: { label: 'Near Harvest', variant: 'warning' },
    HARVESTED: { label: 'Harvested', variant: 'success' },
  };

  const current = map[stage] || { label: stage, variant: 'default' };
  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  );
};

// Quality badge for organic produce
export const QualityBadge: React.FC<{ isOrganic?: boolean; className?: string }> = ({
  isOrganic = true,
  className,
}) => {
  if (!isOrganic) return null;
  return (
    <Badge variant="success" className={cn('gap-1', className)}>
      <Leaf className="w-3 h-3 stroke-[2.5]" />
      <span>Organic</span>
    </Badge>
  );
};

// Role badge for user types
export const RoleBadge: React.FC<{ role: string; className?: string }> = ({
  role,
  className,
}) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    farmer: { label: 'Farmer', variant: 'brand' },
    buyer: { label: 'Buyer', variant: 'info' },
    admin: { label: 'Admin', variant: 'danger' },
  };
  const current = map[role.toLowerCase()] || { label: role, variant: 'default' };
  return (
    <Badge variant={current.variant} className={cn('uppercase text-[10px] tracking-wider', className)}>
      {current.label}
    </Badge>
  );
};
