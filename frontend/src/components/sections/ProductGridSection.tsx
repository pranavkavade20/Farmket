import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/products';
import { motion, type Variants } from 'framer-motion';
import type { Product } from '@/types';

interface ProductGridSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
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

export const ProductGridSection = ({ title, products, onAddToCart }: ProductGridSectionProps) => {
  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{title}</h2>
        <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900">
          Show All <ChevronRight className="h-3 w-3" />
        </Link>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {products.map((p) => (
          <motion.div key={p.id} variants={itemVariants}>
            <ProductCard product={p} onAddToCart={onAddToCart} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
