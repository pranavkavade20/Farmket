import React from 'react';
import { Badge, type BadgeVariant } from '@/components/ui';
import type { Product } from '@/types';
import {
  Clock,
  Sprout,
  Send,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface Props {
  product: Product;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const getBadgeConfig = (
  marketState?: string
): { variant: BadgeVariant; icon: React.ReactNode; label: string } => {
  switch (marketState) {
    case 'UPCOMING':
      return {
        variant: 'expired',
        icon: <Clock className="w-3.5 h-3.5 stroke-[2.2]" />,
        label: 'Upcoming',
      };
    case 'GROWING':
      return {
        variant: 'success',
        icon: <Sprout className="w-3.5 h-3.5 stroke-[2.2]" />,
        label: 'Growing',
      };
    case 'READY_FOR_PREBOOKING':
      return {
        variant: 'submitted',
        icon: <Send className="w-3.5 h-3.5 stroke-[2.2]" />,
        label: 'Pre-Booking Open',
      };
    case 'READY_TO_HARVEST':
      return {
        variant: 'in-review',
        icon: <FileSearch className="w-3.5 h-3.5 stroke-[2.2]" />,
        label: 'Harvesting Soon',
      };
    case 'AVAILABLE_NOW':
      return {
        variant: 'success',
        icon: <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />,
        label: 'Available Now',
      };
    case 'LOW_STOCK':
      return {
        variant: 'pending',
        icon: <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />,
        label: 'Low Stock',
      };
    case 'SOLD_OUT':
      return {
        variant: 'failed',
        icon: <XCircle className="w-3.5 h-3.5 stroke-[2.2]" />,
        label: 'Sold Out',
      };
    default:
      return {
        variant: 'expired',
        icon: <Clock className="w-3.5 h-3.5 stroke-[2.2]" />,
        label: 'Status Pending',
      };
  }
};

export const ProductStatusBadge: React.FC<Props> = ({ product, className, size = 'sm' }) => {
  const { variant, icon, label } = getBadgeConfig(product.market_state);

  return (
    <Badge variant={variant} size={size} icon={icon} className={className}>
      {label}
    </Badge>
  );
};

export default ProductStatusBadge;
