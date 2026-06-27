import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { ProductCard, productService } from '@/features/products';
import { ProductCardSkeleton, Button, Input } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Leaf, Filter, ChevronDown, Check } from 'lucide-react';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { toast } from "sonner";
import axios from 'axios';
import { cn } from '@/lib/utils/cn';

type SortOption = 'price' | '-price' | '-created_at' | '-views';

const Marketplace = () => {
  useSEO({
    title: 'Marketplace',
    description: 'Browse fresh, organic farm produce from verified farmers across India.',
  });

  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('-created_at');
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [total, setTotal] = useState(0);

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Newest First', value: '-created_at' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
  ];

  useEffect(() => {
    productService.getCategories()
      .then(setCategories)
      .catch(() => { /* silent */ });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const params = {
      ...(selectedCategory ? { 'category__slug': selectedCategory } : {}),
      ...(organicOnly ? { is_organic: true } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ordering: sortBy,
    };

    productService.getProducts(params)
      .then((res) => {
        if (!cancelled) {
          setProducts(res.results);
          setTotal(res.count);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (!axios.isAxiosError(err) || err.response?.status !== 401) {
            toast.error('Failed to load products');
          }
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [search, selectedCategory, organicOnly, sortBy]);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please log in to add items to cart', { icon: '🔒' });
      return;
    }
    await addToCart(product);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setOrganicOnly(false);
  };

  const activeFilterCount = (organicOnly ? 1 : 0) + (selectedCategory ? 1 : 0) + (search ? 1 : 0);

  const FilterSidebar = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold text-foreground-secondary mb-4 uppercase tracking-widest">Categories</h3>
        <div className="space-y-1.5 flex flex-col">
          <button
            onClick={() => setSelectedCategory('')}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-semibold text-left",
              !selectedCategory ? "bg-brand text-brand-foreground shadow-sm" : "text-foreground-secondary hover:bg-state-hover"
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", !selectedCategory ? "bg-white/20" : "bg-surface-elevated")}>
              <span className="text-base">🌾</span>
            </div>
            <span>All Products</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-semibold text-left",
                selectedCategory === cat.slug ? "bg-brand text-brand-foreground shadow-sm" : "text-foreground-secondary hover:bg-state-hover"
              )}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden", selectedCategory === cat.slug ? "bg-white/20" : "bg-surface-elevated")}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className={cn("text-xs font-bold", selectedCategory === cat.slug ? "text-white" : "text-foreground-secondary")}>{cat.name.charAt(0)}</span>
                )}
              </div>
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div>
        <h3 className="text-xs font-bold text-foreground-secondary mb-4 uppercase tracking-widest">Quality</h3>
        <label className="flex items-center gap-3 cursor-pointer group px-3 py-2.5 hover:bg-state-hover rounded-xl transition-all">
          <input
            type="checkbox"
            className="hidden"
            checked={organicOnly}
            onChange={(e) => setOrganicOnly(e.target.checked)}
          />
          <div className={cn(
            "w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all",
            organicOnly ? "bg-brand border-brand text-brand-foreground" : "border-border-strong group-hover:border-brand"
          )}>
            {organicOnly && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </div>
          <span className="text-sm font-semibold text-foreground">Organic Only</span>
        </label>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <Button variant="danger" size="md" onClick={clearFilters} className="w-full gap-2 rounded-xl mt-4">
          <X className="h-4 w-4" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight mb-2">Marketplace</h1>
          <p className="text-base text-foreground-secondary">
            {isLoading ? 'Loading fresh produce...' : `Showing ${total} product${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Search produce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border-strong bg-surface py-3 pl-12 pr-6 text-sm font-medium shadow-sm transition-all focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between w-48 rounded-full border border-border-strong bg-surface px-5 py-3 text-sm font-medium shadow-sm transition-all focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand hover:bg-state-hover"
            >
              <span className="truncate">{sortOptions.find(o => o.value === sortBy)?.label}</span>
              <ChevronDown className={cn("h-4 w-4 text-foreground-secondary transition-transform duration-300", isSortOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface p-1.5 shadow-xl border border-border-subtle z-50 overflow-hidden"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          sortBy === option.value
                            ? "bg-brand-muted text-brand font-semibold"
                            : "text-foreground-secondary hover:bg-state-hover"
                        )}
                      >
                        {option.label}
                        {sortBy === option.value && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <Button variant="outline" className="lg:hidden rounded-full h-[46px] w-[46px] p-0 border-border-strong bg-surface" onClick={() => setShowMobileFilters(true)}>
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-28">
          <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden" onClick={() => setShowMobileFilters(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-sm bg-surface shadow-2xl z-50 p-6 overflow-y-auto lg:hidden flex flex-col rounded-l-3xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-display font-bold text-foreground">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="h-10 w-10 bg-surface-elevated rounded-full flex items-center justify-center hover:bg-state-hover text-foreground-secondary transition-all">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterSidebar className="flex-1" />
                <div className="mt-8 pt-6 border-t border-border-subtle">
                  <Button variant="primary" className="w-full py-3.5 rounded-xl text-sm" onClick={() => setShowMobileFilters(false)}>Show Products</Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border border-dashed border-border-strong bg-surface">
              <div className="h-20 w-20 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-foreground-secondary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">No products found</h3>
              <p className="text-sm text-foreground-secondary max-w-md mb-6">We couldn't find any products matching your current filters. Try adjusting your search criteria.</p>
              <Button onClick={clearFilters} variant="outline" className="px-6 rounded-full">Clear All Filters</Button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {products.map((product, i) => (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}>
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
