import React from 'react';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Plus, Minus, Heart, MapPin, Star, BadgeCheck } from 'lucide-react';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onAddToCart }) => {
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
    <div className="group relative flex flex-col rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-md">
      
      {/* Top Badges & Favorite */}
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        {product.is_organic && <Badge variant="success">Organic</Badge>}
        {!product.is_available && <Badge variant="danger">Sold Out</Badge>}
      </div>
      
      <button className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-foreground-secondary opacity-0 shadow-sm backdrop-blur-sm transition-all hover:text-danger hover:scale-110 group-hover:opacity-100">
        <Heart className="h-4 w-4" />
      </button>

      {/* Image Container */}
      <Link to={`/marketplace/${product.slug}`} className="block">
        <div className="relative mb-4 flex h-48 w-full items-center justify-center rounded-xl bg-background p-4 transition-colors group-hover:bg-brand-muted/20 overflow-hidden">
          <img
            src={primaryImage ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-1">
        
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/marketplace/${product.slug}`} className="flex-1">
            <h3 className="text-base font-bold text-foreground truncate transition-colors hover:text-brand leading-tight">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-accent-yellow">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-bold text-foreground">{rating}</span>
          </div>
        </div>
        
        {/* Farmer Info */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold text-foreground-secondary">
            {product.farmer_name || 'Local Farmers'}
          </span>
          {isVerified && <BadgeCheck className="h-3.5 w-3.5 text-brand" />}
        </div>

        {/* Location & Distance */}
        <div className="flex items-center gap-1 mb-4 text-muted">
          <MapPin className="h-3 w-3" />
          <span className="text-xs font-medium">{location} • {distance}</span>
        </div>

        {/* Price & Quantity & Action */}
        <div className="mt-auto pt-4 border-t border-border-subtle flex flex-col gap-3">
          
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-foreground">
                ₹{parseFloat(product.price).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-foreground-secondary">
                / {product.unit}
              </span>
            </div>
            <span className="text-xs font-medium text-foreground-secondary">
              Available: {product.available_quantity} {product.unit}
            </span>
          </div>

          {user?.user_type === 'farmer' || user?.user_type === 'admin' ? null : cartItem ? (
            <div className="flex h-10 w-full items-center justify-between rounded-lg bg-surface border border-brand p-1 shadow-sm">
              <button 
                onClick={handleDecrease}
                className="flex h-full w-10 items-center justify-center rounded-md bg-brand-muted text-brand hover:bg-brand hover:text-white transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold text-foreground">{cartItem.quantity}</span>
              <button 
                onClick={handleIncrease}
                className="flex h-full w-10 items-center justify-center rounded-md bg-brand-muted text-brand hover:bg-brand hover:text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              variant={(product.in_stock && product.is_available) ? 'secondary' : 'outline'}
              disabled={!product.in_stock || !product.is_available}
              onClick={() => onAddToCart?.(product)}
              className={cn(
                "w-full font-bold",
                (!product.in_stock || !product.is_available) && "border-border-strong text-muted bg-surface cursor-not-allowed"
              )}
            >
              {(product.in_stock && product.is_available) ? (
                <>Add To Cart</>
              ) : (
                !product.is_available ? 'Unavailable' : 'Out of stock'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;