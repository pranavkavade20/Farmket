import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { ProductCard } from '@/features/products';
import { motion, type Variants } from 'framer-motion';
import type { Product } from '@/types';

interface ProductGridSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  badge?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const ProductGridSection = ({ title, products, onAddToCart, badge = "Trending" }: ProductGridSectionProps) => {
  return (
    <section className="relative w-full py-12 lg:py-20 border-t border-gray-100 dark:border-white/5">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-widest">{badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            {title.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>
        <Link to="/marketplace" className="group rounded-full glass border border-gray-200 dark:border-white/10 px-6 py-2.5 text-sm font-bold text-gray-900 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 self-start md:self-auto hover:shadow-md">
          Show All <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        {products.map((p) => (
          <motion.div key={p.id} variants={itemVariants} className="h-full">
            <ProductCard product={p} onAddToCart={onAddToCart} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
