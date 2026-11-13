import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { ProductCard, productService } from '@/features/products';
import {
  ProductCardSkeleton,
  Button,
  Container,
  Checkbox,
  EmptyState,
  Badge,
} from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  Clock,
  Leaf,
} from 'lucide-react';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';
import axios from 'axios';
import { cn } from '@/lib/utils/cn';

type SortOption = 'price' | '-price' | '-created_at' | '-views';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest Harvests', value: '-created_at' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Most Popular', value: '-views' },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface FilterSidebarProps {
  className?: string;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  organicOnly: boolean;
  setOrganicOnly: (val: boolean) => void;
  prebookOnly: boolean;
  setPrebookOnly: (val: boolean) => void;
  activeFilterCount: number;
  clearFilters: () => void;
}

const FilterSidebar = ({
  className,
  categories,
  selectedCategory,
  setSelectedCategory,
  organicOnly,
  setOrganicOnly,
  prebookOnly,
  setPrebookOnly,
  activeFilterCount,
  clearFilters,
}: FilterSidebarProps) => (
  <div className={cn('flex flex-col gap-6', className)}>
    {/* Categories Filter */}
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">
          Categories
        </h3>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-1 flex flex-col">
        <button
          type="button"
          onClick={() => setSelectedCategory('')}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer',
            !selectedCategory
              ? 'bg-brand text-on-brand shadow-xs'
              : 'text-foreground-secondary hover:text-foreground hover:bg-state-hover'
          )}
        >
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm transition-colors',
              !selectedCategory ? 'bg-white/20 text-white' : 'bg-surface-elevated text-brand'
            )}
          >
            <Layers className="h-4 w-4" />
          </div>
          <span className="truncate">All Categories</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer',
                isSelected
                  ? 'bg-brand text-on-brand shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-state-hover'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold transition-colors',
                  isSelected ? 'bg-white/20 text-white' : 'bg-surface-elevated text-foreground-secondary'
                )}
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{cat.name.charAt(0)}</span>
                )}
              </div>
              <span className="truncate flex-1">{cat.name}</span>
              {typeof cat.product_count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-elevated text-muted'
                  )}
                >
                  {cat.product_count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>

    {/* Quality & Certification */}
    <div className="pt-4 border-t border-border-subtle px-1 space-y-3">
      <h3 className="text-xs font-bold text-foreground-secondary mb-1 uppercase tracking-wider">
        Harvest & Standards
      </h3>
      <Checkbox
        id="prebook-filter"
        checked={prebookOnly}
        onChange={(checked) => setPrebookOnly(checked)}
        label="Pre-Bookable Harvests"
        description="Reserve growing produce before harvest"
      />
      <Checkbox
        id="organic-filter"
        checked={organicOnly}
        onChange={(checked) => setOrganicOnly(checked)}
        label="Certified Organic Only"
        description="Harvested with verified zero chemical inputs"
      />
    </div>

    {/* Clear all active filters */}
    {activeFilterCount > 0 && (
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={clearFilters}
          className="gap-2 font-bold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset All Filters ({activeFilterCount})
        </Button>
      </div>
    )}
  </div>
);

