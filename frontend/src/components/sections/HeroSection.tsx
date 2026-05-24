import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Sprout, 
  TrendingUp, 
  ShoppingBag, 
  MessageCircle, 
  ArrowRight, 
  ShieldCheck,
  Star,
  Truck, 
} from 'lucide-react';
import tomatoImg from '@/assets/images/hero-images/tomato.png';
import broccoliImg from '@/assets/images/hero-images/broccoli.png';
import herosectionvideo from '@/assets/videos/heroSection.mp4'

export const HeroSection = () => {
  // Animation variants for staggered entrance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
  };

  const floatingVariants: Variants = {
    animate: {
      y: [0, -12, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] bg-[#FAFAF8] dark:bg-gray-900 overflow-hidden flex flex-col items-center justify-start pt-20 pb-16 px-6 lg:px-12 font-sans rounded-[3rem]">
      
      {/* Background Video Ecosystem */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105" // scale-105 prevents edge flickering during load
        >
          {/* IMPORTANT: Replace this src with your actual app preview video */}
          <source src={herosectionvideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Cinematic Gradient Overlay: 
            Dark at the top for headline readability.
            Fading to #FAFAF8 at the bottom to blend seamlessly into the interactive cards. 
        */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#FAFAF8] dark:to-gray-900 z-10" />
      </div>

      {/* Hero Content (Top) - Adjusted for dark background */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-20 max-w-4xl mx-auto text-center mt-12 mb-20"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md shadow-sm border border-white/20 mb-6 text-sm font-semibold text-white">
          <ShieldCheck className="w-4 h-4 text-[#B9F046]" /> 100% Direct, Zero Middlemen
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-[5.5rem] font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Empowering Farmers. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B9F046] to-[#84D836]">
            Nourishing Families.
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          A living marketplace where farmers earn what they deserve, and you get farm-fresh organic food delivered straight to your door. Everyone wins.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#168748] hover:bg-[#B9F046] hover:text-[#0A2617] text-white font-bold shadow-[0_8px_30px_rgba(22,135,72,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-2">
            Start Buying Fresh <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 backdrop-blur-md text-white font-bold shadow-md border border-white/20 hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2">
            <Sprout className="w-5 h-5 text-[#B9F046]" /> Join as a Farmer
          </button>
        </motion.div>
      </motion.div>

      {/* Interactive Storytelling Ecosystem (Bottom) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-20 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0 items-center mt-10"
      >
        {/* Connection Line (Desktop only) */}
        <div className="absolute top-1/2 left-[20%] right-[20%] h-0.5 hidden lg:block z-0">
          <svg className="w-full h-full overflow-visible">
            {/* Dashed background road line */}
            <line x1="0" y1="0" x2="100%" y2="0" stroke="#D1D5DB" strokeWidth="3" strokeDasharray="10 10" />
            
            {/* Animated glowing path tracing behind the truck */}
            <motion.line 
              x1="0" y1="0" x2="100%" y2="0" 
              stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"
              initial={{ strokeDasharray: "0 1000" }}
              animate={{ strokeDasharray: ["0 1000", "1000 0"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#84D836" />
                <stop offset="100%" stopColor="#F9A826" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Animated Delivery Truck traveling the bridge */}
          <motion.div 
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
          >
            {/* Inner div with a slight driving "bounce" effect */}
            <motion.div
               animate={{ y: [0, -3, 0] }}
               transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
               className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full shadow-lg border-2 border-[#168748] flex items-center justify-center text-[#168748] relative"
            >
              <Truck className="w-6 h-6" />
              {/* Small speed lines trailing the truck */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-50">
                <div className="h-0.5 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                <div className="h-0.5 w-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Central 'No Middlemen' Badge */}
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm z-10">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center block">Bypassing</span>
            <span className="text-sm font-bold text-red-500 line-through text-center block">Middlemen</span>
          </div>
        </div>

        {/* Left Side: The Farmer Experience */}
        <motion.div variants={itemVariants} className="relative z-10 flex flex-col items-center lg:items-start">
          <motion.div variants={floatingVariants} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-none border border-white dark:border-gray-800 max-w-[320px] w-full">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#E2F5D6] dark:bg-green-900/30 flex items-center justify-center text-xl">👨🏽‍🌾</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Farmer's Organic</h3>
                <p className="text-xs font-semibold text-[#168748] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> 4.9 Local Farm
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Daily Revenue</span>
                <TrendingUp className="w-4 h-4 text-[#168748]" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">+₹240.50</p>
              <p className="text-xs text-green-600 font-bold mt-1">+18% vs yesterday</p>
            </div>

            {/* Floating Live Order Notification */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -right-6 -bottom-6 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center gap-3 w-[200px]"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm">📦</div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Dispatched!</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">5kg Carrots • En Route</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Center Space for Mobile (Arrow indicator) */}
        <div className="lg:hidden flex justify-center py-8 text-[#168748]">
           <Truck className="w-8 h-8 animate-bounce" />
        </div>
        <div className="hidden lg:block"></div> {/* Spacer for grid */}

        {/* Right Side: The Buyer Experience */}
        <motion.div variants={itemVariants} className="relative z-10 flex flex-col items-center lg:items-end">
          <motion.div variants={floatingVariants} style={{ animationDelay: '1s' }} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-none border border-white dark:border-gray-800 max-w-[320px] w-full">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl">👩🏻‍🦰</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Buyer's.</h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" /> 12 Items in Cart
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: tomatoImg, name: "Heirloom Tomatoes", price: "₹4.50", farm: "Farmer's Organic" },
                { icon: broccoliImg, name: "Fresh Kale", price: "₹3.00", farm: "Valley Greens" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain drop-shadow-sm" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">From {item.farm}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#168748]">{item.price}</span>
                </div>
              ))}
            </div>

            {/* Floating Chat Bubble */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute -left-8 -top-6 bg-white dark:bg-gray-900 p-3 rounded-2xl rounded-br-none shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#F9A826]" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200">"Delivery just arrived!"</p>
            </motion.div>
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
};