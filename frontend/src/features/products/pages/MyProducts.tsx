import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductTable } from '../components/ProductTable';
import { ProductInventoryCard } from '../components/ProductInventoryCard';
import { QuickEditProductModal } from '../components/QuickEditProductModal';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { productService } from '@/features/products';
import {
  PageHeader,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
} from '@/components/ui';
import {
  PlusCircle,
  Package,
  Search,
  Leaf,
  TrendingUp,
  LayoutGrid,
  List,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Category } from '@/types';
import { toast } from 'sonner';
import { useAppDispatch } from '@/app/hooks';
import { openStageUpdateModal } from '@/features/crops/cropsSlice';
import { StageUpdateModal } from '@/features/crops/components/StageUpdateModal';

type FilterStatus = 'all' | 'active' | 'inactive' | 'low_stock' | 'out_of_stock' | 'prebookable' | 'organic';
type SortOption = '-created_at' | 'price' | '-price' | '-views';

export const MyProducts = () => {
  useSEO({ title: 'Farmer Inventory | Farmket', description: 'Manage your farm produce listings, prices, and stock.' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Primary data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter controls
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOrdering, setSortOrdering] = useState<SortOption>('-created_at');
  const [view, setView] = useState<'table' | 'grid'>('table');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Interactive Action & Modal states
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guard: Only farmers can access this management page
  useEffect(() => {
    if (user && user.user_type !== 'farmer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load category list once on mount
  useEffect(() => {
    productService
      .getCategories()
      .then((data) => setCategories(data))
      .catch(() => {
        // Non-blocking fallback
      });
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch farmer products from API
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    productService
      .getProducts({
        ordering: sortOrdering,
        farmer: user.id,
        page: currentPage,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(selectedCategory !== 'all' ? { category__slug: selectedCategory } : {}),
      })
      .then((res) => {
        if (!isMounted) return;
        setProducts(res.results);
        setTotalCount(res.count);
        setTotalPages(Math.ceil(res.count / 10) || 1);
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load produce listings');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, currentPage, debouncedSearch, selectedCategory, sortOrdering]);

  // Client-side quick filter for status tabs (active, low_stock, out_of_stock, prebookable, organic)
  const displayedProducts = useMemo(() => {
    return products.filter((product) => {
      switch (filterStatus) {
        case 'active':
          return product.is_available;
        case 'inactive':
          return !product.is_available;
        case 'low_stock':
          return product.stock_quantity > 0 && product.stock_quantity <= 10;
        case 'out_of_stock':
          return product.stock_quantity === 0;
        case 'prebookable':
          return product.is_prebookable || Boolean(product.active_crop_growth_id);
        case 'organic':
          return product.is_organic;
        case 'all':
        default:
          return true;
      }
    });
  }, [products, filterStatus]);

  // KPI calculations
  const kpiStats = useMemo(() => {
    const total = totalCount || products.length;
    const active = products.filter((p) => p.is_available).length;
    const lowStock = products.filter((p) => p.stock_quantity <= 10).length;
    const prebookable = products.filter((p) => p.is_prebookable || p.active_crop_growth_id).length;

    return { total, active, lowStock, prebookable };
  }, [totalCount, products]);

  // Toggle availability handler
  const handleToggleAvailability = async (product: Product) => {
    setTogglingId(product.slug);
    const newStatus = !product.is_available;
    try {
      const updated = await productService.updateProduct(product.slug, {
        is_available: newStatus,
      });
      setProducts((prev) =>
        prev.map((p) => (p.slug === product.slug ? { ...p, is_available: updated.is_available } : p))
      );
      toast.success(
        updated.is_available
          ? `"${product.name}" is now live in the marketplace`
          : `"${product.name}" marked as hidden from marketplace`
      );
    } catch {
      toast.error('Failed to update product availability');
    } finally {
      setTogglingId(null);
    }
  };

  // Quick edit success handler
  const handleQuickEditSuccess = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.slug === updatedProduct.slug ? { ...p, ...updatedProduct } : p))
    );
  };

  // Delete product handler via ConfirmDialog
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.slug);
      setProducts((prev) => prev.filter((p) => p.slug !== productToDelete.slug));
      setTotalCount((c) => Math.max(0, c - 1));
      toast.success(`"${productToDelete.name}" successfully deleted`);
      setProductToDelete(null);
    } catch {
      toast.error('Failed to delete produce listing');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Stage Update modal from crop slice
  const handleOpenStageUpdate = (cropGrowthId: number) => {
    dispatch(openStageUpdateModal(cropGrowthId));
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* ── 1. Standardized Header with PageHeader ── */}
      <PageHeader
        title="Produce Inventory"
        badge={<Badge variant="brand">Farmer Operations</Badge>}
        description="Monitor harvest supply, track warehouse stock levels, adjust live market prices, and link crops to forward pre-bookings."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/farmer/crops">
              <Button variant="outline" size="sm" className="gap-2">
                <Leaf className="h-4 w-4 text-brand" />
                <span className="hidden sm:inline">Crop Cycles</span>
              </Button>
            </Link>
            <Link to="/dashboard/analytics">
              <Button variant="outline" size="sm" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Sales Analytics</span>
              </Button>
            </Link>
            <Link to="/dashboard/products/new">
              <Button variant="brand" size="sm" className="gap-2 shadow-xs">
                <PlusCircle className="h-4 w-4" />
                <span>Add Produce</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── 2. Tactile KPI Inventory Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Listed Produce */}
        <div
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-surface border-brand shadow-sm ring-1 ring-brand/30'
              : 'bg-surface border-border-subtle hover:border-border-strong'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Total Produce
            </span>
            <div className="h-8 w-8 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-foreground">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-foreground">
              {kpiStats.total}
            </span>
            <span className="text-xs font-medium text-foreground-secondary">
              items cataloged
            </span>
          </div>
        </div>

        {/* KPI 2: Live on Marketplace */}
        <div
          onClick={() => setFilterStatus('active')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'active'
              ? 'bg-surface border-success shadow-sm ring-1 ring-success/30'
              : 'bg-surface border-border-subtle hover:border-border-strong'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Live in Market
            </span>
            <div className="h-8 w-8 rounded-xl bg-success-muted/50 border border-success/30 flex items-center justify-center text-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-foreground">
              {kpiStats.active}
            </span>
            <span className="text-xs font-medium text-success flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              active listings
            </span>
          </div>
        </div>

        {/* KPI 3: Low & Out of Stock */}
        <div
          onClick={() => setFilterStatus('low_stock')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'low_stock'
              ? 'bg-surface border-warning shadow-sm ring-1 ring-warning/30'
              : 'bg-surface border-border-subtle hover:border-border-strong'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Stock Warnings
            </span>
            <div className="h-8 w-8 rounded-xl bg-warning-muted/50 border border-warning/30 flex items-center justify-center text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-foreground">
              {kpiStats.lowStock}
            </span>
            <span className="text-xs font-medium text-warning">
              need replenishment
            </span>
          </div>
        </div>

        {/* KPI 4: Pre-Bookable & Growing */}
        <div
          onClick={() => setFilterStatus('prebookable')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'prebookable'
              ? 'bg-surface border-brand shadow-sm ring-1 ring-brand/30'
              : 'bg-surface border-border-subtle hover:border-border-strong'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Crop Linked
            </span>
            <div className="h-8 w-8 rounded-xl bg-brand-muted/50 border border-brand/30 flex items-center justify-center text-brand">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-foreground">
              {kpiStats.prebookable}
            </span>
            <span className="text-xs font-medium text-brand">
              pre-orders open
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Search, Filter Bar & View Switcher ── */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-xs space-y-4">
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Search produce name, slug, or variety…"
              value={search}
              onChange={(e) => {
                setLoading(true);
                setSearch(e.target.value);
              }}
              className="w-full pl-10 pr-9 py-2 bg-surface-elevated border border-border-subtle rounded-xl text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground p-0.5"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right Selectors: Category, Sort, and View Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-surface-elevated border border-border-subtle px-3 py-1.5 rounded-xl text-xs">
              <Filter className="h-3.5 w-3.5 text-foreground-secondary" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setLoading(true);
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-foreground text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-surface-elevated border border-border-subtle px-3 py-1.5 rounded-xl text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-foreground-secondary" />
              <select
                value={sortOrdering}
                onChange={(e) => {
                  setLoading(true);
                  setSortOrdering(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-foreground text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="-created_at">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-views">Most Popular</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-surface-elevated border border-border-subtle p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setView('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  view === 'table'
                    ? 'bg-surface shadow-xs text-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  view === 'grid'
                    ? 'bg-surface shadow-xs text-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-border-subtle/60 text-xs">
          <span className="text-[11px] font-semibold text-foreground-secondary shrink-0 uppercase tracking-wider mr-1">
            Status:
          </span>

          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterStatus === 'all'
                ? 'bg-brand text-on-brand shadow-xs'
                : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
            }`}
          >
            All Items
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterStatus === 'active'
                ? 'bg-brand text-on-brand shadow-xs'
                : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
            }`}
          >
            Active & Live
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('low_stock')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1 ${
              filterStatus === 'low_stock'
                ? 'bg-warning text-white shadow-xs'
                : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
            }`}
          >
            <AlertTriangle className="h-3 w-3" /> Low Stock
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('out_of_stock')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterStatus === 'out_of_stock'
                ? 'bg-danger text-white shadow-xs'
                : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
            }`}
          >
            Out of Stock
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('prebookable')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterStatus === 'prebookable'
                ? 'bg-brand text-on-brand shadow-xs'
                : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
            }`}
          >
            Pre-Booking Open
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('organic')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterStatus === 'organic'
                ? 'bg-brand text-on-brand shadow-xs'
                : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
            }`}
          >
            Certified Organic
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('inactive')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filterStatus === 'inactive'
                ? 'bg-foreground text-background shadow-xs'
                : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
            }`}
          >
            Hidden / Inactive
          </button>
        </div>
      </div>

      {/* ── 4. Main Listing Content: Loading, Empty, Table or Grid ── */}
      {loading ? (
        view === 'table' ? (
          <div className="bg-surface rounded-2xl border border-border-subtle p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-elevated" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-surface border border-border-subtle"
              />
            ))}
          </div>
        )
      ) : displayedProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8 text-foreground-secondary" />}
          title={search || filterStatus !== 'all' ? 'No produce matches criteria' : 'No produce listings yet'}
          description={
            search || filterStatus !== 'all'
              ? 'Try adjusting your search terms or clearing status filters.'
              : 'Start listing your fresh farm harvests to connect with direct buyers.'
          }
          action={
            search || filterStatus !== 'all'
              ? {
                  label: 'Clear All Filters',
                  onClick: () => {
                    setSearch('');
                    setFilterStatus('all');
                    setSelectedCategory('all');
                  },
                }
              : {
                  label: 'Add Your First Produce',
                  onClick: () => navigate('/dashboard/products/new'),
                  variant: 'brand',
                }
          }
        />
      ) : view === 'table' ? (
        <ProductTable
          products={displayedProducts}
          onEdit={(prod) => setEditingProduct(prod)}
          onDelete={(prod) => setProductToDelete(prod)}
          onToggleAvailability={handleToggleAvailability}
          onOpenStageUpdate={handleOpenStageUpdate}
          deletingId={productToDelete?.slug || null}
          togglingId={togglingId}
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence>
            {displayedProducts.map((product) => (
              <ProductInventoryCard
                key={product.id}
                product={product}
                onEdit={(prod) => setEditingProduct(prod)}
                onDelete={(prod) => setProductToDelete(prod)}
                onToggleAvailability={handleToggleAvailability}
                onOpenStageUpdate={handleOpenStageUpdate}
                isToggling={togglingId === product.slug}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── 5. Standardized Pagination Controls ── */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border-subtle pt-6">
          <p className="text-xs text-foreground-secondary">
            Showing <strong className="font-semibold text-foreground">{(currentPage - 1) * 10 + 1}</strong> to{' '}
            <strong className="font-semibold text-foreground">
              {Math.min(currentPage * 10, totalCount)}
            </strong>{' '}
            of <strong className="font-semibold text-foreground">{totalCount}</strong> produce items
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
                setLoading(true);
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
            >
              Previous
            </Button>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-foreground">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => {
                setLoading(true);
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ── 6. Modals & Overlays ── */}
      {/* Quick Adjust Pricing & Inventory Modal */}
      <QuickEditProductModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onSuccess={handleQuickEditSuccess}
      />

      {/* Delete Safeguard ConfirmDialog */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Produce Listing"
        description={`Are you sure you want to permanently delete "${productToDelete?.name}"? Any active marketplace inquiries or pre-booking reservations might be removed. This action cannot be undone.`}
        confirmLabel="Delete Produce"
        cancelLabel="Keep Listing"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Crop Lifecycle Stage Update Modal */}
      <StageUpdateModal />
    </div>
  );
};

export default MyProducts;
