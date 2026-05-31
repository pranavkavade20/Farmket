import { Badge } from '@/components/ui';
import type { Product } from '@/types';
import { Clock, Sprout, ShoppingCart, Leaf, Flame, AlertCircle, Ban } from 'lucide-react';

interface Props {
  product: Product;
  className?: string;
}

export const ProductStatusBadge = ({ product, className }: Props) => {
  const { market_state } = product;

  switch (market_state) {
    case 'UPCOMING':
      return (
        <Badge variant="default" className={`bg-gray-100 text-gray-800 ${className}`}>
          <Clock className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
      );
    case 'GROWING':
      return (
        <Badge variant="default" className={`bg-green-100 text-green-800 border-green-200 ${className}`}>
          <Sprout className="w-3 h-3 mr-1" />
          Growing
        </Badge>
      );
    case 'READY_FOR_PREBOOKING':
      return (
        <Badge variant="default" className={`bg-blue-100 text-blue-800 border-blue-200 ${className}`}>
          <Leaf className="w-3 h-3 mr-1" />
          Pre-Booking Open
        </Badge>
      );
    case 'READY_TO_HARVEST':
      return (
        <Badge variant="default" className={`bg-purple-100 text-purple-800 border-purple-200 ${className}`}>
          <Clock className="w-3 h-3 mr-1" />
          Harvesting Soon
        </Badge>
      );
    case 'AVAILABLE_NOW':
      return (
        <Badge variant="default" className={`bg-emerald-100 text-emerald-800 border-emerald-200 ${className}`}>
          <ShoppingCart className="w-3 h-3 mr-1" />
          Available Now
        </Badge>
      );
    case 'LOW_STOCK':
      return (
        <Badge variant="default" className={`bg-orange-100 text-orange-800 border-orange-200 ${className}`}>
          <Flame className="w-3 h-3 mr-1" />
          Low Stock
        </Badge>
      );
    case 'SOLD_OUT':
      return (
        <Badge variant="default" className={`bg-red-100 text-red-800 border-red-200 ${className}`}>
          <Ban className="w-3 h-3 mr-1" />
          Sold Out
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className={`bg-gray-100 text-gray-800 ${className}`}>
          <AlertCircle className="w-3 h-3 mr-1" />
          Unknown
        </Badge>
      );
  }
};
