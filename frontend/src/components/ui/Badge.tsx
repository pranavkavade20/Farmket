import React from 'react';
import { cn } from '@/lib/utils/cn';
import {
  AlertTriangle,
  CircleDashed,
  Send,
  FileSearch,
  CheckCircle2,
  XCircle,
  Clock,
  Leaf,
} from 'lucide-react';
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
  | 'berry'
  | 'neutral'
  // Canonical status design variants from visual specification
  | 'pending'
  | 'in-progress'
  | 'submitted'
  | 'in-review'
  | 'failed'
  | 'expired';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  dot?: boolean;
  icon?: React.ReactNode | false | null;
  autoIcon?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  // 1. Pending (Amber / Orange)
  pending:
    'bg-[#FEF3C7]/80 text-[#B45309] border border-amber-500/20 dark:bg-[#2A1D0E]/80 dark:text-[#FB923C] dark:border-amber-500/25',
  warning:
    'bg-[#FEF3C7]/80 text-[#B45309] border border-amber-500/20 dark:bg-[#2A1D0E]/80 dark:text-[#FB923C] dark:border-amber-500/25',
  orange:
    'bg-[#FEF3C7]/80 text-[#B45309] border border-amber-500/20 dark:bg-[#2A1D0E]/80 dark:text-[#FB923C] dark:border-amber-500/25',

  // 2. In progress (Sky Blue)
  'in-progress':
    'bg-[#E0F2FE]/75 text-[#0284C7] border border-sky-500/20 dark:bg-[#0B2236]/80 dark:text-[#38BDF8] dark:border-sky-500/25',
  info:
    'bg-[#E0F2FE]/75 text-[#0284C7] border border-sky-500/20 dark:bg-[#0B2236]/80 dark:text-[#38BDF8] dark:border-sky-500/25',
  sky:
    'bg-[#E0F2FE]/75 text-[#0284C7] border border-sky-500/20 dark:bg-[#0B2236]/80 dark:text-[#38BDF8] dark:border-sky-500/25',

  // 3. Submitted (Violet / Purple)
  submitted:
    'bg-[#EDE9FE]/75 text-[#7C3AED] border border-purple-500/20 dark:bg-[#1E1435]/80 dark:text-[#A78BFA] dark:border-purple-500/25',
  berry:
    'bg-[#EDE9FE]/75 text-[#7C3AED] border border-purple-500/20 dark:bg-[#1E1435]/80 dark:text-[#A78BFA] dark:border-purple-500/25',

  // 4. In review (Warm Yellow / Gold)
  'in-review':
    'bg-[#FEF9C3]/80 text-[#A16207] border border-yellow-500/20 dark:bg-[#26220D]/80 dark:text-[#FACC15] dark:border-yellow-500/25',
  yellow:
    'bg-[#FEF9C3]/80 text-[#A16207] border border-yellow-500/20 dark:bg-[#26220D]/80 dark:text-[#FACC15] dark:border-yellow-500/25',

  // 5. Success (Fresh Emerald / Green)
  success:
    'bg-[#DCFCE7]/75 text-[#15803D] border border-emerald-500/20 dark:bg-[#0E2818]/80 dark:text-[#4ADE80] dark:border-emerald-500/25',
  brand:
    'bg-[#DCFCE7]/75 text-[#15803D] border border-emerald-500/20 dark:bg-[#0E2818]/80 dark:text-[#4ADE80] dark:border-emerald-500/25',

  // 6. Failed (Rose / Crimson)
  failed:
    'bg-[#FEE2E2]/75 text-[#B91C1C] border border-rose-500/20 dark:bg-[#2C1316]/80 dark:text-[#F87171] dark:border-rose-500/25',
  danger:
    'bg-[#FEE2E2]/75 text-[#B91C1C] border border-rose-500/20 dark:bg-[#2C1316]/80 dark:text-[#F87171] dark:border-rose-500/25',
  tomato:
    'bg-[#FEE2E2]/75 text-[#B91C1C] border border-rose-500/20 dark:bg-[#2C1316]/80 dark:text-[#F87171] dark:border-rose-500/25',

  // 7. Expired / Default / Neutral (Cool Slate / Gray)
  expired:
    'bg-[#F1F5F9] text-[#475569] border border-slate-500/20 dark:bg-[#1A2027]/80 dark:text-[#94A3B8] dark:border-slate-500/25',
  default:
    'bg-[#F1F5F9] text-[#475569] border border-slate-500/20 dark:bg-[#1A2027]/80 dark:text-[#94A3B8] dark:border-slate-500/25',
  neutral:
    'bg-[#F1F5F9] text-[#475569] border border-slate-500/20 dark:bg-[#1A2027]/80 dark:text-[#94A3B8] dark:border-slate-500/25',

  // Outline
  outline:
    'bg-transparent border border-border-strong text-foreground-secondary hover:bg-surface-elevated',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-[11px] gap-1.5 font-medium leading-tight',
  md: 'px-3 py-1 text-xs sm:text-[13px] gap-1.5 font-medium leading-normal',
  lg: 'px-3.5 py-1.5 text-sm gap-2 font-medium leading-normal',
};

const iconSizes = {
  sm: 'w-3 h-3 shrink-0 stroke-[2.2]',
  md: 'w-3.5 h-3.5 shrink-0 stroke-[2.2]',
  lg: 'w-4 h-4 shrink-0 stroke-[2.2]',
};

