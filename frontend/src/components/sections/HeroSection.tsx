import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sprout,
  Store,
  Check,
  Plus,
  Minus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { useAuth } from '@/features/auth';

import farmerImg from '@/assets/images/hero/indian_farmer.png';
import buyerImg from '@/assets/images/hero/young_buyer.png';

type FlowStep = 0 | 1 | 2;

const FLOW_STEPS: Array<{
  id: FlowStep;
  shortLabel: string;
  liveCaption: string;
}> = [
  {
    id: 0,
    shortLabel: '1. Farmer Sets Price',
    liveCaption: 'Farmer lists harvest at ₹34/kg',
  },
  {
    id: 1,
    shortLabel: '2. Direct Match',
    liveCaption: 'Direct trade with 0% middlemen',
  },
  {
    id: 2,
    shortLabel: '3. Buyer Orders',
    liveCaption: 'Buyer selects quantity & orders',
  },
];

const SAMPLE_UNIT_PRICE = 34;

export const HeroSection = () => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();

  // Interactive micro-animation state (auto-cycles unless hovered/interacted)
  const [activeStep, setActiveStep] = useState<FlowStep>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [demoQty, setDemoQty] = useState<number>(25);

  useEffect(() => {
    if (shouldReduceMotion || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => ((prev + 1) % 3) as FlowStep);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion, isPaused]);

  // Subtle 3D tilt physics for the visual stage
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springConfig = { damping: 30, stiffness: 120, mass: 0.8 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(
    mouseYSpring,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [4, -4]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-4, 4]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    setIsPaused(false);
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full bg-background border-b border-border-subtle overflow-hidden pt-6 pb-14 lg:pt-12 lg:pb-20 font-sans transition-colors duration-300"
    >
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.06),transparent_55%)]"
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
          {/* Left Content Area: Minimal Text + Instant Interactive Stepper */}
          <div className="flex-1 flex flex-col items-start w-full max-w-xl">
            {/* Compact Live Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-strong text-xs font-semibold text-foreground-secondary mb-6 shadow-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              <span>Direct Farm-to-Buyer Marketplace</span>
            </motion.div>

            {/* Concise, High-Contrast Headline */}
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-[clamp(2.4rem,4.6vw,4.25rem)] font-display font-black leading-[1.06] tracking-tight mb-4 text-foreground"
            >
              Fresh harvests. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover">
                Direct from farmers.
              </span>
            </motion.h1>

            {/* Short, 1-Sentence Value Proposition */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-foreground-secondary mb-8 leading-relaxed max-w-md"
            >
              Farmers set their own unit price. Buyers order fresh produce
              directly with zero middlemen.
            </motion.p>

            {/* Primary & Secondary Action Buttons synced with Stage */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-8"
            >
              <Link
                to="/marketplace"
                onMouseEnter={() => {
                  setIsPaused(true);
                  setActiveStep(2);
                }}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => {
                  setIsPaused(true);
                  setActiveStep(2);
                }}
                onBlur={() => setIsPaused(false)}
                className="group inline-flex items-center justify-center gap-2.5 min-h-[48px] bg-foreground text-background hover:bg-foreground/90 py-3.5 px-7 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Explore Marketplace</span>
                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to={user ? '/dashboard/products/add' : '/register'}
                onMouseEnter={() => {
                  setIsPaused(true);
                  setActiveStep(0);
                }}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => {
                  setIsPaused(true);
                  setActiveStep(0);
                }}
                onBlur={() => setIsPaused(false)}
                className="group inline-flex items-center justify-center gap-2 min-h-[48px] bg-surface text-foreground border border-border-strong hover:bg-state-hover py-3.5 px-7 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Sprout
                  className="w-4 h-4 text-brand shrink-0"
                  aria-hidden="true"
                />
                <span>{user ? 'List Produce' : 'Start Selling'}</span>
              </Link>
            </motion.div>

            {/* Interactive 3-Step Micro-Guide Pills (Click or Hover to Preview Flow) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="w-full pt-6 border-t border-border-subtle"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                  How it works — tap a step to preview
                </span>
              </div>
              <div
                role="tablist"
                aria-label="Interactive product flow preview"
                className="grid grid-cols-3 gap-2"
              >
                {FLOW_STEPS.map((step) => {
                  const isCurrent = activeStep === step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      onClick={() => {
                        setActiveStep(step.id);
                        setIsPaused(true);
                      }}
                      onMouseEnter={() => {
                        setActiveStep(step.id);
                        setIsPaused(true);
                      }}
                      onMouseLeave={() => setIsPaused(false)}
                      className={`text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isCurrent
                          ? 'bg-surface border-brand text-foreground shadow-sm'
                          : 'bg-surface/40 border-border-subtle text-foreground-secondary hover:text-foreground hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="truncate">{step.shortLabel}</span>
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                            isCurrent ? 'bg-brand' : 'bg-border-strong'
                          }`}
                        />
                      </div>
                      <div className="w-full h-1 rounded-full bg-border-subtle overflow-hidden">
                        <motion.div
                          className="h-full bg-brand"
                          initial={false}
                          animate={{ width: isCurrent ? '100%' : '0%' }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Visual Area: Interactive Micro-Animation Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 w-full flex flex-col items-center justify-center"
            style={{ perspective: 1400 }}
          >
            <motion.div
              className="relative w-full max-w-[520px] h-[390px] sm:h-[440px] flex items-center justify-center select-none"
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Soft Architectural Backdrop Frame */}
              <div
                aria-hidden="true"
                className="absolute inset-2 bg-brand/[0.04] dark:bg-brand/[0.08] rounded-[32px] border border-brand/15 transition-colors"
              />

              {/* STEP 1 CARD: Farmer (Top-Left) */}
              <motion.div
                onClick={() => setActiveStep(0)}
                animate={{
                  y: activeStep === 0 ? -6 : 0,
                  scale: activeStep === 0 ? 1.03 : 0.98,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className={`group cursor-pointer absolute top-3 left-2 sm:left-4 w-[46%] h-[58%] rounded-[24px] overflow-hidden shadow-lg bg-surface border-2 transition-colors duration-300 z-20 ${
                  activeStep === 0
                    ? 'border-brand ring-4 ring-brand/15'
                    : 'border-border-subtle'
                }`}
              >
                <img
                  src={farmerImg}
                  alt="Farmer listing fresh harvest"
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                />

                {/* Top Role Tag */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-md border border-border-subtle flex items-center gap-1.5 shadow-sm">
                  <Sprout className="w-3 h-3 text-brand" aria-hidden="true" />
                  <span className="text-xs font-bold text-foreground">
                    1. Farmer Lists
                  </span>
                </div>

                {/* Live Micro-UI Overlay: Farmer Price & Stock */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl bg-background/95 backdrop-blur-md border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground truncate">
                      Red Tomatoes
                    </span>
                    <span className="font-black text-brand">
                      ₹{SAMPLE_UNIT_PRICE}/kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-foreground-secondary">
                    <span>450 kg ready</span>
                    <span className="inline-flex items-center gap-1 text-brand font-semibold">
                      <Check className="w-3 h-3" /> Live
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* TOP-RIGHT INTERACTIVE MICRO-BADGE (Highlights on Step 1) */}
              <motion.div
                animate={{
                  scale: activeStep === 0 ? 1.05 : 0.96,
                  opacity: activeStep === 0 ? 1 : 0.75,
                }}
                transition={{ duration: 0.3 }}
                className={`absolute top-6 right-2 sm:right-4 z-30 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-surface/95 backdrop-blur-md border shadow-md transition-colors ${
                  activeStep === 0
                    ? 'border-brand'
                    : 'border-border-strong'
                }`}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-brand/15 text-brand">
                  <Sparkles size={14} />
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-foreground">
                    Farmer Sets Rate
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    100% direct payout
                  </p>
                </div>
              </motion.div>

              {/* STEP 2: ANIMATED CONNECTION BRIDGE (Center Channel) */}
              <div className="absolute inset-0 pointer-events-none z-25">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 400 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="hero-flow-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                      <stop
                        offset="50%"
                        stopColor="currentColor"
                        stopOpacity="1"
                      />
                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="175"
                    cy="105"
                    r="4"
                    fill="currentColor"
                    className="text-brand"
                  />
                  <circle
                    cx="225"
                    cy="195"
                    r="4"
                    fill="currentColor"
                    className="text-brand"
                  />

                  <path
                    d="M 175 105 C 215 105, 185 195, 225 195"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-brand/30"
                    strokeDasharray="4 4"
                  />

                  {!shouldReduceMotion && (
                    <>
                      <motion.path
                        d="M 175 105 C 215 105, 185 195, 225 195"
                        stroke="url(#hero-flow-gradient)"
                        strokeWidth={activeStep === 1 ? '3.5' : '2.25'}
                        className="text-brand"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                        animate={{
                          pathLength: [0, 0.4, 0.4, 0],
                          pathOffset: [0, 0, 0.6, 1],
                          opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                          duration: activeStep === 1 ? 1.4 : 2.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />

                      <circle
                        r="4"
                        fill="currentColor"
                        className="text-brand"
                      >
                        <animateMotion
                          dur={activeStep === 1 ? '1.4s' : '2.4s'}
                          repeatCount="indefinite"
                          path="M 175 105 C 215 105, 185 195, 225 195"
                        />
                      </circle>
                    </>
                  )}
                </svg>
              </div>

              {/* BOTTOM-LEFT INTERACTIVE MICRO-BADGE (Highlights on Step 2) */}
              <motion.div
                onClick={() => setActiveStep(1)}
                animate={{
                  scale: activeStep === 1 ? 1.06 : 0.96,
                  opacity: activeStep === 1 ? 1 : 0.8,
                }}
                transition={{ duration: 0.3 }}
                className={`cursor-pointer absolute bottom-7 left-2 sm:left-4 z-30 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-surface/95 backdrop-blur-md border shadow-md transition-colors ${
                  activeStep === 1
                    ? 'border-brand ring-4 ring-brand/15'
                    : 'border-border-strong'
                }`}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-brand/15 text-brand">
                  <ShieldCheck size={15} />
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-foreground">
                    0% Middlemen
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    Direct farm-to-buyer
                  </p>
                </div>
              </motion.div>

              {/* STEP 3 CARD: Buyer with Interactive Quantity Stepper (Bottom-Right) */}
              <motion.div
                onClick={() => setActiveStep(2)}
                animate={{
                  y: activeStep === 2 ? -6 : 0,
                  scale: activeStep === 2 ? 1.03 : 0.98,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className={`group cursor-pointer absolute bottom-3 right-2 sm:right-4 w-[46%] h-[58%] rounded-[24px] overflow-hidden shadow-lg bg-surface border-2 transition-colors duration-300 z-30 ${
                  activeStep === 2
                    ? 'border-brand ring-4 ring-brand/15'
                    : 'border-border-subtle'
                }`}
              >
                <img
                  src={buyerImg}
                  alt="Buyer ordering fresh produce directly"
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                />

                {/* Top Role Tag */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-md border border-border-subtle flex items-center gap-1.5 shadow-sm">
                  <Store className="w-3 h-3 text-brand" aria-hidden="true" />
                  <span className="text-xs font-bold text-foreground">
                    3. Buyer Orders
                  </span>
                </div>

                {/* Interactive Micro-UI Overlay: Try adjusting quantity right inside the Hero */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl bg-background/95 backdrop-blur-md border border-border-subtle shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground-secondary">
                      Order Qty
                    </span>
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Decrease sample quantity"
                        onClick={() => {
                          setIsPaused(true);
                          setActiveStep(2);
                          setDemoQty((q) => Math.max(5, q - 5));
                        }}
                        className="h-5 w-5 rounded-md bg-surface border border-border-strong flex items-center justify-center text-foreground hover:border-brand"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-foreground min-w-[36px] text-center">
                        {demoQty} kg
                      </span>
                      <button
                        type="button"
                        aria-label="Increase sample quantity"
                        onClick={() => {
                          setIsPaused(true);
                          setActiveStep(2);
                          setDemoQty((q) => Math.min(200, q + 5));
                        }}
                        className="h-5 w-5 rounded-md bg-surface border border-border-strong flex items-center justify-center text-foreground hover:border-brand"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle">
                    <span className="font-black text-foreground">
                      Total: ₹{(demoQty * SAMPLE_UNIT_PRICE).toLocaleString()}
                    </span>
                    <span className="font-bold text-brand">Direct Order</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom Live Animated Caption Pill */}
            <div className="mt-3 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface border border-border-subtle shadow-sm text-xs">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeStep}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="font-semibold text-foreground"
                >
                  {FLOW_STEPS[activeStep].liveCaption}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
