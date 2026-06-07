import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { ProductCard } from '@/features/products';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { Product } from '@/types';

interface WeeklyBestSellingProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = ['Fresh Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery', 'Meat & Fish', 'Beverages'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const WeeklyBestSelling = ({ products, onAddToCart, activeTab, setActiveTab }: WeeklyBestSellingProps) => {
  return (
    <section className="relative w-full py-12 lg:py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800/50 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-widest">Marketplace</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Weekly <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Best Selling</span>
          </h2>
        </div>
        <Link to="/marketplace" className="group rounded-full glass border border-gray-200 dark:border-white/10 px-6 py-2.5 text-sm font-bold text-gray-900 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 self-start md:self-auto hover:shadow-md">
          Show All <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar mb-8 -mx-6 px-6 sm:mx-0 sm:px-0"
      >
        {TABS.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative ${
              activeTab === tab 
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 border border-brand-500' 
              : 'glass text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {products.map((p) => (
            <motion.div key={p.id} variants={itemVariants} className="h-full">
              <ProductCard product={p} onAddToCart={onAddToCart} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
