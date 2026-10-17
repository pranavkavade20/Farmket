import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sprout, PackageOpen, RotateCcw } from 'lucide-react';
import { ProductCard } from '@/features/products';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, Skeleton } from '@/components/ui';
import type { Product, Category } from '@/types';

interface WeeklyBestSellingProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  categories?: Category[];
  isLoading?: boolean;
}

const ALL_PRODUCE_TAB = 'All Produce';
const FALLBACK_TABS = [
  ALL_PRODUCE_TAB,
  'Fresh Vegetables',
  'Fruits',
  'Grains & Pulses',
  'Spices & Herbs',
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export const WeeklyBestSelling = ({
  products,
  onAddToCart,
  activeTab,
  setActiveTab,
  categories = [],
  isLoading = false,
}: WeeklyBestSellingProps) => {
  const shouldReduceMotion = useReducedMotion();

  // Build category tabs dynamically from actual available categories or products
  const tabOptions = useMemo(() => {
    if (categories.length > 0) {
      const names = categories
        .map((c) => c.name)
        .filter((name): name is string => Boolean(name && name.trim()));
      return [ALL_PRODUCE_TAB, ...Array.from(new Set(names)).slice(0, 6)];
    }

    const productCategories = products
      .map((p) => {
        const record = p as unknown as Record<string, unknown>;
        const cat = record.category;
        if (typeof cat === 'string') return cat;
        if (
          cat &&
          typeof cat === 'object' &&
          'name' in cat &&
          typeof (cat as { name?: unknown }).name === 'string'
        ) {
          return (cat as { name: string }).name;
        }
        if (typeof record.category_name === 'string') {
          return record.category_name;
        }
        return '';
      })
      .filter(Boolean);

    if (productCategories.length > 0) {
      return [ALL_PRODUCE_TAB, ...Array.from(new Set(productCategories)).slice(0, 6)];
    }

    return FALLBACK_TABS;
  }, [categories, products]);

  // Ensure activeTab always matches a valid tab option
  const currentTab = tabOptions.includes(activeTab)
    ? activeTab
    : ALL_PRODUCE_TAB;

  return (
    <section aria-labelledby="featured-produce-heading" className="relative w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border-subtle mb-3">
            <Sprout className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Direct Farm Listings
            </span>
          </div>
          <h2
            id="featured-produce-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-foreground"
          >
            Featured <span className="text-brand">Agricultural Produce</span>
          </h2>
          <p className="text-sm text-foreground-secondary mt-1 max-w-xl">
            Compare available harvests, unit pricing, and farmer listings ready for
            direct purchase.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="group inline-flex items-center gap-2 self-start md:self-auto min-h-[42px] rounded-xl bg-surface border border-border-strong px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 shadow-sm"
        >
          <span>View Full Marketplace</span>
          <ChevronRight
            className="h-4 w-4 text-foreground-secondary group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Category Filter Tabs */}
      <div className="mb-8">
        <Tabs
          value={currentTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList
            aria-label="Filter featured produce by category"
            className="bg-transparent justify-start overflow-x-auto custom-scrollbar flex flex-nowrap p-0.5 mb-2 h-auto gap-2"
          >
            {tabOptions.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="whitespace-nowrap min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-surface data-[state=inactive]:text-foreground-secondary data-[state=inactive]:border-border-subtle hover:data-[state=inactive]:text-foreground hover:data-[state=inactive]:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Product Grid / Loading Skeletons / Empty State */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          aria-busy="true"
          aria-label="Loading featured agricultural products"
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-surface border border-border-subtle p-4 flex flex-col gap-3"
            >
              <Skeleton className="w-full aspect-[4/3] rounded-xl" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <div className="flex items-center justify-between pt-2 mt-auto">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            variants={shouldReduceMotion ? undefined : containerVariants}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : 'visible'}
            exit={
              shouldReduceMotion
                ? undefined
                : { opacity: 0, transition: { duration: 0.15 } }
            }
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.slice(0, 8).map((p) => (
              <motion.div
                key={p.id}
                variants={shouldReduceMotion ? undefined : itemVariants}
                className="h-full"
              >
                <ProductCard
                  product={p}
                  onAddToCart={onAddToCart}
                  hideAddToCart={false}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="rounded-2xl bg-surface border border-border-subtle p-8 sm:p-10 text-center max-w-2xl mx-auto my-4">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-background border border-border-subtle flex items-center justify-center text-foreground-secondary">
            <PackageOpen className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">
            {currentTab !== ALL_PRODUCE_TAB
              ? `No featured listings in "${currentTab}" right now`
              : 'No featured produce listings available yet'}
          </h3>
          <p className="text-xs sm:text-sm text-foreground-secondary max-w-md mx-auto mb-6 leading-relaxed">
            {currentTab !== ALL_PRODUCE_TAB
              ? 'Switch back to all produce categories or browse the full marketplace catalog to discover more listings.'
              : 'Farmers can list fresh harvest lots directly from their seller dashboard, or you can browse the marketplace catalog.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {currentTab !== ALL_PRODUCE_TAB && (
              <button
                type="button"
                onClick={() => setActiveTab(ALL_PRODUCE_TAB)}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-foreground text-background text-xs sm:text-sm font-semibold hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Show All Produce</span>
              </button>
            )}
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-background border border-border-strong text-foreground text-xs sm:text-sm font-semibold hover:bg-state-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span>Browse Marketplace</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};