const Marketplace = () => {
  useSEO({
    title: 'Marketplace | Farmket',
    description: 'Browse fresh, organic farm produce direct from verified farmers across India.',
  });

  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search params sync
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialPrebook = searchParams.get('prebookable') === 'true';

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 400);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [prebookOnly, setPrebookOnly] = useState(initialPrebook);
  const [sortBy, setSortBy] = useState<SortOption>('-created_at');
  const [page, setPage] = useState(1);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Close sort popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  // Load Categories on mount
  useEffect(() => {
    productService
      .getCategories()
      .then(setCategories)
      .catch(() => {
        /* silent */
      });
  }, []);

  // Sync state to search params
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (debouncedSearch.trim()) nextParams.set('search', debouncedSearch.trim());
    if (selectedCategory) nextParams.set('category', selectedCategory);
    if (prebookOnly) nextParams.set('prebookable', 'true');
    setSearchParams(nextParams, { replace: true });
  }, [debouncedSearch, selectedCategory, prebookOnly, setSearchParams]);

  // Fetch Products
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setIsLoading(true);

      const params = {
        ...(selectedCategory ? { category__slug: selectedCategory } : {}),
        ...(organicOnly ? { is_organic: true } : {}),
        ...(prebookOnly ? { prebookable: true } : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        ordering: sortBy,
        page,
      };

      try {
        const res = await productService.getProducts(params);
        if (!cancelled) {
          setProducts(res.results);
          setTotal(res.count);
        }
      } catch (err) {
        if (!cancelled) {
          if (!axios.isAxiosError(err) || err.response?.status !== 401) {
            toast.error('Failed to load marketplace products');
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedCategory, organicOnly, prebookOnly, sortBy, page]);

  // Reset page when major filters change
  const handleCategoryChange = (cat: string) => {
    setPage(1);
    setSelectedCategory(cat);
  };

  const handleOrganicChange = (val: boolean) => {
    setPage(1);
    setOrganicOnly(val);
  };

  const handlePrebookChange = (val: boolean) => {
    setPage(1);
    setPrebookOnly(val);
  };

  const handleSortChange = (opt: SortOption) => {
    setPage(1);
    setSortBy(opt);
    setIsSortOpen(false);
  };

  const clearFilters = () => {
    setPage(1);
    setSearch('');
    setSelectedCategory('');
    setOrganicOnly(false);
    setPrebookOnly(false);
    setSortBy('-created_at');
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please log in to add items to your basket', { icon: '🔒' });
      return;
    }
    await addToCart(product);
  };

  const activeFilterCount =
    (organicOnly ? 1 : 0) +
    (prebookOnly ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const selectedSortLabel = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort By',
    [sortBy]
  );

  return (
    <Container className="py-6 sm:py-8 min-h-screen flex flex-col gap-6">
      {/* Discovery Hero & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border-subtle">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge
              variant="brand"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />}
            >
              Direct Farm Marketplace
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight">
            Explore Fresh Harvests
          </h1>
          <p className="text-xs sm:text-sm font-medium text-foreground-secondary">
            {isLoading
              ? 'Loading farm harvest catalog...'
              : `Discovered ${total} harvest${total !== 1 ? 's' : ''} available directly from farmers`}
          </p>
        </div>

        {/* Global Search & Action Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-72 sm:md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search produce, farmer, crop..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full h-11 rounded-xl border border-border-strong bg-surface py-2 pl-10 pr-9 text-xs sm:text-sm font-medium shadow-xs text-foreground placeholder:text-muted/70 transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative hidden sm:block" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
              className="flex items-center justify-between gap-2 h-11 min-w-[170px] rounded-xl border border-border-strong bg-surface px-3.5 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:bg-state-hover focus-ring cursor-pointer"
            >
              <span className="truncate">{selectedSortLabel}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-foreground-secondary transition-transform duration-200 shrink-0',
                  isSortOpen && 'rotate-180 text-brand'
                )}
              />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  role="listbox"
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface p-1.5 shadow-xl border border-border-strong z-50 overflow-hidden origin-top-right"
                >
                  {SORT_OPTIONS.map((option) => {
                    const isSelected = sortBy === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSortChange(option.value)}
                        className={cn(
                          'w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-brand/10 text-brand font-bold'
                            : 'text-foreground hover:bg-state-hover'
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-brand" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            type="button"
            variant="outline"
            size="md"
            className="lg:hidden h-11 px-3 gap-1.5 font-bold"
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-xs">Filters</span>
            {activeFilterCount > 0 && (
              <span className="h-4 min-w-[16px] px-1 rounded-full bg-brand text-on-brand text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Horizontal Category & Quick-Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => handleCategoryChange('')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border',
            !selectedCategory
              ? 'bg-brand text-on-brand border-brand shadow-xs font-bold'
              : 'border-border-subtle bg-surface text-foreground-secondary hover:text-foreground hover:border-border-strong'
          )}
        >
          All Produce
        </button>

        {/* Pre-bookable Quick Filter Pill */}
        <button
          type="button"
          onClick={() => handlePrebookChange(!prebookOnly)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border flex items-center gap-1.5',
            prebookOnly
              ? 'bg-brand text-on-brand border-brand shadow-xs font-bold'
              : 'border-border-subtle bg-surface text-foreground-secondary hover:text-foreground hover:border-border-strong'
          )}
        >
          <Clock className="w-3.5 h-3.5 text-warning" />
          <span>Pre-Bookable Harvests</span>
        </button>

        {/* Organic Quick Filter Pill */}
        <button
          type="button"
          onClick={() => handleOrganicChange(!organicOnly)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border flex items-center gap-1.5',
            organicOnly
              ? 'bg-brand text-on-brand border-brand shadow-xs font-bold'
              : 'border-border-subtle bg-surface text-foreground-secondary hover:text-foreground hover:border-border-strong'
          )}
        >
          <Leaf className="w-3.5 h-3.5 text-brand" />
          <span>Organic</span>
        </button>

        <div className="h-4 w-px bg-border-strong shrink-0 mx-1" />

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border flex items-center gap-1.5',
                isSelected
                  ? 'bg-brand text-on-brand border-brand shadow-xs font-bold'
                  : 'border-border-subtle bg-surface text-foreground-secondary hover:text-foreground hover:border-border-strong'
              )}
            >
              <span>{cat.name}</span>
              {typeof cat.product_count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-elevated text-muted'
                  )}
                >
                  {cat.product_count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Catalog View: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start flex-1 min-h-[500px]">
        {/* Desktop Sticky Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
          <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              organicOnly={organicOnly}
              setOrganicOnly={handleOrganicChange}
              prebookOnly={prebookOnly}
              setPrebookOnly={handlePrebookChange}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-surface shadow-2xl z-50 p-6 overflow-y-auto lg:hidden flex flex-col rounded-l-3xl border-l border-border-subtle"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-brand" />
                    <h2 className="text-base font-display font-bold text-foreground">
                      Filter Catalog
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-state-hover transition-colors focus-ring"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile Sort options inside drawer */}
                <div className="mb-6 sm:hidden">
                  <h3 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                    Sort Harvests
                  </h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSortChange(opt.value)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors',
                          sortBy === opt.value
                            ? 'bg-brand/10 text-brand font-bold'
                            : 'text-foreground hover:bg-state-hover'
                        )}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.value && <Check className="h-3.5 w-3.5 text-brand" />}
                      </button>
                    ))}
                  </div>
                </div>

                <FilterSidebar
                  className="flex-1"
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={handleCategoryChange}
                  organicOnly={organicOnly}
                  setOrganicOnly={handleOrganicChange}
                  prebookOnly={prebookOnly}
                  setPrebookOnly={handlePrebookChange}
                  activeFilterCount={activeFilterCount}
                  clearFilters={clearFilters}
                />

                <div className="mt-8 pt-4 border-t border-border-subtle">
                  <Button
                    type="button"
                    variant="brand"
                    size="lg"
                    fullWidth
                    onClick={() => setShowMobileFilters(false)}
                    className="font-bold shadow-brand/20"
                  >
                    View Harvests
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Cards Grid & Empty States */}
        <div className="flex-1 w-full flex flex-col">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex-1 w-full flex items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border-strong bg-surface/50">
              <EmptyState
                icon={<Search className="h-8 w-8 text-brand" />}
                title="No farm harvests found"
                description="We couldn't find any produce matching your current filters. Try changing your search keywords or resetting filters."
                action={{
                  label: 'Clear All Filters',
                  onClick: clearFilters,
                }}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Modernized Catalog Pagination */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs font-medium text-foreground-secondary">
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, total)} of {total} harvests
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 h-8 gap-1 font-semibold"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </Button>

                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            (p >= page - 1 && p <= page + 1)
                        )
                        .map((p, i, arr) => {
                          const prevPage = arr[i - 1];
                          const hasGap = prevPage && p - prevPage > 1;
                          return (
                            <div key={p} className="flex items-center">
                              {hasGap && (
                                <span className="px-1.5 text-xs text-muted">…</span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setPage(p);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={cn(
                                  'h-8 w-8 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                                  p === page
                                    ? 'bg-brand text-on-brand shadow-xs'
                                    : 'text-foreground-secondary hover:bg-state-hover hover:text-foreground'
                                )}
                              >
                                {p}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 h-8 gap-1 font-semibold"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Marketplace;