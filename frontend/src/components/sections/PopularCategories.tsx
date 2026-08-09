import { Link } from 'react-router-dom';
import { ChevronRight, Leaf } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { Category } from '@/types';

interface PopularCategoriesProps {
  categories: Category[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export const PopularCategories = ({ categories }: PopularCategoriesProps) => {
  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-foreground">Explore Categories</h2>
        <Link to="/marketplace" className="group rounded-full bg-surface border border-border-strong text-foreground px-4 py-2 text-sm font-bold transition-all hover:bg-state-hover hover:border-border-strong flex items-center gap-2 shadow-sm">
          View All <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6"
      >
        {categories.slice(0, 6).map((c) => (
          <motion.div key={c.id} variants={itemVariants} className="h-full">
            <Link to={`/marketplace?category=${c.slug}`} className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-surface border border-border-subtle transition-all duration-200 hover:shadow-sm hover:border-border-strong h-full">
              <div className="h-20 w-20 overflow-hidden flex items-center justify-center mb-4 rounded-2xl bg-background border border-border-subtle transition-transform duration-300 group-hover:scale-105 group-hover:shadow-sm">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <Leaf className="h-8 w-8 text-foreground-secondary opacity-50" />
                )}
              </div>
              <h3 className="font-bold text-sm lg:text-base text-foreground text-center leading-tight mb-1">{c.name}</h3>
              <p className="text-[10px] lg:text-xs text-foreground-secondary font-semibold uppercase tracking-wider">
                {c.product_count !== undefined ? c.product_count : 0} Items
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
