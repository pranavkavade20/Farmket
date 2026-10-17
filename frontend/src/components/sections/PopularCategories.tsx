import { Link } from 'react-router-dom';
import { ChevronRight, Leaf, ArrowUpRight, Layers } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Skeleton } from '@/components/ui';
import type { Category } from '@/types';

interface PopularCategoriesProps {
  categories: Category[];
  isLoading?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export const PopularCategories = ({
  categories,
  isLoading = false,
}: PopularCategoriesProps) => {
  const shouldReduceMotion = useReducedMotion();
  const visibleCategories = categories.slice(0, 6);

  return (
    <section aria-labelledby="categories-heading" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border-subtle mb-3">
            <Layers className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Browse by Category
            </span>
          </div>
          <h2
            id="categories-heading"
            className="text-2xl sm:text-3xl font-display font-black tracking-tight text-foreground"
          >
            Explore Agricultural Categories
          </h2>
          <p className="text-sm text-foreground-secondary mt-1 max-w-xl">
            Filter marketplace listings by crop type and product category to find
            what you need faster.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="group inline-flex items-center gap-2 self-start sm:self-auto min-h-[42px] rounded-xl bg-surface border border-border-strong text-foreground px-4 py-2 text-sm font-semibold transition-all hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 shadow-sm"
        >
          <span>All Categories</span>
          <ChevronRight
            className="h-4 w-4 text-foreground-secondary group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          aria-busy="true"
          aria-label="Loading product categories"
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-surface border border-border-subtle"
            >
              <Skeleton className="h-16 w-16 rounded-2xl mb-4" />
              <Skeleton className="h-4 w-24 rounded-md mb-2" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          ))}
        </div>
      ) : visibleCategories.length > 0 ? (
        <motion.div
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? undefined : 'hidden'}
          whileInView={shouldReduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {visibleCategories.map((c) => {
            const hasCount =
              typeof c.product_count === 'number' && c.product_count > 0;
            const countLabel = hasCount
              ? `${c.product_count} ${c.product_count === 1 ? 'listing' : 'listings'}`
              : 'Explore listings';

            return (
              <motion.div
                key={c.id}
                variants={shouldReduceMotion ? undefined : itemVariants}
                className="h-full"
              >
                <Link
                  to={`/marketplace?category=${encodeURIComponent(c.slug)}`}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl bg-surface border border-border-subtle transition-all duration-200 hover:border-border-strong hover:bg-state-hover/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 h-full"
                >
                  <div className="h-16 w-16 overflow-hidden flex items-center justify-center mb-3.5 rounded-2xl bg-background border border-border-subtle transition-transform duration-200 group-hover:scale-105">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="h-11 w-11 object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <Leaf
                        className="h-7 w-7 text-brand"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug mb-1 group-hover:text-brand transition-colors">
                    {c.name}
                  </h3>

                  <span className="inline-flex items-center gap-1 text-xs text-foreground-secondary font-medium mt-auto pt-1">
                    <span>{countLabel}</span>
                    <ArrowUpRight
                      className="w-3 h-3 opacity-0 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Empty State when categories are not yet populated */
        <div className="rounded-2xl bg-surface border border-border-subtle p-8 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="h-11 w-11 rounded-xl bg-background border border-border-subtle flex items-center justify-center text-brand shrink-0">
              <Leaf className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Browse the full Farmket catalog
              </h3>
              <p className="text-xs text-foreground-secondary mt-0.5">
                Explore all available agricultural produce directly in the marketplace.
              </p>
            </div>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors shrink-0"
          >
            <span>Go to Marketplace</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
};
