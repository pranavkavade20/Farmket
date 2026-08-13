import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui';
import { Leaf, Eye, ToggleLeft, ToggleRight, Trash2, TrendingUp } from 'lucide-react';
import type { Product } from '@/types';
import { useAppDispatch } from '@/app/hooks';
import { openStageUpdateModal } from '@/features/crops/cropsSlice';

interface ProductTableProps {
  products: Product[];
  onDelete: (slug: string, name: string) => void;
  onToggleAvailability: (product: Product) => void;
  deletingId: string | null;
  togglingId: string | null;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onDelete,
  onToggleAvailability,
  deletingId,
  togglingId
}) => {
  const dispatch = useAppDispatch();

  const fmt = (n: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(n));

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle bg-surface-elevated">
            <TableHead className="font-semibold text-foreground">Product</TableHead>
            <TableHead className="font-semibold text-foreground">Price</TableHead>
            <TableHead className="font-semibold text-foreground">Stock</TableHead>
            <TableHead className="font-semibold text-foreground">Stats</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const primaryImage =
              product.images.find((img) => img.is_primary)?.image ?? product.images[0]?.image;
            const avgRating =
              product.reviews.length > 0
                ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
                : null;

            return (
              <TableRow key={product.id} className="border-border-subtle hover:bg-state-hover transition-colors group">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-background border border-border-subtle overflow-hidden flex items-center justify-center">
                      <img
                        src={primaryImage || undefined}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-2 mb-0.5">
                        {product.name}
                        {product.is_organic && (
                          <Badge variant="success" size="sm" className="px-1.5 py-0 h-4 text-[10px]">Organic</Badge>
                        )}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                        {product.category_name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-foreground">
                    {fmt(product.price)}
                  </span>
                  <span className="text-xs font-medium text-foreground-secondary"> /{product.unit}</span>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-foreground">{product.stock_quantity}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs font-medium text-foreground-secondary">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {product.views} views</span>
                    {avgRating && (
                      <span className="flex items-center gap-1 text-accent-yellow">⭐ {avgRating.toFixed(1)} ({product.reviews.length})</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.is_available ? 'success' : 'outline'}>
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link
                      to="/farmer/crops"
                      className="p-2 text-foreground-secondary hover:text-success hover:bg-success-muted rounded-lg transition-colors border border-transparent hover:border-success/20"
                      title="Manage Crop Lifecycle"
                    >
                      <Leaf className="h-4 w-4" />
                    </Link>
                    {product.active_crop_growth_id && (
                      <button
                        onClick={() => dispatch(openStageUpdateModal(product.active_crop_growth_id!))}
                        className="p-2 text-foreground-secondary hover:text-info hover:bg-info-muted rounded-lg transition-colors border border-transparent hover:border-info/20"
                        title="Update Stage"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleAvailability(product)}
                      disabled={togglingId === product.slug}
                      className="p-2 text-foreground-secondary hover:text-foreground hover:bg-state-hover rounded-lg transition-colors border border-transparent hover:border-border-subtle"
                      title={product.is_available ? 'Hide from marketplace' : 'Show on marketplace'}
                    >
                      {togglingId === product.slug ? (
                        <span className="animate-spin text-xs inline-block h-4 w-4 text-center leading-4">↻</span>
                      ) : product.is_available ? (
                        <ToggleRight className="h-4 w-4 text-success" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(product.slug, product.name)}
                      disabled={deletingId === product.slug}
                      className="p-2 text-foreground-secondary hover:text-danger hover:bg-danger-muted rounded-lg transition-colors border border-transparent hover:border-danger/20"
                      title="Delete product"
                    >
                      {deletingId === product.slug ? (
                        <span className="animate-spin text-xs inline-block h-4 w-4 text-center leading-4">↻</span>
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
  );
};
