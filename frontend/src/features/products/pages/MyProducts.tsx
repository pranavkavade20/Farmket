import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { productService } from '@/features/products';
import { Button, Input } from '@/components/ui';
import {
  PlusCircle, Package, Edit2, Trash2, Eye, Search,
  Leaf, TrendingUp, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search your products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Product List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-24 text-center"
        >
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {search ? 'No products match your search' : 'No products yet'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            {search
              ? 'Try a different search term.'
              : 'Start listing your farm products to reach buyers across India.'}
          </p>
          {!search && (
            <Link to="/dashboard/products/new">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" /> Add Your First Product
              </Button>
            </Link>
          )}
        </motion.div>
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
                  className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img
                      src={primaryImage ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    {product.is_organic && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
                        <Leaf className="h-3 w-3" /> Organic
                      </span>
                    )}
                    <span className={`absolute top-3 right-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold shadow ${
                      product.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs font-medium text-green-600 dark:text-green-500 uppercase tracking-wide mb-0.5">
                      {product.category_name}
                    </p>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {fmt(product.price)}/{product.unit}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Stock: {product.stock_quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {product.views}</span>
                      {avgRating && (
                        <span>⭐ {avgRating.toFixed(1)} ({product.reviews.length})</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link 
                        to="/farmer/crops"
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors"
                      >
                        <Leaf className="h-3.5 w-3.5" /> Manage Crop Lifecycle
                      </Link>
                      {product.active_crop_growth_id && (
                        <button
                          onClick={() => dispatch(openStageUpdateModal(product.active_crop_growth_id!))}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
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
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
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
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
