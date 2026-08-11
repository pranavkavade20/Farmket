import { ChevronRight, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

import farmerImg from "@/assets/images/hero/indian_farmer.png";
import buyerImg from "@/assets/images/hero/young_buyer.png";

export const HeroSection = () => {
  return (
    <section className="relative w-full bg-background overflow-hidden pt-14 pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-24 font-sans transition-colors duration-300 min-h-[calc(100vh-5.5rem)] lg:min-h-[calc(100vh-5rem)]">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex min-h-[calc(100vh-5.5rem)] lg:min-h-[calc(100vh-5rem)] flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
        
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
            className="text-[clamp(3rem,6vw,5.5rem)] font-display font-black leading-[1.05] tracking-tight mb-8 text-foreground"
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
            Experience a radical new way to source agricultural products. We connect you directly with trusted farmers, ensuring transparency, quality, and fair pricing without the middlemen.
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full relative hidden lg:flex items-center justify-center h-[420px] xl:h-[520px]"
        >
          {/* Main Visual Composition */}
          <div className="relative w-full max-w-[480px] xl:max-w-[550px] aspect-[4/3] flex items-center justify-center">
            
            {/* Elegant Background Element */}
            <div className="absolute inset-0 bg-brand/5 dark:bg-brand/10 rounded-[40px] transform -rotate-3 scale-105 border border-brand/10 transition-transform duration-700 hover:rotate-0"></div>
            
            {/* Image 1: Farmer */}
            <div className="absolute top-0 left-0 w-3/5 h-[70%] rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 z-20 transition-transform duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-black/10 z-10 transition-opacity hover:opacity-0"></div>
              <img
                src={farmerImg}
                alt="Farmer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 2: Buyer */}
            <div className="absolute bottom-0 right-0 w-[55%] h-[65%] rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 z-30 transition-transform duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-black/10 z-10 transition-opacity hover:opacity-0"></div>
              <img
                src={buyerImg}
                alt="Buyer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating connecting element */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 glass-card p-4 rounded-2xl shadow-xl flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                 <ArrowRight size={20} />
               </div>
               <div>
                 <div className="text-sm font-bold text-foreground">Direct Trade</div>
                 <div className="text-xs font-medium text-foreground-secondary">Zero Middlemen</div>
               </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};
