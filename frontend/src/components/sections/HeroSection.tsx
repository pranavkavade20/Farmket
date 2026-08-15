import React from "react";
import { ChevronRight, ArrowRight, Star } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";

import farmerImg from "@/assets/images/hero/indian_farmer.png";
import buyerImg from "@/assets/images/hero/young_buyer.png";

export const HeroSection = () => {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [0, 1], [15, -15]);
  const rotateY = useTransform(mouseXSpring, [0, 1], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <section className="relative w-full bg-background overflow-hidden pt-4 pb-16 lg:pt-8 lg:pb-24 font-sans transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">

        {/* Left Content Area */}
        <div className="flex-1 flex flex-col justify-center items-start w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-strong text-xs font-semibold text-foreground-secondary tracking-wide uppercase mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            The Future of Agricultural Commerce
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.5rem,5vw,4.5rem)] font-display font-black leading-[1.05] tracking-tight mb-8 text-foreground"
          >
            Fresh from farms. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover">
              Directly to you.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-foreground-secondary mb-10 leading-relaxed max-w-xl"
          >
            Skip the middlemen. Connect directly with trusted farmers for top-quality produce, complete transparency, and fairer prices.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <a
              href="/marketplace"
              className="group flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 py-4 px-8 rounded-xl font-semibold transition-all duration-200"
            >
              Explore Marketplace
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/dashboard/products/add"
              className="group flex items-center justify-center gap-2 bg-surface text-foreground border border-border-strong hover:bg-state-hover py-4 px-8 rounded-xl font-semibold transition-all duration-200 shadow-sm"
            >
              Start Selling
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-foreground-secondary" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-4 mt-12 pt-8 border-t border-border-subtle w-full max-w-md"
          >
            <div className="flex -space-x-3">
              {[11, 33, 44, 55].map((img) => (
                <img
                  key={img}
                  src={`https://i.pravatar.cc/100?img=${img}`}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full border-2 border-background"
                />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-accent-yellow items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="currentColor" stroke="currentColor" />
                ))}
                <span className="text-sm font-bold text-foreground ml-1">5.0</span>
              </div>
              <span className="text-xs font-medium text-foreground-secondary">
                Trusted by 10,000+ modern farmers & buyers
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Visual Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full relative flex items-center justify-center mt-12 lg:mt-0 h-[320px] sm:h-[400px] lg:h-[420px] xl:h-[520px]"
          style={{ perspective: 1200 }}
        >
          {/* Main Visual Composition */}
          <motion.div
            className="relative w-full max-w-[480px] xl:max-w-[550px] aspect-[4/3] flex items-center justify-center"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >

            {/* Elegant Background Element */}
            <motion.div
              style={{ z: -20, rotate: -3, scale: 1.05 }}
              className="absolute inset-0 bg-brand/5 dark:bg-brand/10 rounded-[40px] border border-brand/10 transition-colors"
            ></motion.div>

            {/* Image 1: Farmer */}
            <motion.div
              style={{ z: 40 }}
              className="absolute top-0 left-0 w-[45%] h-[62%] rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 z-20"
            >
              <div className="absolute inset-0 bg-black/10 z-10 transition-opacity hover:opacity-0"></div>
              <img
                src={farmerImg}
                alt="Farmer"
                className="w-full h-full object-cover pointer-events-none"
              />
            </motion.div>

            {/* Animated Connection Path */}
            <motion.div style={{ z: 60 }} className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                    <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>

                  {/* Subtle glow filter */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. Base Static Path (Always visible) */}
                <path
                  d="M 175 100 C 225 100, 175 200, 225 200"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-brand/20"
                  strokeDasharray="4 4"
                />

                {!shouldReduceMotion && (
                  <>
                    {/* 2. Forward Flow (Thick, gradient) */}
                    <motion.path
                      d="M 175 100 C 225 100, 175 200, 225 200"
                      stroke="url(#flow-gradient)"
                      strokeWidth="3"
                      className="text-brand"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                      animate={{
                        pathLength: [0, 0.3, 0.3, 0],
                        pathOffset: [0, 0, 0.7, 1],
                        opacity: [0, 1, 1, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />

                    {/* 3. Reverse Subtle Flow */}
                    <motion.path
                      d="M 175 100 C 225 100, 175 200, 225 200"
                      stroke="url(#flow-gradient)"
                      strokeWidth="1.5"
                      className="text-brand/50"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 0 }}
                      animate={{
                        pathLength: [0, 0.2, 0.2, 0],
                        pathOffset: [1, 0.8, 0, 0],
                        opacity: [0, 0.5, 0.5, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 1.5
                      }}
                    />

                    {/* 4. Forward Particle (Glowing dot) */}
                    <circle r="4" className="fill-brand" filter="url(#glow)">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M 175 100 C 225 100, 175 200, 225 200"
                        calcMode="spline"
                        keyTimes="0;1"
                        keySplines="0.4 0 0.2 1"
                      />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="3s" repeatCount="indefinite" />
                    </circle>

                    {/* 5. Reverse Particle (Smaller dot) */}
                    <circle r="2" className="fill-brand/60">
                      <animateMotion
                        dur="4s"
                        repeatCount="indefinite"
                        path="M 225 200 C 175 200, 225 100, 175 100"
                        calcMode="linear"
                      />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="4s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </svg>
            </motion.div>

            {/* Image 2: Buyer */}
            <motion.div
              style={{ z: 80 }}
              className="absolute bottom-0 right-0 w-[45%] h-[62%] rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 z-30"
            >
              <div className="absolute inset-0 bg-black/10 z-10 transition-opacity hover:opacity-0"></div>
              <img
                src={buyerImg}
                alt="Buyer"
                className="w-full h-full object-cover pointer-events-none"
              />
            </motion.div>



          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
