import React, { useState, useMemo } from 'react';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import {
  Plus,
  Minus,
  Heart,
  Star,
  BadgeCheck,
  Sprout,
  ShoppingCart,
  Clock,
  Leaf,
} from 'lucide-react';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  hideAddToCart?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, onAddToCart, hideAddToCart = false, className }) => {
    const { cart, updateQuantity } = useCart();
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    const primaryImage =
      product.images?.find((img) => img.is_primary)?.image ??
      product.images?.[0]?.image ??
      null;

    const cartItem = cart?.items.find((item) => item.product === product.id);

    const handleDecrease = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (cartItem && cartItem.quantity > 1) {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      }
    };

    const handleIncrease = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (cartItem) {
        updateQuantity(cartItem.id, cartItem.quantity + 1);
      }
    };

    const toggleFavorite = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFavorite((prev) => {
        const next = !prev;
        toast.success(next ? `Saved "${product.name}" to favorites` : `Removed from favorites`);
        return next;
      });
    };

    // Calculate real rating if reviews exist
    const { ratingText, ratingCount } = useMemo(() => {
      if (product.reviews && product.reviews.length > 0) {
        const sum = product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        const avg = (sum / product.reviews.length).toFixed(1);
        return { ratingText: avg, ratingCount: product.reviews.length };
      }
      return { ratingText: null, ratingCount: 0 };
    }, [product.reviews]);

    const formattedPrice = useMemo(() => {
      const priceNum = parseFloat(product.price || '0');
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(priceNum);
    }, [product.price]);

    const isAvailable = product.is_available && product.in_stock;
    const isPrebookable = product.is_prebookable || product.market_state === 'READY_FOR_PREBOOKING';
    const isGrowing = product.market_state === 'GROWING';

    return (
      <div
        className={cn(
          'group relative flex flex-col h-full w-full min-w-0 overflow-hidden rounded-2xl',
          'border border-border-subtle bg-surface shadow-xs transition-all duration-300',
          'hover:-translate-y-1 hover:border-border-strong hover:shadow-md',
          className
        )}
      >
        {/* Top Badges & Wishlist Action */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 max-w-[calc(100%-48px)]">
          {product.is_organic && (
            <Badge variant="success" size="sm" icon={<Leaf className="w-3 h-3 stroke-[2.2]" />}>
              Organic
            </Badge>
          )}

          {isPrebookable && (
            <Badge variant="submitted" size="sm">
              Pre-book
            </Badge>
          )}

          {isGrowing && product.progress > 0 && (
            <Badge variant="in-progress" size="sm">
              {product.progress}% Grown
            </Badge>
          )}

          {!isAvailable && !isPrebookable && (
            <Badge variant="failed" size="sm">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Wishlist Toggle Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={cn(
            'absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full',
            'bg-surface/85 backdrop-blur-md border border-border-subtle shadow-xs transition-all duration-200 cursor-pointer',
            isFavorite
              ? 'text-danger bg-surface'
              : 'text-foreground-secondary hover:text-danger hover:scale-110 opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100'
          )}
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
        </button>

        {/* Thumbnail Image Container */}
        <Link
          to={`/marketplace/${product.slug}`}
          className="block w-full overflow-hidden focus-ring rounded-t-2xl"
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className="relative aspect-[4/3] w-full flex items-center justify-center bg-surface-elevated/40 p-3 overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted">
                <Sprout className="h-10 w-10 stroke-1" />
                <span className="text-[10px] font-medium mt-1">Farm Harvest</span>
              </div>
            )}
          </div>
        </Link>

        {/* Card Body & Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Category Tag & Rating Bar */}
          <div className="flex items-center justify-between gap-2 mb-1.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted truncate">
              {product.category_name || 'Farm Harvest'}
            </span>

            {ratingText ? (
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs font-bold text-foreground">{ratingText}</span>
                <span className="text-[10px] text-muted">({ratingCount})</span>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-brand bg-brand/10 px-1.5 py-0.2 rounded-full">
                Fresh
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/marketplace/${product.slug}`}
            className="group/title block min-w-0 focus-ring rounded-md"
            title={product.name}
          >
            <h3 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug line-clamp-1 group-hover/title:text-brand transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Farmer Attribution */}
          <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
            <span
              className="text-xs font-medium text-foreground-secondary truncate"
              title={product.farmer_name || 'Verified Farmer'}
            >
              By {product.farmer_name || 'Verified Farmer'}
            </span>
            <BadgeCheck className="h-3.5 w-3.5 text-brand shrink-0" />
          </div>

          {/* Harvest Countdown if growing or pre-bookable */}
          {product.harvest_countdown > 0 && isGrowing && (
            <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-brand">
              <Clock className="h-3 w-3" />
              <span>Ready in {product.harvest_countdown} days</span>
            </div>
          )}

          {/* Price, Stock & Action Footer */}
          <div className="mt-auto pt-3 border-t border-border-subtle flex flex-col gap-2.5">
            {/* Price & Unit & Available Quantity */}
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1 truncate">
                <span className="text-base sm:text-lg font-display font-extrabold text-foreground">
                  {formattedPrice}
                </span>
                <span className="text-xs font-semibold text-foreground-secondary">
                  / {product.unit}
                </span>
              </div>

              <span className="text-[11px] font-medium text-foreground-secondary shrink-0 text-right">
                {isAvailable
                  ? `${product.available_quantity} ${product.unit} left`
                  : isPrebookable
                  ? 'Reserve now'
                  : 'Sold out'}
              </span>
            </div>

            {/* Interactive Action Button / Counter */}
            {!hideAddToCart && (
              user?.user_type === 'farmer' || user?.user_type === 'admin' ? null : cartItem ? (
                <div className="flex h-9 sm:h-10 w-full items-center justify-between rounded-xl bg-surface border border-brand p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    aria-label="Decrease quantity"
                    className="flex h-full w-8 sm:w-10 items-center justify-center rounded-lg bg-brand/10 text-brand hover:bg-brand hover:text-on-brand transition-colors cursor-pointer focus-ring"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
                    {cartItem.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    aria-label="Increase quantity"
                    className="flex h-full w-8 sm:w-10 items-center justify-center rounded-lg bg-brand/10 text-brand hover:bg-brand hover:text-on-brand transition-colors cursor-pointer focus-ring"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : isAvailable ? (
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  fullWidth
                  onClick={() => onAddToCart?.(product)}
                  leftIcon={<ShoppingCart className="h-3.5 w-3.5" />}
                  className="font-bold shadow-brand/15 h-9 sm:h-10"
                >
                  Add to Cart
                </Button>
              ) : isPrebookable ? (
                <Link to={`/marketplace/${product.slug}`} className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Clock className="h-3.5 w-3.5 text-warning" />}
                    className="font-bold h-9 sm:h-10"
                  >
                    Pre-order Harvest
                  </Button>
                </Link>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  disabled
                  className="h-9 sm:h-10 font-medium border-border-strong text-muted"
                >
                  Out of Stock
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;