// Canonical status icons directly mapped from design images
const getCanonicalIcon = (variant: BadgeVariant, size: 'sm' | 'md' | 'lg') => {
  const iconCls = iconSizes[size];
  switch (variant) {
    case 'pending':
    case 'warning':
    case 'orange':
      return <AlertTriangle className={iconCls} aria-hidden="true" />;
    case 'in-progress':
    case 'info':
    case 'sky':
      return <CircleDashed className={iconCls} aria-hidden="true" />;
    case 'submitted':
    case 'berry':
      return <Send className={iconCls} aria-hidden="true" />;
    case 'in-review':
    case 'yellow':
      return <FileSearch className={iconCls} aria-hidden="true" />;
    case 'success':
      return <CheckCircle2 className={iconCls} aria-hidden="true" />;
    case 'failed':
    case 'danger':
    case 'tomato':
      return <XCircle className={iconCls} aria-hidden="true" />;
    case 'expired':
      return <Clock className={iconCls} aria-hidden="true" />;
    default:
      return null;
  }
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  dot = false,
  icon,
  autoIcon = true,
  className,
}) => {
  // Resolve icon display
  let resolvedIcon: React.ReactNode = null;
  if (icon !== undefined) {
    resolvedIcon = icon || null;
  } else if (!dot && autoIcon) {
    resolvedIcon = getCanonicalIcon(variant, size);
  }

  const shapeClass = shape === 'pill' ? 'rounded-full' : 'rounded-xl';

  return (
    <span
      className={cn(
        'inline-flex items-center tracking-normal shrink-0 transition-colors select-none',
        shapeClass,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current shrink-0 animate-pulse"
          aria-hidden="true"
        />
      )}
      {resolvedIcon && (
        <span className="shrink-0 flex items-center" aria-hidden="true">
          {resolvedIcon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

// ── Canonical StatusBadge Component (Directly matches the visual design) ──────
export type StatusBadgeType =
  | 'pending'
  | 'in-progress'
  | 'submitted'
  | 'in-review'
  | 'success'
  | 'failed'
  | 'expired';

export interface StatusBadgeProps {
  status: StatusBadgeType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  shape = 'rounded',
  className,
}) => {
  const normalized = status.toLowerCase().replace(/_/g, '-') as BadgeVariant;
  const labels: Record<string, string> = {
    pending: 'Pending',
    'in-progress': 'In progress',
    submitted: 'Submitted',
    'in-review': 'In review',
    success: 'Success',
    failed: 'Failed',
    expired: 'Expired',
  };

  const displayLabel = label || labels[normalized] || status;
  const variant: BadgeVariant =
    normalized in variantStyles ? normalized : 'default';

  return (
    <Badge variant={variant} size={size} shape={shape} className={className}>
      {displayLabel}
    </Badge>
  );
};

// ── Status badge for orders ───────────────────────────────────────────────────
export const OrderStatusBadge: React.FC<{
  status: OrderStatus | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, className, size = 'sm' }) => {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pending: { label: 'Pending', variant: 'pending' },
    confirmed: { label: 'Submitted', variant: 'submitted' },
    processing: { label: 'In progress', variant: 'in-progress' },
    shipped: { label: 'In progress', variant: 'in-progress' },
    delivered: { label: 'Delivered', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'failed' },
    failed: { label: 'Failed', variant: 'failed' },
    expired: { label: 'Expired', variant: 'expired' },
  };

  const current = map[status.toLowerCase()] || { label: status, variant: 'default' };
  return (
    <Badge variant={current.variant} size={size} className={className}>
      {current.label}
    </Badge>
  );
};

// ── Status badge for crop stages ──────────────────────────────────────────────
export type CropStage = 'PLANTED' | 'GROWING' | 'NEAR_HARVEST' | 'HARVESTED';

export const CropStageBadge: React.FC<{
  stage: CropStage | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ stage, className, size = 'sm' }) => {
  const map: Record<string, { label: string; variant: BadgeVariant; icon?: React.ReactNode }> = {
    PLANTED: { label: 'Planted', variant: 'in-progress' },
    GROWING: { label: 'Growing', variant: 'success' },
    NEAR_HARVEST: { label: 'Near Harvest', variant: 'pending' },
    HARVESTED: { label: 'Harvested', variant: 'success' },
  };

  const current = map[stage] || { label: stage, variant: 'default' };
  return (
    <Badge variant={current.variant} size={size} className={className}>
      {current.label}
    </Badge>
  );
};

// ── Quality badge for organic produce ────────────────────────────────────────
export const QualityBadge: React.FC<{
  isOrganic?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isOrganic = true, className, size = 'sm' }) => {
  if (!isOrganic) return null;
  return (
    <Badge
      variant="success"
      size={size}
      icon={<Leaf className="w-3.5 h-3.5 stroke-[2.2]" />}
      className={className}
    >
      <span>Organic</span>
    </Badge>
  );
};

// ── Role badge for user types ────────────────────────────────────────────────
export const RoleBadge: React.FC<{
  role: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ role, className, size = 'sm' }) => {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    farmer: { label: 'Farmer', variant: 'success' },
    buyer: { label: 'Buyer', variant: 'in-progress' },
    admin: { label: 'Admin', variant: 'failed' },
  };
  const current = map[role.toLowerCase()] || { label: role, variant: 'default' };
  return (
    <Badge
      variant={current.variant}
      size={size}
      className={cn('uppercase text-[10px] tracking-wider font-bold', className)}
    >
      {current.label}
    </Badge>
  );
};
