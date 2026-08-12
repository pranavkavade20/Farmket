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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export const WeeklyBestSelling = ({ products, onAddToCart, activeTab, setActiveTab }: WeeklyBestSellingProps) => {
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
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-widest">Marketplace</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground">
            Weekly <span className="text-brand">Best Selling</span>
          </h2>
        </div>
        <Link to="/marketplace" className="group rounded-full bg-surface border border-border-strong px-5 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-state-hover flex items-center gap-2 self-start md:self-auto shadow-sm">
          View Marketplace <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar mb-8 -mx-6 px-6 sm:mx-0 sm:px-0"
      >
        {TABS.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
              activeTab === tab 
              ? 'bg-foreground text-background border-foreground shadow-md' 
              : 'bg-surface text-foreground-secondary border-border-strong hover:text-foreground hover:border-foreground/50'
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
              <ProductCard product={p} onAddToCart={onAddToCart} hideAddToCart={true} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
