import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Switch } from '@/components/ui';
import { ProductStatusBadge } from './ProductStatusBadge';
import type { Product } from '@/types';
import {
  Eye,
  Star,
  Leaf,
  TrendingUp,
  Pencil,
  SlidersHorizontal,
  Trash2,
  ExternalLink,
  Package,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductInventoryCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
  onOpenStageUpdate: (cropGrowthId: number) => void;
  isToggling?: boolean;
}

export const ProductInventoryCard: React.FC<ProductInventoryCardProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
  onOpenStageUpdate,
  isToggling = false,
}) => {
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image ?? product.images?.[0]?.image;

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  const fmtCurrency = (n: string | number) => {
    const val = typeof n === 'string' ? parseFloat(n) : n;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(isNaN(val) ? 0 : val);
  };

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex flex-col rounded-2xl bg-surface border border-border-subtle hover:border-border-strong hover:shadow-md transition-all duration-300 overflow-hidden h-full"
    >
      {/* 4:3 Image Container with Badges */}
      <div className="relative aspect-[4/3] w-full bg-surface-elevated border-b border-border-subtle overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-foreground-muted gap-2">
            <Package className="h-10 w-10 stroke-1" />
            <span className="text-xs">No media attached</span>
          </div>
        )}

        {/* Top-Left Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_organic && (
            <Badge variant="success" size="sm" className="shadow-xs backdrop-blur-md">
              Organic
            </Badge>
          )}
          {product.market_state && (
            <ProductStatusBadge product={product} size="sm" className="shadow-xs backdrop-blur-md" />
          )}
        </div>

        {/* Top-Right Stock Alert Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {isOutOfStock ? (
            <Badge variant="failed" size="sm" className="shadow-xs backdrop-blur-md">
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="pending" size="sm" className="shadow-xs backdrop-blur-md">
              Low: {product.stock_quantity} {product.unit}
            </Badge>
          ) : (
            <Badge variant="outline" size="sm" className="shadow-xs bg-surface/90 backdrop-blur-md font-mono">
              {product.stock_quantity} {product.unit} left
            </Badge>
          )}
        </div>

        {/* Pre-Booking Tag Indicator */}
        {product.is_prebookable && (
          <div className="absolute bottom-3 left-3 z-10">
            <Badge variant="submitted" size="sm" className="shadow-xs backdrop-blur-md">
              Pre-Booking Active ({product.reservation_count || 0})
            </Badge>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-1 flex-col">
        {/* Category & SKU */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-secondary truncate">
            {product.category_name || 'Produce'}
          </span>
          <span className="text-[10px] font-mono text-foreground-muted">
            #{product.slug.slice(0, 8)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-foreground mb-2 truncate leading-snug group-hover:text-brand transition-colors">
          <Link to={`/marketplace/${product.slug}`} title={product.name}>
            {product.name}
          </Link>
        </h3>

        {/* Pricing & Stock Summary */}
        <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-border-subtle">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-display font-extrabold text-foreground tracking-tight">
              {fmtCurrency(product.price)}
            </span>
            <span className="text-xs font-semibold text-foreground-secondary">
              /{product.unit}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-foreground-secondary">
              Min: <strong className="text-foreground font-semibold">{product.minimum_order} {product.unit}</strong>
            </span>
          </div>
        </div>

        {/* Engagement Stats & Crop Integration */}
        <div className="flex items-center justify-between text-xs text-foreground-secondary mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium" title="Public Views">
              <Eye className="h-3.5 w-3.5 text-foreground-muted" /> {product.views}
            </span>
            {avgRating ? (
              <span className="flex items-center gap-1 font-medium text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                {avgRating.toFixed(1)}
              </span>
            ) : (
              <span className="text-foreground-muted text-[11px]">No reviews yet</span>
            )}
          </div>

          {product.active_crop_growth_id && (
            <button
              type="button"
              onClick={() => onOpenStageUpdate(product.active_crop_growth_id!)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline focus-ring rounded"
              title="Update Crop Growth Stage"
              aria-label={`Update crop growth stage for ${product.name}`}
            >
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Stage
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
          {/* Availability Switch */}
          <div className="flex items-center gap-2">
            <Switch
              checked={product.is_available}
              onChange={() => onToggleAvailability(product)}
              disabled={isToggling}
              aria-label={`Toggle availability for ${product.name}`}
            />
            <span className="text-xs font-semibold text-foreground-secondary">
              {isToggling ? (
                <span className="animate-spin inline-block text-[10px]">↻</span>
              ) : product.is_available ? (
                <span className="text-success font-medium">Live</span>
              ) : (
                <span className="text-foreground-muted">Hidden</span>
              )}
            </span>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="p-2 rounded-lg text-foreground-secondary hover:text-brand hover:bg-brand-muted/30 border border-transparent hover:border-brand/20 transition-colors focus-ring"
              title="Quick Adjust Pricing & Stock"
              aria-label={`Quick edit ${product.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>

            <Link
              to={`/dashboard/products/${product.slug}/edit`}
              className="p-2 rounded-lg text-foreground-secondary hover:text-brand hover:bg-brand-muted/30 border border-transparent hover:border-brand/20 transition-colors focus-ring"
              title="Full Edit Listing Specifications"
              aria-label={`Full edit ${product.name}`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </Link>

            {product.active_crop_growth_id ? (
              <Link
                to="/farmer/crops"
                className="p-2 rounded-lg text-foreground-secondary hover:text-success hover:bg-success-muted/30 border border-transparent hover:border-success/20 transition-colors focus-ring"
                title="Manage Crop Lifecycle"
                aria-label={`Manage crop lifecycle for ${product.name}`}
              >
                <Leaf className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}

            <Link
              to={`/marketplace/${product.slug}`}
              className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-elevated border border-transparent hover:border-border-subtle transition-colors focus-ring"
              title="Preview on Public Marketplace"
              aria-label={`Preview ${product.name} on marketplace`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => onDelete(product)}
              className="p-2 rounded-lg text-danger hover:bg-danger-muted border border-transparent hover:border-danger/20 transition-colors focus-ring"
              title="Delete produce listing"
              aria-label={`Delete listing for ${product.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductInventoryCard;

