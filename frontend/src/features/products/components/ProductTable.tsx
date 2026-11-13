import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge, Switch } from '@/components/ui';
import { ProductStatusBadge } from './ProductStatusBadge';
import {
  Leaf,
  Eye,
  Trash2,
  TrendingUp,
  Pencil,
  SlidersHorizontal,
  ExternalLink,
  Star,
  Package,
} from 'lucide-react';
import type { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
  onOpenStageUpdate: (cropGrowthId: number) => void;
  deletingId: string | null;
  togglingId: string | null;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleAvailability,
  onOpenStageUpdate,
  deletingId,
  togglingId,
}) => {
  const fmtCurrency = (n: string | number) => {
    const val = typeof n === 'string' ? parseFloat(n) : n;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(isNaN(val) ? 0 : val);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-xs border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle bg-surface-elevated/70">
              <TableHead className="font-bold text-foreground py-3.5 pl-6">Produce Item</TableHead>
              <TableHead className="font-bold text-foreground py-3.5">Unit Price</TableHead>
              <TableHead className="font-bold text-foreground py-3.5">Inventory Stock</TableHead>
              <TableHead className="font-bold text-foreground py-3.5">Market Stage</TableHead>
              <TableHead className="font-bold text-foreground py-3.5">Performance</TableHead>
              <TableHead className="font-bold text-foreground py-3.5 text-center">Live Status</TableHead>
              <TableHead className="font-bold text-foreground py-3.5 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const primaryImage =
                product.images?.find((img) => img.is_primary)?.image ?? product.images?.[0]?.image;

              const avgRating =
                product.reviews && product.reviews.length > 0
                  ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
                  : null;

              const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
              const isOutOfStock = product.stock_quantity === 0;
              const isToggling = togglingId === product.slug;
              const isDeleting = deletingId === product.slug;

              return (
                <TableRow
                  key={product.id}
                  className="border-border-subtle hover:bg-state-hover/50 transition-colors group"
                >
                  {/* Item Details */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3.5 min-w-[240px]">
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-surface-elevated border border-border-subtle overflow-hidden flex items-center justify-center">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-foreground-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground text-sm flex items-center gap-2 mb-0.5">
                          <Link
                            to={`/marketplace/${product.slug}`}
                            className="hover:text-brand transition-colors truncate"
                            title={product.name}
                          >
                            {product.name}
                          </Link>
                          {product.is_organic && (
                            <Badge variant="success" size="sm" className="px-1.5 py-0 h-4 text-[10px]">
                              Organic
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground-secondary flex items-center gap-2">
                          <span>{product.category_name || 'Produce'}</span>
                          <span className="text-foreground-muted font-mono lowercase">#{product.slug.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Unit Price */}
                  <TableCell className="py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-sm">
                        {fmtCurrency(product.price)}
                        <span className="text-xs font-normal text-foreground-secondary">
                          /{product.unit}
                        </span>
                      </span>
                      <span className="text-[11px] text-foreground-muted">
                        Min: {product.minimum_order} {product.unit}
                      </span>
                    </div>
                  </TableCell>

                  {/* Inventory Stock */}
                  <TableCell className="py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {isOutOfStock ? (
                          <Badge variant="failed" size="sm" className="font-semibold">
                            Out of Stock
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="pending" size="sm" className="font-semibold">
                            Low ({product.stock_quantity} {product.unit})
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" className="font-semibold" icon={null}>
                            {product.stock_quantity} {product.unit}
                          </Badge>
                        )}
                      </div>
                      {product.reserved_quantity > 0 && (
                        <span className="text-[11px] text-brand font-medium">
                          Reserved: {product.reserved_quantity} {product.unit}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Market Stage */}
                  <TableCell className="py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <ProductStatusBadge product={product} size="sm" />
                      {product.crop_stage && (
                        <span className="text-[11px] font-semibold text-foreground-secondary capitalize">
                          Growth: {product.crop_stage.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Performance */}
                  <TableCell className="py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs text-foreground-secondary">
                      <span className="flex items-center gap-1 font-medium">
                        <Eye className="h-3.5 w-3.5 text-foreground-muted" /> {product.views} views
                      </span>
                      {avgRating ? (
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          {avgRating.toFixed(1)} ({product.reviews.length})
                        </span>
                      ) : (
                        <span className="text-foreground-muted text-[11px]">No reviews</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Live Status Switch */}
                  <TableCell className="py-4 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center gap-1">
                      <Switch
                        checked={product.is_available}
                        onChange={() => onToggleAvailability(product)}
                        disabled={isToggling}
                        aria-label={`Toggle availability for ${product.name}`}
                      />
                      <span className="text-[10px] font-semibold text-foreground-secondary">
                        {isToggling ? (
                          <span className="animate-spin inline-block">↻</span>
                        ) : product.is_available ? (
                          <span className="text-success">Live</span>
                        ) : (
                          <span className="text-foreground-muted">Hidden</span>
                        )}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions Bar */}
                  <TableCell className="py-4 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick Adjust Button */}
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-2 text-foreground-secondary hover:text-brand hover:bg-brand-muted/30 rounded-lg transition-colors border border-transparent hover:border-brand/20 focus-ring cursor-pointer"
                        title="Quick Adjust Price & Stock"
                        aria-label={`Quick adjust price and stock for ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Full Edit Listing */}
                      <Link
                        to={`/dashboard/products/${product.slug}/edit`}
                        className="p-2 text-foreground-secondary hover:text-brand hover:bg-brand-muted/30 rounded-lg transition-colors border border-transparent hover:border-brand/20 focus-ring"
                        title="Full Edit Listing Specifications"
                        aria-label={`Full edit listing specifications for ${product.name}`}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </Link>

                      {/* Manage Crop Lifecycle */}
                      {product.active_crop_growth_id && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenStageUpdate(product.active_crop_growth_id!)}
                            className="p-2 text-foreground-secondary hover:text-info hover:bg-info-muted/30 rounded-lg transition-colors border border-transparent hover:border-info/20 focus-ring cursor-pointer"
                            title="Update Crop Stage"
                            aria-label={`Update crop stage for ${product.name}`}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </button>
                          <Link
                            to="/farmer/crops"
                            className="p-2 text-foreground-secondary hover:text-success hover:bg-success-muted/30 rounded-lg transition-colors border border-transparent hover:border-success/20 focus-ring"
                            title="View Crop Timeline"
                            aria-label={`View crop timeline for ${product.name}`}
                          >
                            <Leaf className="h-4 w-4" />
                          </Link>
                        </>
                      )}

                      {/* Public Marketplace Link */}
                      <Link
                        to={`/marketplace/${product.slug}`}
                        className="p-2 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors border border-transparent hover:border-border-subtle focus-ring"
                        title="View Public Marketplace Listing"
                        aria-label={`View public marketplace listing for ${product.name}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        disabled={isDeleting}
                        className="p-2 text-foreground-secondary hover:text-danger hover:bg-danger-muted/30 rounded-lg transition-colors border border-transparent hover:border-danger/20 focus-ring cursor-pointer"
                        title="Delete product listing"
                        aria-label={`Delete ${product.name} listing`}
                      >
                        {isDeleting ? (
                          <span className="animate-spin inline-block h-4 w-4 text-center leading-4 text-xs" role="status" aria-label="Deleting listing">
                            ↻
                          </span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductTable;
