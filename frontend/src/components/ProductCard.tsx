import React from 'react';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Star, MapPin, Leaf, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const primaryImage = product.images.find((img) => img.is_primary)?.image ?? product.images[0]?.image;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group rounded-2xl overflow-hidden bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={primaryImage ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.is_organic && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            <Leaf className="h-3 w-3" /> Organic
          </span>
        )}
        <div className="absolute top-3 right-3 rounded-full bg-white/90 dark:bg-gray-900/90 px-2.5 py-1 text-xs font-bold text-green-700 dark:text-green-400 shadow">
          ₹{parseFloat(product.price).toLocaleString('en-IN')}/{product.unit}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-500">
            {product.category_name}
          </span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Farmer info */}
        <div className="flex items-center gap-2 mb-3">
          <div className={cn('h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-xs font-bold')}>
            {product.farmer_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{product.farmer_name}</span>
        </div>

        {/* Rating & CTA */}
        <div className="flex items-center justify-between">
          {avgRating !== null ? (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">({product.reviews.length})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">No reviews yet</span>
          )}

          <div className="flex items-center gap-2">
            <Link to={`/marketplace/${product.slug}`}>
              <Button
                size="sm"
                variant="outline"
                className="px-2.5 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/30 dark:hover:text-green-400 dark:hover:border-green-800"
                aria-label={`View ${product.name} details`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="primary"
              disabled={!product.in_stock}
              onClick={() => onAddToCart?.(product)}
              className="gap-1.5"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {product.in_stock ? 'Add' : 'Sold out'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
