import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductTable } from '../components/ProductTable';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { productService } from '@/features/products';
import { Badge, Button, Container } from '@/components/ui';
import {
  PlusCircle, Package, Trash2, Eye, Search,
  Leaf, TrendingUp, ToggleLeft, ToggleRight,
  LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types';
import { toast } from "sonner";
import { useAppDispatch } from '@/app/hooks';
import { openStageUpdateModal } from '@/features/crops/cropsSlice';
import { StageUpdateModal } from '@/features/crops/components/StageUpdateModal';

const MyProducts = () => {
  useSEO({ title: 'My Products', description: 'Manage your farm product listings.' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!user?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    productService
      .getProducts({ 
        ordering: '-created_at', 
        farmer: user.id,
        page: currentPage,
        ...(debouncedSearch ? { search: debouncedSearch } : {})
      })
      .then((res) => {
        setProducts(res.results);
        setTotalCount(res.count);
        setTotalPages(Math.ceil(res.count / 10) || 1);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [user, currentPage, debouncedSearch]);

  const filteredProducts = products;

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
    <Container>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Products</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            {totalCount} product{totalCount !== 1 ? 's' : ''} listed
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
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  className="group flex flex-col rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-sm hover:shadow-md hover:border-border-strong transition-all h-full"
                >
                  {/* Image Container with standard 4:3 aspect ratio */}
                  <div className="relative aspect-[4/3] w-full bg-surface-elevated border-b border-border-subtle overflow-hidden">
                    <img
                      src={primaryImage || undefined}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {product.is_organic && (
                        <Badge variant="success" size="sm" className="shadow-sm shadow-black/5">Organic</Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge variant={product.is_available ? 'success' : 'outline'} size="sm" className="shadow-sm shadow-black/5 bg-surface/90 backdrop-blur-sm">
                        {product.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-1 flex-col">
                    <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-1">
                      {product.category_name}
                    </p>
                    <h3 className="text-lg font-bold text-foreground mb-1 truncate leading-tight group-hover:text-brand transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mt-2 mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-foreground">
                          {fmt(product.price)}
                        </span>
                        <span className="text-xs font-bold text-foreground-secondary">
                          /{product.unit}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-foreground-secondary bg-background px-2 py-1 rounded-md border border-border-subtle">
                        Stock: {product.stock_quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-foreground-secondary mb-4">
                      <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-foreground" /> {product.views} Views</span>
                      {avgRating && (
                        <span className="flex items-center gap-1 text-accent-yellow">⭐ {avgRating.toFixed(1)} ({product.reviews.length})</span>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-auto pt-4 border-t border-border-subtle grid grid-cols-4 gap-2">
                      <Link
                        to="/farmer/crops"
                        className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[11px] sm:text-xs font-bold bg-success-muted text-success hover:bg-success hover:text-white transition-colors border border-success/20"
                        title="Manage Crop Lifecycle"
                      >
                        <Leaf className="h-3.5 w-3.5 shrink-0" /> Manage Crop
                      </Link>

                      <div className="col-span-2 flex justify-end gap-2">
                        {product.active_crop_growth_id && (
                          <button
                            onClick={() => dispatch(openStageUpdateModal(product.active_crop_growth_id!))}
                            className="flex-1 flex items-center justify-center rounded-xl bg-info-muted text-info hover:bg-info hover:text-white transition-colors border border-info/20"
                            title="Update Stage"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleAvailability(product)}
                          disabled={togglingId === product.slug}
                          className={`flex-1 flex items-center justify-center rounded-xl transition-colors border ${product.is_available
                            ? 'bg-surface hover:bg-state-hover border-border-strong text-foreground-secondary'
                            : 'bg-success-muted text-success hover:bg-success hover:text-white border-success/20'
                            }`}
                          title={product.is_available ? 'Hide from marketplace' : 'Show on marketplace'}
                        >
                          {togglingId === product.slug ? (
                            <span className="animate-spin text-xs">↻</span>
                          ) : product.is_available ? (
                            <ToggleRight className="h-4 w-4 text-success" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product.slug, product.name)}
                          disabled={deletingId === product.slug}
                          className="flex-1 flex items-center justify-center rounded-xl text-danger hover:bg-danger hover:text-white transition-colors border border-danger/20 bg-danger-muted"
                          title="Delete product"
                        >
                          {deletingId === product.slug ? (
                            <span className="animate-spin text-xs">↻</span>
                          ) : (
                            <Trash2 className="h-4 w-4 shrink-0" />
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

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-6">
          <p className="text-sm text-foreground-secondary">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min(currentPage * 10, totalCount)}</span> of{' '}
            <span className="font-medium text-foreground">{totalCount}</span> results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Render the modal so it opens when dispatched */}
      <StageUpdateModal />
    </Container>
  );
};

export default MyProducts;
