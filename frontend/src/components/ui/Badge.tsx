import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Leaf } from 'lucide-react';
import type { OrderStatus } from '@/types';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'brand'
  | 'outline'
  | 'yellow'
  | 'orange'
  | 'tomato'
  | 'sky'
  | 'berry';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-surface-elevated border border-border-subtle text-foreground-secondary',
  brand:
    'bg-brand-muted border border-brand/20 text-brand dark:text-brand-vivid',
  success:
    'bg-success-muted border border-success/20 text-success',
  warning:
    'bg-warning-muted border border-warning/20 text-warning',
  danger:
    'bg-danger-muted border border-danger/20 text-danger',
  info:
    'bg-info-muted border border-info/20 text-info',
  outline:
    'bg-transparent border border-border-strong text-foreground-secondary',
  yellow:
    'bg-accent-yellow-muted border border-accent-yellow/30 text-accent-yellow dark:text-accent-yellow',
  orange:
    'bg-accent-orange-muted border border-accent-orange/30 text-accent-orange',
  tomato:
    'bg-accent-tomato-muted border border-accent-tomato/30 text-accent-tomato',
  sky:
    'bg-accent-sky-muted border border-accent-sky/30 text-accent-sky',
  berry:
    'bg-accent-berry-muted border border-accent-berry/30 text-accent-berry',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] leading-tight',
  md: 'px-2.5 py-0.5 text-xs leading-normal',
  lg: 'px-3 py-1 text-sm leading-normal',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide shrink-0 transition-colors',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
  >
    {dot && (
      <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0 animate-pulse" />
    )}
    {icon && <span className="shrink-0">{icon}</span>}
    <span>{children}</span>
  </span>
);

// Status badge for orders
export const OrderStatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({
  status,
  className,
}) => {
  const map: Record<OrderStatus, { label: string; variant: BadgeVariant; dot?: boolean }> = {
    pending: { label: 'Pending', variant: 'warning', dot: true },
    confirmed: { label: 'Confirmed', variant: 'info' },
    processing: { label: 'Processing', variant: 'brand', dot: true },
    shipped: { label: 'Shipped', variant: 'sky' },
    delivered: { label: 'Delivered', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
  };

  const current = map[status] || { label: status, variant: 'default' };
  return (
    <Badge variant={current.variant} dot={current.dot} className={className}>
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
  const map: Record<string, { label: string; variant: BadgeVariant; dot?: boolean }> = {
    PLANTED: { label: 'Planted', variant: 'info' },
    GROWING: { label: 'Actively Growing', variant: 'brand', dot: true },
    NEAR_HARVEST: { label: 'Near Harvest', variant: 'warning', dot: true },
    HARVESTED: { label: 'Harvested', variant: 'success' },
  };

  const current = map[stage] || { label: stage, variant: 'default' };
  return (
    <Badge variant={current.variant} dot={current.dot} className={className}>
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
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    farmer: { label: 'Farmer', variant: 'brand' },
    buyer: { label: 'Buyer', variant: 'sky' },
    admin: { label: 'Admin', variant: 'danger' },
  };
  const current = map[role.toLowerCase()] || { label: role, variant: 'default' };
  return (
    <Badge variant={current.variant} className={cn('uppercase text-[10px] tracking-wider font-bold', className)}>
      {current.label}
    </Badge>
  );
};
