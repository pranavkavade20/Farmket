import React from 'react';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { cart, updateQuantity } = useCart();
  const { user } = useAuth();
  const primaryImage = product.images.find((img) => img.is_primary)?.image ?? product.images[0]?.image;

  // Check if item is already in cart to show the counter instead of 'Add to Cart'
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

  return (
    <div className="group relative flex flex-col rounded-[2rem] bg-white p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-gray-100/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 dark:bg-[#111] dark:ring-gray-800">
      
      {/* Favorite Button Overlay */}
      <button className="absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:text-red-500 hover:scale-110 group-hover:opacity-100 dark:bg-gray-900/80 dark:text-gray-500">
        <Heart className="h-4 w-4" />
      </button>

      {/* Image Container */}
      <Link to={`/marketplace/${product.slug}`} className="block">
        <div className="relative mb-4 flex h-44 w-full items-center justify-center rounded-[1.5rem] bg-[#F5F7F6] p-6 transition-colors group-hover:bg-[#EDF2F0] dark:bg-gray-900 overflow-hidden">
          <img
            src={primaryImage ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-2 text-center">
        <Link to={`/marketplace/${product.slug}`}>
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate transition-colors hover:text-green-600 dark:hover:text-green-400 leading-tight">
            {product.name}
          </h3>
        </Link>
        
        {/* Farmer Info */}
        <p className="mt-1 text-xs font-semibold text-gray-400 dark:text-gray-500">
          {product.farmer_name || 'Local Farmers'}
        </p>

        {/* Price & Action */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="text-center">
            <span className="text-lg font-black text-gray-900 dark:text-white">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">
              / per {product.unit}
            </span>
          </div>

          {user?.user_type === 'farmer' || user?.user_type === 'admin' ? null : cartItem ? (
            <div className="flex h-10 items-center justify-between rounded-full bg-green-700 px-1 text-white shadow-md dark:bg-green-600">
              <button 
                onClick={handleDecrease}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold">{cartItem.quantity}</span>
              <button 
                onClick={handleIncrease}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              disabled={!product.in_stock || !product.is_available}
              onClick={() => onAddToCart?.(product)}
              className={cn(
                "h-10 w-full rounded-full font-bold shadow-none transition-all flex items-center justify-center gap-1.5 text-sm",
                (product.in_stock && product.is_available)
                  ? "bg-gray-50 text-gray-900 hover:bg-green-700 hover:text-white dark:bg-gray-800 dark:text-white dark:hover:bg-green-600"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-800/50"
              )}
            >
              {(product.in_stock && product.is_available) ? (
                <>
                  <Plus className="h-4 w-4" />
                  Add To Cart
                </>
              ) : (
                !product.is_available ? 'Unavailable' : 'Sold out'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;