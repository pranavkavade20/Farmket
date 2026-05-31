import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
};

export const WeeklyBestSelling = ({ products, onAddToCart, activeTab, setActiveTab }: WeeklyBestSellingProps) => {
  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Weekly Best Selling items</h2>
        <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900 self-start md:self-auto">
          Show All <ChevronRight className="h-3 w-3" />
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4"
      >
        {TABS.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === tab 
              ? 'bg-[#168748] text-white shadow-md' 
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-sm border border-gray-200 dark:bg-[#111] dark:border-gray-800'
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
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {products.map((p) => (
            <motion.div key={p.id} variants={itemVariants}>
              <ProductCard product={p} onAddToCart={onAddToCart} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
