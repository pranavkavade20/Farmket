import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { Button } from '@/components/ui';
import { ProductCard, productService } from '@/features/products';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import toast from 'react-hot-toast';
import {
  ArrowRight, ChevronRight, Apple, ShoppingBag
} from 'lucide-react';
import hero_section from '@/assets/images/hero.jpg';

// ── Mock Data for styling the premium category cards ───────────────
const categoryStyles = [
  { color: 'bg-[#F2FCE4] dark:bg-green-900/20' }, // Light Green
  { color: 'bg-[#EBF8FE] dark:bg-blue-900/20' },  // Light Blue
  { color: 'bg-[#FDF3E1] dark:bg-orange-900/20' }, // Light Orange
  { color: 'bg-[#FCECF3] dark:bg-pink-900/20' },   // Light Pink
  { color: 'bg-[#F0F2FD] dark:bg-indigo-900/20' }, // Light Indigo
  { color: 'bg-[#FEF5E7] dark:bg-yellow-900/20' }, // Light Yellow
];

// ── Components ──────────────────────────────────────────────────────────────
const Home = () => {
  useSEO({
    title: 'Farmket | Farm to Table Delivery',
    description: 'Shop from thousands of farm-fresh fruits, vegetables, dairy, and daily essentials at unbeatable prices.',
  });
  
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('Fresh Vegetables');

  useEffect(() => {
    productService.getFeaturedProducts()
      .then(setProducts)
      .catch(() => { /* silent */ });
      
    productService.getCategories()
      .then(setCategoriesList)
      .catch(() => { /* silent */ });
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please log in to add items to cart', { icon: '🔒' });
      return;
    }
    await addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5] dark:bg-[#0A0A0A] w-full min-h-screen">
      
      {/* 1. Main Content Wrapper */}
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-16">
        
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#168748] px-8 py-16 sm:py-24 lg:px-16 shadow-xl w-full min-h-[500px] flex items-center">
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 w-full">
            <div className="flex flex-col justify-center items-start">
              
              <h1 className="text-6xl sm:text-7xl lg:text-[7rem] font-bold tracking-tighter text-white leading-[0.9] mb-8 font-sans">
                Farm<span className="text-[#B9F046]">ket</span>
              </h1>

              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-md border border-white/20 mb-8 absolute top-0 right-0 lg:right-auto lg:left-0 lg:-top-6 hidden lg:inline-flex">
                Same-Day Delivery
              </div>

              <p className="max-w-[400px] text-[15px] text-white/90 leading-relaxed font-medium mb-10">
                Shop from thousands of farm-fresh fruits, vegetables, dairy, and daily essentials at unbeatable prices.
              </p>

              <Button size="lg" className="rounded-full bg-[#0A2617] hover:bg-black text-white px-8 py-7 text-[15px] font-bold shadow-xl border-none transition-transform hover:scale-105">
                Shop Now <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Right side floating image container */}
            <div className="relative hidden lg:flex items-end justify-center">
              <img 
                src={hero_section} 
                alt="Delivery person" 
                className="w-full max-w-[500px] object-contain drop-shadow-2xl z-20 relative h-[500px] object-right-bottom mix-blend-normal"
                style={{ maskImage: 'linear-gradient(to top, transparent 0%, black 15%)', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)' }}
              />
              {/* Floating Card */}
              <div className="absolute bottom-16 -left-8 z-30 flex items-center gap-4 rounded-[1.5rem] bg-white/95 p-4 shadow-2xl backdrop-blur-xl border border-white/40 min-w-[220px]">
                <div className="h-16 w-16 rounded-[1rem] bg-[#F2FCE4] flex items-center justify-center text-3xl shadow-sm">
                  🥬
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-sm">Fresh Vegetables</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">$18.00 <span className="line-through text-gray-400 text-xs ml-1 font-semibold">$24.00</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Popular Categories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Popular Categories</h2>
            <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900">
              Show All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesList.slice(0, 6).map((c, i) => {
              const style = categoryStyles[i % categoryStyles.length];
              return (
                <Link key={c.id} to={`/marketplace?category=${c.slug}`} className={`group flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-[0_4px_20px_rgb(0,0,0,0.02)]`}>
                  <div className={`h-[88px] w-[88px] flex items-center justify-center mb-4 rounded-3xl ${style.color} transition-transform group-hover:scale-105`}>
                    <Apple className="h-10 w-10 text-gray-700 dark:text-gray-200 opacity-60 mix-blend-multiply" />
                  </div>
                  <h3 className="font-bold text-[15px] text-gray-900 dark:text-white text-center leading-tight">{c.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-1.5 font-bold uppercase tracking-wide">{Math.floor(Math.random() * 40) + 10} Product</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. Today's Fresh Picks */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Today's Fresh Picks</h2>
            <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900">
              Show All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>

        {/* 5. Middle Section Grid (Light Blue Hero + Promo Banners) */}
        <section className="grid lg:grid-cols-[1fr_350px] gap-6 w-full">
          {/* Light Blue Banner */}
          <div className="bg-[#EBF8FE] rounded-[2.5rem] p-10 lg:p-14 text-gray-900 flex flex-col md:flex-row items-center justify-between overflow-hidden relative min-h-[300px]">
             <div className="relative z-10 md:w-3/5 text-left">
               <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-4 text-[#0A2617]">
                 Fresh Fruits & Vegetables.<br/>Delivered Daily.
               </h2>
               <p className="text-[15px] text-gray-600 font-medium mb-8 max-w-sm">
                 We deliver everything you need straight to your door.
               </p>
               <Button className="rounded-full bg-[#111] hover:bg-black text-white px-6 py-6 text-sm font-bold shadow-xl">
                  Shop Fresh Produce <ChevronRight className="ml-2 h-4 w-4" />
               </Button>
             </div>
             <div className="relative z-10 md:w-2/5 flex justify-end mt-8 md:mt-0">
                <div className="w-64 h-64 bg-white/40 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                {/* Fallback Basket Placeholder */}
                <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center">
                   <div className="absolute inset-0 bg-[#D4F1F9] rounded-full opacity-50 blur-2xl"></div>
                   <span className="text-9xl drop-shadow-2xl relative z-20">🧺</span>
                </div>
             </div>
          </div>

          {/* 3 Vertical Promo Banners */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[2rem] bg-gradient-to-br from-[#419468] to-[#168748] p-6 text-white relative overflow-hidden flex-1 shadow-lg group">
              <div className="relative z-10 max-w-[70%] h-full flex flex-col justify-between">
                <h3 className="text-[15px] font-black leading-snug uppercase tracking-wide">NEW HERE? ENJOY 10% OFF YOUR FIRST ORDER</h3>
                <div className="mt-4 flex items-end justify-between w-[140%]">
                   <p className="text-xs text-white/80 font-medium max-w-[55%]">Sign up today and get instant savings on your first grocery purchase.</p>
                   <button className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"><ChevronRight className="h-4 w-4"/></button>
                </div>
              </div>
            </div>
            
            <div className="rounded-[2rem] bg-gradient-to-br from-[#FF6B6B] to-[#F03E3E] p-6 text-white relative overflow-hidden flex-1 shadow-lg group">
              <div className="relative z-10 max-w-[70%] h-full flex flex-col justify-between">
                <h3 className="text-[15px] font-black leading-snug uppercase tracking-wide">FREE DELIVERY ON ORDERS OVER $50</h3>
                <div className="mt-4 flex items-end justify-between w-[140%]">
                   <p className="text-xs text-white/80 font-medium max-w-[55%]">Stock up on your weekly groceries and save more with zero delivery charges.</p>
                   <button className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"><ChevronRight className="h-4 w-4"/></button>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-gradient-to-br from-[#FFD43B] to-[#FCC419] p-6 text-[#111] relative overflow-hidden flex-1 shadow-lg group">
              <div className="relative z-10 max-w-[70%] h-full flex flex-col justify-between">
                <h3 className="text-[15px] font-black leading-snug uppercase tracking-wide">FRESH GROCERIES FOR YOUR FAMILY, WITHOUT HASSLE.</h3>
                <div className="mt-4 flex items-end justify-between w-[140%]">
                   <p className="text-xs text-gray-800 font-medium max-w-[55%]">We deliver everything you need straight to your door.</p>
                   <button className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"><ChevronRight className="h-4 w-4"/></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Weekly Best Selling items */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Weekly Best Selling items</h2>
            <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900 self-start md:self-auto">
              Show All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4">
            {['Fresh Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery', 'Meat & Fish', 'Beverages'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab 
                  ? 'bg-[#168748] text-white shadow-md' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-sm'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).reverse().map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>

        {/* 7. Most Selling Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Most Selling Products</h2>
            <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900">
              Show All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>

        {/* 8. Premium CTA Section */}
        <section>
          <div className="rounded-[3rem] bg-[#EBF8FE] dark:bg-blue-950/20 px-10 py-16 lg:px-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl">
            <div className="relative z-10 md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A2617] dark:text-white mb-6 leading-[1.1]">
                Ready To Fill Your Cart With Freshness?
              </h2>
              <p className="text-[15px] text-gray-600 dark:text-gray-400 mb-8 font-medium max-w-md">
                Shop farm-fresh groceries, daily essentials, and exclusive deals delivered straight to your door.
              </p>
              <div className="flex items-center gap-4">
                <button className="h-14 px-8 bg-[#111] rounded-2xl text-white flex items-center justify-center font-bold hover:bg-black transition-colors shadow-xl text-sm">App Store</button>
                <button className="h-14 px-8 bg-[#111] rounded-2xl text-white flex items-center justify-center font-bold hover:bg-black transition-colors shadow-xl text-sm">Google Play</button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative flex justify-end">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/50 dark:bg-blue-900/30 blur-3xl rounded-full" />
              {/* Fallback Basket */}
              <div className="relative z-10 h-72 w-72 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-2xl ring-[12px] ring-white/50 dark:ring-gray-900/50">
                 <span className="text-9xl drop-shadow-2xl">🛒</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;