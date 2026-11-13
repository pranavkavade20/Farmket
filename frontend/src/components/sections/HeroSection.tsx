import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Heart,
  Leaf,
  Search,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';

import farmerImg from '@/assets/images/hero/indian_farmer.png';
import buyerImg from '@/assets/images/hero/young_buyer.png';

/* ───────────── Config & Constants ───────────── */

const MARKETPLACE_PATH = '/marketplace';
const SEARCH_PARAM = 'search';

export interface HeroSectionProps {
  stats?: {
    farmers?: number;
    ordersFulfilled?: number;
  };
  onTrack?: (event: string, props?: Record<string, unknown>) => void;
}

/* ───────────── Hand-Drawn Underline SVG Curve ───────────── */

const CurvedUnderline = ({ animated = true }: { animated?: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 170 14"
    fill="none"
    className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-3.5 text-brand overflow-visible pointer-events-none"
  >
    <motion.path
      d="M 3 8 C 38 2, 74 12, 118 6 C 142 2.5, 158 5, 167 8"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      initial={animated ? { pathLength: 0, opacity: 0 } : false}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
    />
  </svg>
);

/* ───────────── Search Component ───────────── */

interface HeroSearchProps {
  onTrack?: (event: string, props?: Record<string, unknown>) => void;
}

const HeroSearch = ({ onTrack }: HeroSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    onTrack?.('hero_search', { query: trimmed });
    navigate(
      trimmed
        ? `${MARKETPLACE_PATH}?${SEARCH_PARAM}=${encodeURIComponent(trimmed)}`
        : MARKETPLACE_PATH
    );
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex items-center w-full rounded-full border border-border-strong/70 dark:border-border-subtle bg-surface p-1.5 sm:p-2 shadow-md shadow-emerald-950/5 hover:shadow-lg transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
    >
      <label htmlFor="hero-farmer-search" className="sr-only">
        Search a farmer by name
      </label>

      <Search
        aria-hidden="true"
        className="ml-3 sm:ml-4 h-5 w-5 text-foreground-secondary shrink-0"
      />

      <input
        id="hero-farmer-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a farmer by name"
        autoComplete="off"
        enterKeyHint="search"
        className="w-full bg-transparent px-3 py-2 sm:py-2.5 text-sm sm:text-base text-foreground placeholder:text-foreground-secondary/70 focus:outline-none"
      />

      <button
        type="submit"
        className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-foreground dark:bg-brand px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-background dark:text-white transition-all hover:bg-foreground/90 dark:hover:bg-brand-hover active:scale-[0.97] shrink-0 shadow-sm"
      >
        <span>Search</span>
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </form>
  );
};

/* ───────────── Trust Indicators ───────────── */

