import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Leaf, Filter } from 'lucide-react';
import type { Product, Category } from '@/types';
import { productService } from '@/services/productService';
import { useCart } from '@/store/CartContext';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { cn } from '@/utils/cn';

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
  const [total, setTotal] = useState(0);

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
    toast.success(`${product.name} added to cart`);
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Categories</h3>
        <div className="space-y-2 flex flex-col">
          <button
            onClick={() => setSelectedCategory('')}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
              !selectedCategory ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                selectedCategory === cat.slug ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Quality</h3>
        <label className="flex items-center gap-3 cursor-pointer group px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className={cn(
            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
            organicOnly ? "bg-green-600 border-green-600 text-white" : "border-gray-300 dark:border-gray-600 group-hover:border-green-500"
          )}>
            {organicOnly && <Leaf className="h-3 w-3" />}
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Organic Only</span>
        </label>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20">
          <X className="h-4 w-4" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? 'Loading fresh produce...' : `Showing ${total} product${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search produce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-[#0c1110] dark:text-white dark:focus:border-green-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="hidden sm:block rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-[#0c1110] dark:text-white"
          >
            <option value="-created_at">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowMobileFilters(true)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#0c1110]">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Drawer (simulated with absolute positioning or fixed modal in real app, here we use simple conditional for brevity, but let's make it fixed) */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/60 z-50 lg:hidden backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-950 shadow-2xl z-50 p-6 overflow-y-auto lg:hidden flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterSidebar className="flex-1" />
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <Button className="w-full" onClick={() => setShowMobileFilters(false)}>Show Products</Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">We couldn't find any products matching your current filters. Try adjusting your search criteria.</p>
              <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {products.map((product, i) => (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
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
