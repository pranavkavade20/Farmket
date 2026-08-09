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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export const ProductGridSection = ({ title, products, onAddToCart, badge = "Trending" }: ProductGridSectionProps) => {
  return (
    <section className="relative w-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-strong mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
            <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-widest">{badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">
            {title.split(' ')[0]} <span className="text-accent-orange">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>
        <Link to="/marketplace" className="group rounded-full bg-surface border border-border-strong px-5 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-state-hover flex items-center gap-2 self-start md:self-auto shadow-sm">
          View All <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
