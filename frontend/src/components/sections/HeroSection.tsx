import React, { useState } from "react";
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
    <section className="relative w-full flex flex-col items-center bg-[#FAFAF8] overflow-hidden pb-16 font-sans text-gray-900">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.08)_0%,rgba(250,250,248,0)_70%)] blur-[40px]"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(22,163,74,0.05)_0%,rgba(250,250,248,0)_70%)] blur-[60px]"></div>

        {/* Floating Leaves */}
        <motion.div
          animate={{
            y: [0, 800],
            x: [0, 100],
            rotate: [0, 360],
            opacity: [0, 0.2, 0.2, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] text-green-500 z-10"
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
          className="absolute top-[20%] right-[20%] text-green-500 z-10"
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
          className="absolute bottom-[30%] left-[50%] text-green-500 z-10"
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
            className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full font-semibold text-sm mb-6 border border-green-500/20"
          >
            <Leaf size={16} />
            <span>Connecting Farms to Markets</span>
          </motion.div>

          <motion.h1
            variants={fadeUpVariants}
            className="text-4xl sm:text-[44px] lg:text-[64px] font-extrabold leading-[1.1] tracking-tight mb-6 text-gray-900"
          >
            One Platform.
            <br />
            More Opportunities.
            <br />
            <span className="bg-gradient-to-br from-green-600 to-green-500 bg-clip-text text-transparent">
              For Farmers & Buyers.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            className="text-lg text-gray-500 mb-10 max-w-lg leading-relaxed mx-auto lg:mx-0"
          >
            Buy fresh produce directly from trusted farmers or sell your crops
            to thousands of verified buyers across India.
          </motion.p>

          <motion.div
            variants={slideInVariants}
            className="relative w-full max-w-[500px] mb-8 group"
          >
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              className="w-full py-4 pl-14 pr-32 rounded-full border border-gray-200 bg-white text-base text-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.04)] focus:outline-none focus:border-green-500 focus:shadow-[0_4px_24px_rgba(34,197,94,0.15)] transition-all"
              placeholder="Search products, crops, categories, locations..."
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-green-600 hover:bg-green-700 text-white px-6 rounded-full font-semibold transition-all hover:-translate-y-[1px]">
              Search
            </button>
          </motion.div>

          <motion.div
            variants={scaleInVariants}
            className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto"
          >
            <a
              href="#farmer"
              className="bg-gray-900 hover:bg-gray-800 text-white py-3.5 px-7 rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(17,24,39,0.15)]"
            >
              I'm a Farmer <ChevronRight size={18} />
            </a>
            <a
              href="#buyer"
              className="bg-white hover:bg-gray-50 text-gray-900 py-3.5 px-7 rounded-full font-semibold flex items-center justify-center gap-2 transition-all border border-gray-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.05)]"
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
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex text-yellow-400 mb-0.5 justify-center sm:justify-start">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    fill="currentColor"
                    stroke="currentColor"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-500">
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
          className="flex-1 relative flex items-center justify-center h-[500px] lg:h-[600px] transform scale-90 lg:scale-100 mt-10 lg:mt-0"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Animated Connection Path */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[80%] h-[80%] border-2 border-dashed border-green-500/30 rounded-full z-0"
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
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.08)] text-xl z-10"
            >
              🍅
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
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.08)] text-xl z-10"
            >
              🌾
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
              className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.08)] text-xl z-10"
            >
              🥦
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
              className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.08)] text-xl z-10"
            >
              🥔
            </motion.div>

            {/* Left Image: Farmer */}
            <motion.div
              whileHover={{ y: -5 }}
              className="absolute left-0 top-[10%] w-[200px] lg:w-[280px] h-[260px] lg:h-[350px] rounded-[20px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-transform z-10"
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
                  "0 0 0 0 rgba(22,163,74,0.4)",
                  "0 0 0 20px rgba(22,163,74,0)",
                  "0 0 0 0 rgba(22,163,74,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] bg-white rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(22,163,74,0.15)] z-20 border-4 border-[#FAFAF8]"
            >
              <img
                src={logoImg}
                alt="Farmket Logo"
                className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] object-contain"
              />
            </motion.div>

            {/* Right Image: Buyer */}
            <motion.div
              whileHover={{ y: -5 }}
              className="absolute right-0 bottom-[10%] w-[200px] lg:w-[280px] h-[260px] lg:h-[350px] rounded-[20px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-transform z-10"
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
              className="absolute top-[0%] lg:top-[5%] right-[10%] lg:right-[5%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-white/50 z-20 max-w-[180px] lg:max-w-[220px]"
            >
              <div className="text-xs lg:text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <Leaf size={16} className="text-green-600" /> For Farmers
              </div>
              <p className="text-[10px] lg:text-xs text-gray-500 leading-snug">
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
              className="absolute bottom-[0%] lg:bottom-[5%] left-[5%] lg:left-[0%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-white/50 z-20 max-w-[180px] lg:max-w-[220px]"
            >
              <div className="text-xs lg:text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <ShoppingBag size={16} className="text-blue-600" /> For Buyers
              </div>
              <p className="text-[10px] lg:text-xs text-gray-500 leading-snug">
                Access quality produce directly at fair market prices.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Premium Stats Section
      <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 mt-10 lg:-mt-12 relative z-20 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { icon: Users, val: "10K+", label: "Active Farmers", delay: 0.6 },
          {
            icon: ShoppingBag,
            val: "25K+",
            label: "Active Buyers",
            delay: 0.7,
          },
          { icon: Package, val: "15K+", label: "Products Listed", delay: 0.8 },
          {
            icon: CheckCircle,
            val: "98%",
            label: "Satisfaction Rate",
            delay: 0.9,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.6 }}
            whileHover={{
              y: -5,
              boxShadow: "0 15px 40px rgba(34,197,94,0.08)",
            }}
            className="bg-white p-4 lg:p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-black/5 flex flex-col lg:flex-row items-center text-center lg:text-left gap-3 lg:gap-4 transition-all"
          >
            <div className="w-12 h-12 shrink-0 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-extrabold text-gray-900 leading-tight">
                {stat.val}
              </div>
              <div className="text-xs lg:text-sm font-medium text-gray-500">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div> */}

    </section>
  );
};