const TrustIndicators = () => (
  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 pt-2">
    {/* 1. 100% Fresh Produce */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
        <Leaf className="w-5 h-5 fill-current/20" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground leading-tight">100%</p>
        <p className="text-xs font-medium text-foreground-secondary mt-0.5">Fresh Produce</p>
      </div>
    </div>

    <div className="hidden sm:block h-8 w-px bg-border-subtle" aria-hidden="true" />

    {/* 2. Fair Price Direct from Farmer */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
        <ShieldCheck className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground leading-tight">Fair Price</p>
        <p className="text-xs font-medium text-foreground-secondary mt-0.5">Direct from Farmer</p>
      </div>
    </div>

    <div className="hidden sm:block h-8 w-px bg-border-subtle" aria-hidden="true" />

    {/* 3. Local & Fast Delivery */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
        <Truck className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground leading-tight">Local &amp; Fast</p>
        <p className="text-xs font-medium text-foreground-secondary mt-0.5">Delivery</p>
      </div>
    </div>
  </div>
);

/* ───────────── Visual Storytelling & Animation Section ───────────── */

/**
 * Coordinated Transaction Animation State Machine:
 * 'ready'       - Farmer ready with fresh produce, Cart at farmer (0%)
 * 'to_platform' - Cart smoothly travels from Farmer to Platform (0% -> 50%)
 * 'processing'  - Platform pulses & validates order, "Packed" stage activates
 * 'to_buyer'    - Cart smoothly travels from Platform to Buyer (50% -> 100%)
 * 'delivered'   - Order arrives at Buyer, "Order Placed" highlights, "On the way" activates
 * 'reset'       - Seamless fade-out and silent position reset without backward snap
 */
type AnimationPhase =
  | 'ready'
  | 'to_platform'
  | 'processing'
  | 'to_buyer'
  | 'delivered'
  | 'reset';

const PHASE_DURATIONS: Record<AnimationPhase, number> = {
  ready: 1400,
  to_platform: 1800,
  processing: 1600,
  to_buyer: 1800,
  delivered: 2600,
  reset: 350,
};

const NEXT_PHASE: Record<AnimationPhase, AnimationPhase> = {
  ready: 'to_platform',
  to_platform: 'processing',
  processing: 'to_buyer',
  to_buyer: 'delivered',
  delivered: 'reset',
  reset: 'ready',
};

const FarmerBuyerStory = () => {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<AnimationPhase>('ready');
  const [isPaused, setIsPaused] = useState(false);

  // Synchronized animation loop
  useEffect(() => {
    if (reduceMotion || isPaused) return;

    const timer = window.setTimeout(() => {
      setPhase((prev) => NEXT_PHASE[prev]);
    }, PHASE_DURATIONS[phase]);

    return () => window.clearTimeout(timer);
  }, [phase, isPaused, reduceMotion]);

  // Position and opacity calculations to avoid backward snap on reset
  const cartLeft = reduceMotion
    ? '50%'
    : phase === 'ready' || phase === 'reset'
      ? '0%'
      : phase === 'to_platform' || phase === 'processing'
        ? '50%'
        : '100%';

  const cartOpacity = reduceMotion ? 1 : phase === 'reset' ? 0 : 1;

  const cartTransition = reduceMotion
    ? { duration: 0 }
    : phase === 'reset'
      ? { duration: 0.3 }
      : phase === 'to_platform' || phase === 'to_buyer'
        ? { duration: 1.6, ease: 'easeInOut' as const }
        : { duration: 0.4 };

  // Status highlights
  const isPlatformActive = phase === 'processing';
  const isBuyerDelivered = phase === 'delivered';
  const isOrderedActive = phase !== 'reset';
  const isPackedActive =
    phase === 'processing' || phase === 'to_buyer' || phase === 'delivered';
  const isOnTheWayActive = phase === 'delivered';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative w-full max-w-[620px] mx-auto flex flex-col items-center select-none"
    >
      {/* ── Main Horizontal Journey Flow: Farmer → Platform → Buyer ── */}
      <div className="relative z-10 w-full flex items-start justify-between gap-2 sm:gap-4 md:gap-5 px-1">

        {/* ───────────── 1. Farmer Column (Image Card + Info Card Placed at Bottom) ───────────── */}
        <div className="flex flex-col items-center w-[118px] xs:w-[155px] sm:w-[220px] md:w-[245px] lg:w-[260px] shrink-0">
          {/* Portrait Image Card */}
          <div className="relative w-full h-[175px] xs:h-[230px] sm:h-[310px] md:h-[345px] lg:h-[365px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F0F5F2] dark:bg-surface border border-border-subtle/90 dark:border-border-subtle shadow-md shadow-emerald-950/5 transition-transform duration-300 hover:scale-[1.01]">
            {/* Top Floating Status Pill */}
            <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-20 whitespace-nowrap px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/95 dark:bg-surface/95 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-semibold text-foreground">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
              </span>
              <span>Farmer</span>
            </div>

            {/* Farmer Photo - 100% visible, completely unobstructed */}
            <img
              src={farmerImg}
              alt="Farmer holding fresh vegetables"
              className="w-full h-full object-cover object-[center_top]"
            />
          </div>

          {/* Fresh Vegetables Info Card - Placed cleanly at the bottom of the image card */}
          <div className="w-full mt-2 sm:mt-3 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-surface/95 backdrop-blur-md border border-border-subtle/80 dark:border-border-subtle shadow-md shadow-emerald-950/5 flex items-center justify-between transition-all">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-foreground leading-tight truncate">
                  Fresh Vegetables
                </p>
                <p className="text-[9px] sm:text-xs font-semibold text-brand mt-0.5 tabular-nums truncate">
                  ₹34/kg · direct
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Add to favorites"
              className="w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-foreground-secondary/60 hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* ───────────── 2. Connection Line & Clean Platform Hub ───────────── */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-0.5 sm:px-2 min-w-[36px] xs:min-w-[65px] sm:min-w-[90px] md:min-w-[110px] self-start mt-[60px] xs:mt-[85px] sm:mt-[120px] md:mt-[135px] lg:mt-[145px]">
          {/* Horizontal Track & Traveling Cart */}
          <div className="relative w-full flex items-center justify-center">
            {/* Dotted Connection Track */}
            <div
              className="w-full h-0 border-t-2 border-dashed border-brand/40 dark:border-brand/30"
              aria-hidden="true"
            />

            {/* Directional Arrow pointing into Buyer Card */}
            <div className="absolute -right-1 text-brand pointer-events-none" aria-hidden="true">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
            </div>

            {/* Traveling Shopping Cart Indicator */}
            <motion.div
              className="absolute -top-3 sm:-top-4 z-30 pointer-events-none"
              initial={false}
              animate={{
                left: cartLeft,
                x: '-50%',
                opacity: cartOpacity,
              }}
              transition={cartTransition}
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-surface border-2 border-brand text-brand shadow-md shadow-brand/15 flex items-center justify-center">
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
              </div>
            </motion.div>
          </div>

          {/* Branded Platform Hub */}
          <motion.div
            className={`relative z-10 mt-5 xs:mt-6 sm:mt-8 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-surface/95 backdrop-blur-md border flex items-center justify-center p-1.5 sm:p-2 transition-all duration-300 overflow-hidden ${isPlatformActive
              ? 'border-brand ring-4 ring-brand/20 shadow-lg shadow-brand/20 scale-105'
              : 'border-border-subtle shadow-sm'
              }`}
            animate={
              isPlatformActive && !reduceMotion
                ? { scale: [1, 1.08, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.6, repeat: isPlatformActive ? Infinity : 0 }}
          >
            <img
              src="/logo.png"
              alt="Farmket Logo"
              className="w-full h-full object-contain select-none"
            />
          </motion.div>
          <span className="text-[8px] xs:text-[9px] sm:text-[11px] font-semibold text-foreground-secondary mt-1.5 whitespace-nowrap">
            Our Platform
          </span>
        </div>

        {/* ───────────── 3. Buyer Column (Image Card + Info Card Placed at Bottom) ───────────── */}
        <div className="flex flex-col items-center w-[118px] xs:w-[145px] sm:w-[200px] md:w-[225px] lg:w-[240px] shrink-0">
          {/* Portrait Image Card */}
          <div
            className={`relative w-full h-[175px] xs:h-[230px] sm:h-[310px] md:h-[345px] lg:h-[365px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F2F6F3] dark:bg-surface border-2 transition-all duration-500 shadow-md shadow-emerald-950/8 hover:scale-[1.01] ${isBuyerDelivered
              ? 'border-brand ring-2 ring-brand/30'
              : 'border-emerald-900/80 dark:border-brand/70'
              }`}
          >
            {/* Top Floating Buyer Pill */}
            <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-20 whitespace-nowrap px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/95 dark:bg-surface/95 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-semibold text-foreground ">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
              </span>
              <span>Buyer</span>
            </div>

            {/* Buyer Photo - 100% visible, completely unobstructed */}
            <img
              src={buyerImg}
              alt="Customer ordering produce on smartphone"
              className="w-full h-full object-cover object-[50%_top]"
            />
          </div>

          {/* Order Placed Confirmation Card - Placed cleanly at the bottom of the image card */}
          <motion.div
            initial={false}
            animate={{
              opacity: isBuyerDelivered || reduceMotion ? 1 : 0.45,
              scale: isBuyerDelivered && !reduceMotion ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.35 }}
            className={`w-full mt-2.5 sm:mt-3 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-surface/95 backdrop-blur-md border transition-all shadow-md shadow-emerald-950/5 flex items-center gap-2 ${isBuyerDelivered
              ? 'border-brand/60 shadow-brand/10'
              : 'border-border-subtle/80 dark:border-border-subtle'
              }`}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs md:text-sm font-bold text-foreground leading-tight truncate">
                Order Placed!
              </p>
              <p className="text-[10px] sm:text-xs text-foreground-secondary leading-tight mt-0.5 truncate">
                Fresh produce on the way
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ───────────── 4. Sequential Delivery Progress Bar ───────────── */}
      <div className="w-full mt-7 pt-4 border-t border-border-subtle/80 grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        {/* Step 1: Ordered */}
        <div className="flex flex-col">
          <div className="relative h-1 w-full rounded-full overflow-hidden bg-border-subtle mb-2">
            <motion.div
              className="h-full bg-brand"
              initial={false}
              animate={{ width: isOrderedActive ? '100%' : '0%' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] sm:text-xs md:text-sm font-bold transition-colors ${isOrderedActive ? 'text-foreground' : 'text-foreground-secondary/70'
                }`}
            >
              1. Ordered
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-foreground-secondary mt-0.5 hidden xs:block truncate">
            Direct from farmer
          </p>
        </div>

        {/* Step 2: Packed */}
        <div className="flex flex-col">
          <div className="relative h-1 w-full rounded-full overflow-hidden bg-border-subtle mb-2">
            <motion.div
              className="h-full bg-brand"
              initial={false}
              animate={{ width: isPackedActive ? '100%' : '0%' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] sm:text-xs md:text-sm font-bold transition-colors ${isPackedActive ? 'text-foreground' : 'text-foreground-secondary/70'
                }`}
            >
              2. Packed
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-foreground-secondary mt-0.5 hidden xs:block truncate">
            Quality confirmed
          </p>
        </div>

        {/* Step 3: On the way */}
        <div className="flex flex-col">
          <div className="relative h-1 w-full rounded-full overflow-hidden bg-border-subtle mb-2">
            <motion.div
              className="h-full bg-brand"
              initial={false}
              animate={{ width: isOnTheWayActive ? '100%' : '0%' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] sm:text-xs md:text-sm font-bold transition-colors ${isOnTheWayActive ? 'text-foreground' : 'text-foreground-secondary/70'
                }`}
            >
              3. On the way
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-foreground-secondary mt-0.5 hidden xs:block truncate">
            Straight to buyer
          </p>
        </div>
      </div>
    </div >
  );
};

/* ───────────── Main Hero Section Export ───────────── */

export const HeroSection = ({ stats, onTrack }: HeroSectionProps) => {
  const reduceMotion = useReducedMotion();

  const proof = [
    stats?.farmers
      ? `${stats.farmers.toLocaleString('en-IN')}+ farmers selling direct`
      : null,
    stats?.ordersFulfilled
      ? `${stats.ordersFulfilled.toLocaleString('en-IN')}+ orders delivered`
      : null,
  ].filter(Boolean) as string[];

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full overflow-hidden border-b border-border-subtle bg-[#F4F8F5] dark:bg-background font-sans transition-colors duration-300"
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* ───────────── Left Section: Hero Content ───────────── */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col">
            {/* Eyebrow badge with horizontal green accent line */}
            <div className="mb-4 sm:mb-5 flex items-center gap-2.5">
              <span className="w-5 sm:w-6 h-0.5 bg-brand rounded-full shrink-0" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
                Farm-to-buyer marketplace
              </p>
            </div>

            {/* Three-line main heading */}
            <h1
              id="hero-heading"
              className="font-display text-[clamp(2.4rem,4.5vw,4.1rem)] font-extrabold leading-[1.08] tracking-tight text-foreground [text-wrap:balance]"
            >
              Buy it from
              <br />
              the{' '}
              <span className="relative inline-block text-brand">
                farmer
                <CurvedUnderline animated={!reduceMotion} />
              </span>
              <br />
              who grew it.
            </h1>

            {/* Subtitle description */}
            <p className="mt-5 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-foreground-secondary">
              Farmers set their own price. You order fresh produce straight from
              the field, or reserve a crop while it&apos;s still growing.
            </p>

            {/* Search component */}
            <div className="mt-7 sm:mt-8 max-w-xl">
              <HeroSearch onTrack={onTrack} />
            </div>

            {/* 3 Compact Trust Indicators */}
            <div className="mt-8 sm:mt-10 max-w-xl">
              <TrustIndicators />
            </div>

            {/* Optional Platform Social Proof (when passed) */}
            {proof.length > 0 && (
              <p className="mt-6 text-sm text-foreground-secondary">
                {proof.join('  ·  ')}
              </p>
            )}
          </div>

          {/* ───────────── Right Section: Farmer-to-Buyer Visual Experience ───────────── */}
          <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center w-full">
            <FarmerBuyerStory />
          </div>
        </div>
      </div>
    </section>
  );
};
