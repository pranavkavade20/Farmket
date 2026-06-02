import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={primaryImage ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop'}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {product.name}
                        {product.is_organic && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Leaf className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {product.category_name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {fmt(product.price)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400"> /{product.unit}</span>
                </TableCell>
                <TableCell>
                  {product.stock_quantity}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {product.views} views</span>
                    {avgRating && (
                      <span>⭐ {avgRating.toFixed(1)} ({product.reviews.length})</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    product.is_available
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      to="/farmer/crops"
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                      title="Manage Crop Lifecycle"
                    >
                      <Leaf className="h-4 w-4" />
                    </Link>
                    {product.active_crop_growth_id && (
                      <button
                        onClick={() => dispatch(openStageUpdateModal(product.active_crop_growth_id!))}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Update Stage"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleAvailability(product)}
                      disabled={togglingId === product.slug}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title={product.is_available ? 'Hide from marketplace' : 'Show on marketplace'}
                    >
                      {togglingId === product.slug ? (
                        <span className="animate-spin text-xs inline-block h-4 w-4 text-center leading-4">↻</span>
                      ) : product.is_available ? (
                        <ToggleRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(product.slug, product.name)}
                      disabled={deletingId === product.slug}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
