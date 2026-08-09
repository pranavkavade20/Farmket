import { useState } from "react";
import {
  Search,
  ChevronRight,
  Leaf,
  Users,
  ShoppingBag,
  Star,
  CheckCircle,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

// Using exact images from the prompt design
import farmerImg from "@/assets/images/hero/indian_farmer.png";
import buyerImg from "@/assets/images/hero/young_buyer.png";
import logoImg from "@/assets/images/logo.png";
import tomatoImg from "@/assets/images/hero/hero_icon_tomato.png";
import wheatImg from "@/assets/images/hero/hero_icon_wheat.png";
import broccoliImg from "@/assets/images/hero/hero_icon_broccoli.png";
import potatoImg from "@/assets/images/hero/hero_icon_potatoo.png";

export const HeroSection = () => {
  const [activeCategory, setActiveCategory] = useState("Vegetables");

  // Framer motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const slideInVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <section className="relative w-full flex flex-col items-center bg-background overflow-hidden pb-16 font-sans transition-colors duration-300">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] blur-[40px]"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_70%)] blur-[60px]"></div>

        {/* Floating Leaves */}
        <motion.div
          animate={{
            y: [0, 800],
            x: [0, 100],
            rotate: [0, 360],
            opacity: [0, 0.2, 0.2, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] text-brand z-10"
        >
          <Leaf size={24} />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 800],
            x: [0, -100],
            rotate: [0, 360],
            opacity: [0, 0.2, 0.2, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5,
          }}
          className="absolute top-[20%] right-[20%] text-brand z-10"
        >
          <Leaf size={32} />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 800],
            x: [0, 50],
            rotate: [0, -360],
            opacity: [0, 0.2, 0.2, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
          className="absolute bottom-[30%] left-[50%] text-brand z-10"
        >
          <Leaf size={20} />
        </motion.div>
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 pt-16 pb-8 flex flex-col lg:flex-row relative z-10 min-h-[80vh]">
        {/* Left Content Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col justify-center lg:pr-16 text-center lg:text-left items-center lg:items-start mb-16 lg:mb-0"
        >
          <motion.div
            variants={fadeUpVariants}
            className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full font-semibold text-sm mb-6 border border-brand/20 transition-colors duration-300"
          >
            <Leaf size={16} />
            <span>Connecting Farms to Markets</span>
          </motion.div>

          <motion.h1
            variants={fadeUpVariants}
            className="text-[36px] sm:text-[44px] lg:text-[64px] font-display font-extrabold leading-[1.1] tracking-tight mb-6 text-foreground px-2 sm:px-0 transition-colors duration-300"
          >
            One Platform.
            <br />
            More Opportunities.
            <br />
            <span className="text-gradient">
              For Farmers & Buyers.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            className="text-lg text-foreground-secondary mb-10 max-w-lg leading-relaxed mx-auto lg:mx-0 transition-colors duration-300"
          >
            Buy fresh produce directly from trusted farmers or sell your crops
            to thousands of verified buyers across India.
          </motion.p>

          <motion.div
            variants={scaleInVariants}
            className="flex flex-col sm:flex-row gap-4 mx-0 sm:mx-10 mb-10 w-full sm:w-auto px-4 sm:px-0"
          >
            <a
              href="#farmer"
              className="bg-brand hover:bg-brand-hover text-white py-3.5 px-7 rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto shadow-md"
            >
              I'm a Farmer <ChevronRight size={18} />
            </a>
            <a
              href="#buyer"
              className="bg-surface hover:bg-state-hover text-foreground py-3.5 px-7 rounded-full font-semibold flex items-center justify-center gap-2 transition-all border border-border-strong hover:-translate-y-0.5 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              I'm a Buyer <ShoppingBag size={18} />
            </a>
          </motion.div>

          <motion.div
            variants={fadeUpVariants}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="flex -space-x-2">
              {[11, 12, 33, 44, 55].map((img) => (
                <img
                  key={img}
                  src={`https://i.pravatar.cc/100?img=${img}`}
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-surface"
                />
              ))}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex text-yellow-500 mb-0.5 justify-center sm:justify-start">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    fill="currentColor"
                    stroke="currentColor"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground-secondary transition-colors duration-300">
                Trusted by 10,000+ Farmers & Buyers
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Visual Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex-1 relative flex items-center justify-center h-[400px] sm:h-[500px] lg:h-[600px] w-full transform scale-[0.85] sm:scale-90 lg:scale-100 mt-10 lg:mt-0"
        >
          <div className="relative w-full max-w-[500px] lg:max-w-none h-full flex items-center justify-center">
            {/* Animated Connection Path */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[85%] h-[85%] sm:w-[80%] sm:h-[80%] border-2 border-dashed border-brand/30 rounded-full z-0"
            ></motion.div>

            {/* Floating Crop Nodes along the path */}
            <motion.div
              animate={{ y: [-10, 10] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-surface rounded-full flex items-center justify-center shadow-md z-20 overflow-hidden border border-border-subtle transition-colors duration-300"
            >
              <img
                src={tomatoImg}
                alt="Tomato"
                className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
              />
            </motion.div>
            <motion.div
              animate={{ y: [-10, 10] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-surface rounded-full flex items-center justify-center shadow-md z-20 overflow-hidden border border-border-subtle transition-colors duration-300"
            >
              <img
                src={wheatImg}
                alt="Wheat"
                className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
              />
            </motion.div>
            <motion.div
              animate={{ y: [-10, 10] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute left-[-10px] sm:left-[-28px] top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-surface rounded-full flex items-center justify-center shadow-md z-20 overflow-hidden border border-border-subtle transition-colors duration-300"
            >
              <img
                src={broccoliImg}
                alt="Broccoli"
                className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
              />
            </motion.div>
            <motion.div
              animate={{ y: [-10, 10] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 3,
              }}
              className="absolute right-[-10px] sm:right-[-28px] top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-surface rounded-full flex items-center justify-center shadow-md z-20 overflow-hidden border border-border-subtle transition-colors duration-300"
            >
              <img
                src={potatoImg}
                alt="Potato"
                className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
              />
            </motion.div>

            {/* Left Image: Farmer */}
            <motion.div
              whileHover={{ y: -5 }}
              className="absolute left-0 top-[5%] sm:top-[10%] w-[140px] sm:w-[200px] lg:w-[280px] h-[180px] sm:h-[260px] lg:h-[350px] rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-lg transition-transform z-10"
            >
              <img
                src={farmerImg}
                alt="Happy Indian Farmer"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Center Hub: Platform */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.4)",
                  "0 0 0 20px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] bg-surface rounded-full flex items-center justify-center shadow-lg z-20 border-4 border-brand transition-colors duration-300"
            >
              <img
                src={logoImg}
                alt="Farmket Logo"
                className="w-[36px] h-[36px] sm:w-[50px] sm:h-[50px] lg:w-[60px] lg:h-[60px] object-contain"
              />
            </motion.div>

            {/* Right Image: Buyer */}
            <motion.div
              whileHover={{ y: -5 }}
              className="absolute right-0 bottom-[5%] sm:bottom-[10%] w-[140px] sm:w-[200px] lg:w-[280px] h-[180px] sm:h-[260px] lg:h-[350px] rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-lg transition-transform z-10"
            >
              <img
                src={buyerImg}
                alt="Modern Buyer"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Floating Info Cards */}
            <motion.div
              animate={{ y: [-10, 10] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="absolute top-[-5%] sm:top-[0%] lg:top-[5%] right-[2%] sm:right-[10%] lg:right-[5%] glass-card p-2.5 sm:p-4 z-20 max-w-[130px] sm:max-w-[180px] lg:max-w-[220px]"
            >
              <div className="text-[10px] sm:text-xs lg:text-sm font-bold text-foreground mb-0.5 sm:mb-1 flex items-center gap-1 sm:gap-1.5 transition-colors duration-300">
                <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-brand" /> For Farmers
              </div>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-foreground-secondary leading-snug transition-colors duration-300">
                Get better prices and reach more buyers instantly.
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [10, -10] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="absolute bottom-[-5%] sm:bottom-[0%] lg:bottom-[5%] left-[0%] sm:left-[5%] lg:left-[0%] glass-card p-2.5 sm:p-4 z-20 max-w-[130px] sm:max-w-[180px] lg:max-w-[220px]"
            >
              <div className="text-[10px] sm:text-xs lg:text-sm font-bold text-foreground mb-0.5 sm:mb-1 flex items-center gap-1 sm:gap-1.5 transition-colors duration-300">
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-info" /> For Buyers
              </div>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-foreground-secondary leading-snug transition-colors duration-300">
                Access quality produce directly at fair market prices.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
