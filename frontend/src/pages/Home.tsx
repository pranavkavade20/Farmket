import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services/productService';
import type { Product, Category } from '@/types';
import { useCart } from '@/store/CartContext';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowRight, Search, Leaf, ShieldCheck, TrendingUp,
  MapPin, Star, ChevronRight, Truck, CheckCircle2,
  Apple, Wheat, Tractor
} from 'lucide-react';
import hero_section from '../assets/hero.jpg';

// ── Mock Data ───────────────────────────────────────────────────────────────
const categoryStyles = [
  { icon: <Leaf className="h-6 w-6" />, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { icon: <Apple className="h-6 w-6" />, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  { icon: <Wheat className="h-6 w-6" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { icon: <ShieldCheck className="h-6 w-6" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
];

const steps = [
  { title: 'Search & Discover', desc: 'Browse thousands of fresh, locally grown products.', icon: <Search className="h-6 w-6" /> },
  { title: 'Order Directly', desc: 'Buy straight from the farmers, ensuring fair prices for everyone.', icon: <CheckCircle2 className="h-6 w-6" /> },
  { title: 'Fast Delivery', desc: 'Get farm-fresh produce delivered straight to your doorstep.', icon: <Truck className="h-6 w-6" /> },
];

const stats = [
  { value: '5,000+', label: 'Verified Farmers' },
  { value: '25k+', label: 'Happy Customers' },
  { value: '18', label: 'States Covered' },
  { value: '100%', label: 'Freshness Guarantee' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

// ── Components ──────────────────────────────────────────────────────────────
const Home = () => {
  useSEO({
    title: 'Farm to Table Marketplace',
    description: 'Farmket connects farmers directly with buyers. Fresh produce, fair prices, zero middlemen.',
  });
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col bg-[#F8FAFC] dark:bg-gray-950">
      {/* 1. Announcement Bar */}
      <div className="bg-green-600 px-4 py-2 text-center text-sm font-medium text-white sm:px-6 lg:px-8">
        🌱 Fresh spring harvest is here! Get 20% off your first order with code <span className="font-bold underline">SPRING20</span>
      </div>

      {/* 3. Hero Section & 4. Search Bar */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-green-200/40 blur-3xl dark:bg-green-900/20" />
        <div className="pointer-events-none absolute top-40 -left-40 h-[500px] w-[500px] rounded-full bg-lime-200/30 blur-3xl dark:bg-lime-900/10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/50 px-4 py-1.5 text-xs font-semibold text-green-700 backdrop-blur-sm dark:border-green-800 dark:bg-gray-900/50 dark:text-green-400 mb-6 shadow-sm">
              <Leaf className="h-3.5 w-3.5" /> India's Premium Farm-to-Table Marketplace
            </motion.div>
            
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
              Fresh from the Farm,<br />
              <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
                Delivered to You.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Skip the middlemen. Buy fresh, organic, and locally grown produce directly from verified farmers at fair prices.
            </motion.p>

            <motion.form variants={fadeUp} custom={3} onSubmit={handleSearch} className="mx-auto mt-10 max-w-xl relative flex items-center shadow-lg rounded-2xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search for fresh vegetables, fruits, grains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-32 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-lg sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-800"
              />
              <div className="absolute inset-y-1 right-1 flex items-center">
                <Button type="submit" size="lg" className="h-full rounded-xl">
                  Search
                </Button>
              </div>
            </motion.form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="mt-16 mx-auto max-w-5xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
            <img src={hero_section} alt="Lush green farmland" className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-left">
              <p className="text-white font-medium text-lg flex items-center gap-2"><MapPin className="h-5 w-5"/> Sourced from Ratnagiri Farms</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Categories */}
      <section className="py-16 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
            <Link to="/marketplace" className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-500 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categoriesList.slice(0, 4).map((c, i) => {
              const style = categoryStyles[i % categoryStyles.length];
              return (
                <Link key={c.id} to={`/marketplace?category=${c.slug}`} className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-white dark:bg-gray-900 dark:hover:bg-gray-800 transition-all shadow-sm ring-1 ring-gray-100 hover:shadow-md dark:ring-gray-800 hover:-translate-y-1">
                  <div className={`mb-4 p-4 rounded-full ${style.color} transition-transform group-hover:scale-110`}>
                    {style.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-center">{c.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Featured Products */}
      <section className="py-24 bg-[#F8FAFC] dark:bg-[#0a0f0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Fresh Arrivals</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Handpicked produce directly from the farms to you.</p>
            </div>
            <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((p, i) => (
              <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp}>
                <ProductCard product={p} onAddToCart={handleAddToCart} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. How It Works */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-16">How Farmket Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-green-100 via-green-300 to-green-100 dark:from-green-900/30 dark:via-green-600/30 dark:to-green-900/30 -z-10" />
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-green-50 dark:bg-gray-900 ring-8 ring-white dark:ring-gray-950 flex items-center justify-center text-green-600 dark:text-green-500 shadow-inner mb-6">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Statistics & Benefits */}
      <section className="py-20 bg-brand-600 dark:bg-brand-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-green-500/30">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col items-center">
                <p className="text-4xl lg:text-5xl font-extrabold text-white mb-2">{s.value}</p>
                <p className="text-sm font-medium text-green-100 uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Newsletter */}
      <section className="py-24 bg-gray-50 dark:bg-[#0c1110]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Stay Rooted With Us</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Subscribe to our newsletter for the latest seasonal produce alerts, exclusive discounts, and farming tips.
          </p>
          <form className="max-w-md mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="Enter your email address" className="flex-1" />
            <Button type="submit" size="lg">Subscribe</Button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
