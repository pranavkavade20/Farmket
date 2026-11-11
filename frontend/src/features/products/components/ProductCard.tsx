import React from 'react';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Plus, Minus, Heart, MapPin, Star, BadgeCheck, Sprout } from 'lucide-react';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  hideAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onAddToCart, hideAddToCart = false }) => {
  const { cart, updateQuantity } = useCart();
  const { user } = useAuth();
  const primaryImage = product.images.find((img) => img.is_primary)?.image ?? product.images[0]?.image;

  const cartItem = cart?.items.find((item) => item.product === product.id);

  const handleDecrease = () => {
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    }
  };

  // Mocking rating and location for UI purposes if missing
  const rating = "4.8";
  const location = "Pune, Maharashtra";
  const distance = "12 km";
  const isVerified = true;

  return (
    <div className="group relative flex flex-col h-full w-full min-w-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-md">
      
      {/* Top Badges & Favorite */}
      <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-10 flex flex-wrap gap-1.5 max-w-[calc(100%-48px)]">
        {product.is_organic && <Badge variant="success">Organic</Badge>}
        {!product.is_available && <Badge variant="danger">Sold Out</Badge>}
      </div>
      
      <button 
        type="button"
        aria-label="Add to wishlist"
        className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-foreground-secondary opacity-0 shadow-sm backdrop-blur-sm transition-all hover:text-danger hover:scale-110 group-hover:opacity-100"
      >
        <Heart className="h-4 w-4" />
      </button>

      {/* Image Container */}
      <Link to={`/marketplace/${product.slug}`} className="block w-full">
        <div className="relative mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-background p-3 transition-colors group-hover:bg-brand-muted/20 overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-foreground-secondary/40">
              <Sprout className="h-10 w-10 stroke-1" />
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2 mb-1.5 min-w-0 w-full">
          <Link 
            to={`/marketplace/${product.slug}`} 
            className="min-w-0 flex-1"
            title={product.name}
          >
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm sm:text-base font-bold text-foreground leading-snug transition-colors hover:text-brand break-words">
              {product.name}
            </h3>
          </Link>
          <div className="shrink-0 flex items-center gap-1 text-accent-yellow mt-0.5">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-bold text-foreground">{rating}</span>
          </div>
        </div>
        
        {/* Farmer Info */}
        <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
          <span className="text-xs font-semibold text-foreground-secondary truncate" title={product.farmer_name || 'Local Farmers'}>
            {product.farmer_name || 'Local Farmers'}
          </span>
          {isVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />}
        </div>

        {/* Location & Distance */}
        <div className="flex items-center gap-1 mb-3 text-muted text-xs min-w-0">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{location} • {distance}</span>
        </div>

        {/* Price & Quantity & Action */}
        <div className="mt-auto pt-3 border-t border-border-subtle flex flex-col gap-2.5">
          
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <div className="flex items-baseline gap-1 min-w-0 truncate">
              <span className="text-base sm:text-lg font-black text-foreground">
                ₹{parseFloat(product.price || '0').toFixed(2)}
              </span>
              <span className="text-xs font-bold text-foreground-secondary shrink-0">
                / {product.unit}
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-foreground-secondary shrink-0 text-right">
              Available: {product.available_quantity} {product.unit}
            </span>
          </div>

          {!hideAddToCart && (
            user?.user_type === 'farmer' || user?.user_type === 'admin' ? null : cartItem ? (
              <div className="flex h-9 sm:h-10 w-full items-center justify-between rounded-lg bg-surface border border-brand p-1 shadow-sm">
                <button 
                  type="button"
                  onClick={handleDecrease}
                  aria-label="Decrease quantity"
                  className="flex h-full w-8 sm:w-10 items-center justify-center rounded-md bg-brand-muted text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <span className="text-xs sm:text-sm font-bold text-foreground">{cartItem.quantity}</span>
                <button 
                  type="button"
                  onClick={handleIncrease}
                  aria-label="Increase quantity"
                  className="flex h-full w-8 sm:w-10 items-center justify-center rounded-md bg-brand-muted text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            ) : (
              <Button
                variant={(product.in_stock && product.is_available) ? 'secondary' : 'outline'}
                disabled={!product.in_stock || !product.is_available}
                onClick={() => onAddToCart?.(product)}
                size="sm"
                className={cn(
                  "w-full font-bold h-9 sm:h-10 text-xs sm:text-sm",
                  (!product.in_stock || !product.is_available) && "border-border-strong text-muted bg-surface cursor-not-allowed"
                )}
              >
                {(product.in_stock && product.is_available) ? (
                  <>Add To Cart</>
                ) : (
                  !product.is_available ? 'Unavailable' : 'Out of stock'
                )}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;