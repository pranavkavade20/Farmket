import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductTable } from '../components/ProductTable';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { productService } from '@/features/products';
import { Button, Input } from '@/components/ui';
import {
  PlusCircle, Package, Edit2, Trash2, Eye, Search,
  Leaf, TrendingUp, ToggleLeft, ToggleRight,
  LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types';
import { toast } from "sonner";
import { useAppDispatch } from '@/app/hooks';
import { openStageUpdateModal } from '@/features/crops/cropsSlice';
import { StageUpdateModal } from '@/features/crops/components/StageUpdateModal';
import api from '@/lib/api';

const MyProducts = () => {
  useSEO({ title: 'My Products', description: 'Manage your farm product listings.' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'table'>('table'); // Default to table as requested

  // Only farmers can access this page
  useEffect(() => {
    if (user && user.user_type !== 'farmer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    productService
      .getProducts({ ordering: '-created_at' })
      .then((res) => {
        // Show only current farmer's products
        const myProducts = res.results.filter((p) => p.farmer === user?.id);
        setProducts(myProducts);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (slug: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeletingId(slug);
    try {
      await productService.deleteProduct(slug);
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    setTogglingId(product.slug);
    try {
      const updated = await productService.updateProduct(product.slug, {
        is_available: !product.is_available,
      });
      setProducts((prev) =>
        prev.map((p) => (p.slug === product.slug ? { ...p, is_available: updated.is_available } : p))
      );
      toast.success(updated.is_available ? 'Product is now Available' : 'Product marked as Unavailable');
    } catch {
      toast.error('Failed to update product');
    } finally {
      setTogglingId(null);
    }
  };

  const fmt = (n: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(n));

  return (
    <div className="mx-auto max-w-7xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Products</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} listed
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/analytics">
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Analytics
            </Button>
          </Link>
          <Link to="/dashboard/products/new">
            <Button variant="primary" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
          <input
            type="text"
            placeholder="Search your products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border-strong rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border-subtle p-1 rounded-xl shrink-0">
          <button 
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-surface-elevated shadow-sm text-foreground' : 'text-foreground-secondary hover:text-foreground'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('table')}
            className={`p-2 rounded-lg transition-colors ${view === 'table' ? 'bg-surface-elevated shadow-sm text-foreground' : 'text-foreground-secondary hover:text-foreground'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-border-strong" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-24 text-center rounded-3xl border border-dashed border-border-strong bg-surface"
        >
          <div className="h-20 w-20 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6">
            <Package className="h-8 w-8 text-foreground-secondary" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            {search ? 'No products match your search' : 'No products yet'}
          </h2>
          <p className="text-sm text-foreground-secondary mb-6 max-w-sm">
            {search
              ? 'Try a different search term.'
              : 'Start listing your farm products to reach buyers across India.'}
          </p>
          {!search && (
            <Link to="/dashboard/products/new">
              <Button variant="primary" className="gap-2">
                <PlusCircle className="h-4 w-4" /> Add Your First Product
              </Button>
            </Link>
          )}
        </motion.div>
      ) : view === 'table' ? (
        <ProductTable 
          products={filteredProducts} 
          onDelete={handleDelete} 
          onToggleAvailability={handleToggleAvailability}
          deletingId={deletingId}
          togglingId={togglingId}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredProducts.map((product, i) => {
              const primaryImage =
                product.images.find((img) => img.is_primary)?.image ?? product.images[0]?.image;
              const avgRating =
                product.reviews.length > 0
                  ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
                  : null;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-surface-elevated overflow-hidden border-b border-border-subtle">
                    <img
                      src={primaryImage ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    {product.is_organic && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-success text-success-foreground px-2.5 py-1 text-xs font-semibold shadow">
                        <Leaf className="h-3 w-3" /> Organic
                      </span>
                    )}
                    <span className={`absolute top-3 right-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold shadow ${
                      product.is_available
                        ? 'bg-success-subtle text-success'
                        : 'bg-surface text-foreground-secondary border border-border-subtle'
                    }`}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs font-semibold text-brand uppercase tracking-wide mb-0.5">
                      {product.category_name}
                    </p>
                    <h3 className="font-bold text-foreground mb-1 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-bold text-foreground">
                        {fmt(product.price)}/{product.unit}
                      </span>
                      <span className="text-foreground-secondary text-xs font-medium">
                        Stock: {product.stock_quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground-secondary font-medium mb-4">
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {product.views}</span>
                      {avgRating && (
                        <span>⭐ {avgRating.toFixed(1)} ({product.reviews.length})</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link 
                        to="/farmer/crops"
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold bg-success-subtle text-success hover:bg-success-subtle/80 transition-colors"
                      >
                        <Leaf className="h-3.5 w-3.5" /> Manage Crop Lifecycle
                      </Link>
                      {product.active_crop_growth_id && (
                        <button
                          onClick={() => dispatch(openStageUpdateModal(product.active_crop_growth_id!))}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold bg-info-subtle text-info hover:bg-info-subtle/80 transition-colors"
                        >
                          <TrendingUp className="h-3.5 w-3.5" /> Update Stage
                        </button>
                      )}
                      <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        disabled={togglingId === product.slug}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors ${
                          product.is_available
                            ? 'bg-surface-elevated text-foreground-secondary hover:bg-state-hover border border-border-subtle'
                            : 'bg-success-subtle text-success hover:bg-success-subtle/80 border border-success/20'
                        }`}
                        title={product.is_available ? 'Hide from marketplace' : 'Show on marketplace'}
                      >
                        {togglingId === product.slug ? (
                          <span className="animate-spin">↻</span>
                        ) : product.is_available ? (
                          <><ToggleRight className="h-3.5 w-3.5" /> Available</>
                        ) : (
                          <><ToggleLeft className="h-3.5 w-3.5" /> Unavailable</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(product.slug, product.name)}
                        disabled={deletingId === product.slug}
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-danger hover:bg-danger-subtle transition-colors border border-transparent hover:border-danger/20"
                        title="Delete product"
                      >
                        {deletingId === product.slug ? (
                          <span className="animate-spin text-xs">↻</span>
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Render the modal so it opens when dispatched */}
      <StageUpdateModal />
    </div>
  );
};

export default MyProducts;
