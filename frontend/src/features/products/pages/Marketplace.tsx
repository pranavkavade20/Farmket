import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { ProductCard, productService } from '@/features/products';
import { ProductCardSkeleton, Button, Input } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Leaf, Filter } from 'lucide-react';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import toast from 'react-hot-toast';
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
    <div className={cn("flex flex-col gap-10", className)}>
      {/* Categories */}
      <div>
        <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 mb-5 uppercase tracking-widest">Categories</h3>
        <div className="space-y-2 flex flex-col">
          <button
            onClick={() => setSelectedCategory('')}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all font-bold",
              !selectedCategory ? "bg-gray-900 text-white shadow-md dark:bg-white dark:text-gray-900" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all font-bold",
                selectedCategory === cat.slug ? "bg-gray-900 text-white shadow-md dark:bg-white dark:text-gray-900" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div>
        <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 mb-5 uppercase tracking-widest">Quality</h3>
        <label className="flex items-center gap-4 cursor-pointer group px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all">
          <div className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
            organicOnly ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900" : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
          )}>
            {organicOnly && <Leaf className="h-3.5 w-3.5" />}
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 font-bold">Organic Only</span>
        </label>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="md" onClick={clearFilters} className="w-full gap-2 text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 rounded-full font-bold">
          <X className="h-4 w-4" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Marketplace</h1>
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
            {isLoading ? 'Loading fresh produce...' : `Showing ${total} product${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search produce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-transparent bg-white py-4 pl-14 pr-6 text-sm font-bold shadow-sm transition-all focus:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:ring-gray-800"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="hidden sm:block rounded-full border border-transparent bg-white px-6 py-4 text-sm font-bold shadow-sm focus:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:ring-gray-800"
          >
            <option value="-created_at">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
          <Button variant="outline" className="lg:hidden rounded-full h-[52px] w-[52px] p-0" onClick={() => setShowMobileFilters(true)}>
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-32">
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setShowMobileFilters(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-[#111] shadow-2xl z-50 p-8 overflow-y-auto lg:hidden flex flex-col rounded-l-[2.5rem]">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 transition-all">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterSidebar className="flex-1" />
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <Button className="w-full py-4 text-base" onClick={() => setShowMobileFilters(false)}>Show Products</Button>
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
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
              <div className="h-24 w-24 rounded-[2rem] bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6 shadow-inner">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">No products found</h3>
              <p className="text-base font-medium text-gray-500 max-w-md mb-8">We couldn't find any products matching your current filters. Try adjusting your search criteria.</p>
              <Button onClick={clearFilters} variant="outline" className="px-8 py-4 rounded-full">Clear All Filters</Button>
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
