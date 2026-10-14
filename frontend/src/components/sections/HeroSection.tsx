import React, { useState } from "react";
import { ChevronRight, ArrowRight, Star, Check, Sparkles } from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";

import farmerImg from "@/assets/images/hero/indian_farmer.png";
import buyerImg from "@/assets/images/hero/young_buyer.png";

export const HeroSection = () => {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredSide, setHoveredSide] = useState<"farmer" | "buyer" | null>(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Ultra-smooth, low-distortion spring physics (Stripe/Linear feel)
  const springConfig = { damping: 30, stiffness: 120, mass: 0.8 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(
    mouseYSpring,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [6, -6]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-6, 6]
  );

  // Subtle counter-parallax for floating pills
  const pillX = useTransform(mouseXSpring, [0, 1], [-8, 8]);
  const pillY = useTransform(mouseYSpring, [0, 1], [-8, 8]);
  const pillReverseX = useTransform(mouseXSpring, [0, 1], [8, -8]);
  const pillReverseY = useTransform(mouseYSpring, [0, 1], [8, -8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    setHoveredSide(null);
  };

  return (
    <section className="relative w-full bg-background overflow-hidden pt-6 pb-16 lg:pt-12 lg:pb-24 font-sans transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
        
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col justify-center items-start w-full max-w-xl">
          {/* Minimalist Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface border border-border-strong text-xs font-semibold text-foreground-secondary tracking-wide uppercase mb-8 shadow-sm cursor-default"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
            </span>
            The Future of Agricultural Commerce
          </motion.div>

          {/* Clean, High-Contrast Display Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.5rem,4.8vw,4.5rem)] font-display font-black leading-[1.05] tracking-tight mb-6 text-foreground"
          >
            Fresh from farms. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover">
              Directly to you.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-foreground-secondary mb-10 leading-relaxed max-w-lg"
          >
            Skip the middlemen. Connect directly with trusted farmers for
            top-quality produce, complete transparency, and fairer prices.
          </motion.p>

          {/* Tactile Buttons synced with 3D Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto"
          >
            <motion.a
              href="/marketplace"
              onMouseEnter={() => setHoveredSide("buyer")}
              onMouseLeave={() => setHoveredSide(null)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center justify-center gap-2.5 bg-foreground text-background hover:bg-foreground/90 py-4 px-7 rounded-xl font-semibold transition-all duration-200 shadow-sm"
            >
              Explore Marketplace
              <ArrowRight
                size={17}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </motion.a>

            <motion.a
              href="/dashboard/products/add"
              onMouseEnter={() => setHoveredSide("farmer")}
              onMouseLeave={() => setHoveredSide(null)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center justify-center gap-2 bg-surface text-foreground border border-border-strong hover:bg-state-hover py-4 px-7 rounded-xl font-semibold transition-all duration-200 shadow-sm"
            >
              Start Selling
              <ChevronRight
                size={17}
                className="group-hover:translate-x-1 transition-transform duration-200 text-foreground-secondary"
              />
            </motion.a>
          </motion.div>

          {/* Minimalist Social Proof Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-4 mt-12 pt-8 border-t border-border-subtle w-full max-w-md"
          >
            <div className="flex -space-x-2.5">
              {[11, 33, 44, 55].map((img) => (
                <motion.img
                  key={img}
                  whileHover={{ y: -3, scale: 1.08, zIndex: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={`https://i.pravatar.cc/100?img=${img}`}
                  alt="User avatar"
                  className="relative w-9 h-9 rounded-full border-2 border-background cursor-pointer"
                />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-accent-yellow items-center gap-1 mb-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} fill="currentColor" stroke="currentColor" />
                ))}
                <span className="text-xs font-bold text-foreground ml-1">5.0</span>
              </div>
              <span className="text-xs font-medium text-foreground-secondary">
                Trusted by 10,000+ modern farmers & buyers
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Visual Area: Clean Architectural Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full relative flex items-center justify-center h-[360px] sm:h-[430px] lg:h-[480px]"
          style={{ perspective: 1400 }}
        >
          <motion.div
            className="relative w-full max-w-[500px] xl:max-w-[540px] aspect-[4/3] flex items-center justify-center"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Soft Architectural Frame */}
            <motion.div
              style={{ z: -20 }}
              className="absolute inset-3 bg-brand/[0.04] dark:bg-brand/[0.08] rounded-[36px] border border-brand/10 transition-colors"
            />

            {/* CARD 1: Farmer (Top-Left, non-overlapping 43% width) */}
            <motion.div
              style={{ z: 35 }}
              onMouseEnter={() => setHoveredSide("farmer")}
              onMouseLeave={() => setHoveredSide(null)}
              animate={{
                y: hoveredSide === "farmer" ? -6 : 0,
                scale: hoveredSide === "farmer" ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className={`group absolute top-0 left-0 w-[43%] h-[58%] rounded-[28px] overflow-hidden shadow-xl bg-surface border transition-colors duration-300 z-20 ${
                hoveredSide === "farmer"
                  ? "border-brand/60"
                  : "border-black/5 dark:border-white/10"
              }`}
            >
              <img
                src={farmerImg}
                alt="Farmer"
                className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
              />
              {/* Minimal Bottom Pill */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-background/85 backdrop-blur-md border border-border-subtle flex items-center justify-between shadow-sm">
                <span className="text-[11px] font-semibold text-foreground">
                  Verified Farmer
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              </div>
            </motion.div>

            {/* TOP-RIGHT FLOATING PILL (Sits cleanly in open space) */}
            <motion.div
              style={{ z: 55, x: pillX, y: pillY }}
              whileHover={{ scale: 1.04 }}
              className="absolute top-6 right-2 sm:right-4 z-30 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-surface/90 backdrop-blur-md border border-border-strong shadow-lg"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/15 text-brand">
                <Check size={13} strokeWidth={2.5} />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-foreground">0% Middlemen</p>
                <p className="text-[10px] text-foreground-secondary">100% farm payout</p>
              </div>
            </motion.div>

            {/* ANIMATED CONNECTION BRIDGE (Unobstructed Center Channel) */}
            <motion.div
              style={{ z: 45 }}
              className="absolute inset-0 pointer-events-none z-25"
            >
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                    <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Anchor Dots at Card Edges */}
                <circle cx="172" cy="95" r="3" fill="currentColor" className="text-brand/40" />
                <circle cx="228" cy="205" r="3" fill="currentColor" className="text-brand/40" />

                {/* 1. Base Static Dashed Path */}
                <path
                  d="M 172 95 C 215 95, 185 205, 228 205"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="text-brand/25"
                  strokeDasharray="4 4"
                />

                {!shouldReduceMotion && (
                  <>
                    {/* 2. Forward Flow */}
                    <motion.path
                      d="M 172 95 C 215 95, 185 205, 228 205"
                      stroke="url(#flow-gradient)"
                      strokeWidth={hoveredSide ? "3" : "2.25"}
                      className="text-brand"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                      animate={{
                        pathLength: [0, 0.35, 0.35, 0],
                        pathOffset: [0, 0, 0.65, 1],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: hoveredSide ? 1.8 : 2.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* 3. Forward Glowing Dot (Fixed currentColor fill) */}
                    <circle
                      r="3.5"
                      fill="currentColor"
                      className="text-brand"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur={hoveredSide ? "1.8s" : "2.8s"}
                        repeatCount="indefinite"
                        path="M 172 95 C 215 95, 185 205, 228 205"
                        calcMode="spline"
                        keyTimes="0;1"
                        keySplines="0.4 0 0.2 1"
                      />
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        keyTimes="0;0.15;0.85;1"
                        dur={hoveredSide ? "1.8s" : "2.8s"}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* 4. Reverse Subtle Dot */}
                    <circle
                      r="2"
                      fill="currentColor"
                      className="text-brand/60"
                    >
                      <animateMotion
                        dur="3.6s"
                        repeatCount="indefinite"
                        path="M 228 205 C 185 205, 215 95, 172 95"
                        calcMode="linear"
                      />
                      <animate
                        attributeName="opacity"
                        values="0;0.8;0.8;0"
                        keyTimes="0;0.2;0.8;1"
                        dur="3.6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}
              </svg>
            </motion.div>

            {/* BOTTOM-LEFT FLOATING PILL (Sits cleanly in open space) */}
            <motion.div
              style={{ z: 55, x: pillReverseX, y: pillReverseY }}
              whileHover={{ scale: 1.04 }}
              className="absolute bottom-6 left-2 sm:left-4 z-30 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-surface/90 backdrop-blur-md border border-border-strong shadow-lg"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/15 text-brand">
                <Sparkles size={13} />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-foreground">Farm-Fresh</p>
                <p className="text-[10px] text-foreground-secondary">Direct in &lt; 18 hrs</p>
              </div>
            </motion.div>

            {/* CARD 2: Buyer (Bottom-Right, non-overlapping 43% width) */}
            <motion.div
              style={{ z: 65 }}
              onMouseEnter={() => setHoveredSide("buyer")}
              onMouseLeave={() => setHoveredSide(null)}
              animate={{
                y: hoveredSide === "buyer" ? -6 : 0,
                scale: hoveredSide === "buyer" ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className={`group absolute bottom-0 right-0 w-[43%] h-[58%] rounded-[28px] overflow-hidden shadow-xl bg-surface border transition-colors duration-300 z-30 ${
                hoveredSide === "buyer"
                  ? "border-brand/60"
                  : "border-black/5 dark:border-white/10"
              }`}
            >
              <img
                src={buyerImg}
                alt="Buyer"
                className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
              />
              {/* Minimal Bottom Pill */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-background/85 backdrop-blur-md border border-border-subtle flex items-center justify-between shadow-sm">
                <span className="text-[11px] font-semibold text-foreground">
                  Direct Buyer
                </span>
                <span className="text-[10px] font-bold text-brand">Save 28%</span>
              </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};