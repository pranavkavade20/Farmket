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
  Activity,
  ArrowUpRight,
  Truck
} from 'lucide-react';
import tomatoImg from '@/assets/images/hero/tomato.png';
import broccoliImg from '@/assets/images/hero/broccoli.png';
import herosectionvideo from '@/assets/videos/hero.mp4';

export const HeroSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
  };

  const floatVariants: Variants = {
    animate: {
      y: [0, -15, 0],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const floatReverseVariants: Variants = {
    animate: {
      y: [0, 15, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] dark:bg-[#050505] overflow-hidden flex items-center lg:rounded-[3rem] mt-4 lg:mx-4 font-sans border border-gray-100 dark:border-gray-900 shadow-sm">
      
      {/* Background / Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80 dark:opacity-50 scale-105"
        >
          <source src={herosectionvideo} type="video/mp4" />
        </video>
        
        {/* Soft radial gradients for a premium glow effect */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#168748]/10 dark:bg-[#168748]/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent dark:from-[#050505]/95 dark:via-[#050505]/70 dark:to-transparent z-10" />
      </div>

      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center h-full">
          
          {/* Left: Typography & CTA (Asymmetrical) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="col-span-1 lg:col-span-6 xl:col-span-5 pt-12 lg:pt-0"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Live Marketplace</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight text-gray-900 dark:text-white leading-[1.05] mb-6 drop-shadow-lg">
              Empowering Farmers. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#168748] to-[#84D836] drop-shadow-sm">
                Nourishing Families.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-gray-800 dark:text-gray-200 mb-10 leading-relaxed font-semibold max-w-lg drop-shadow-md">
              A revolutionary platform where farmers earn what they deserve, and buyers get farm-fresh produce delivered directly. No middlemen. Absolute transparency.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 group">
                Join as Buyer 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-[#111] text-gray-900 dark:text-white font-bold shadow-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Sprout className="w-5 h-5 text-[#168748]" /> Join as Farmer
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-6 text-sm font-semibold text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#168748]" /> Secured Payments
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#168748]" /> Fair Pricing
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Asymmetrical Visual Ecosystem */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-7 relative h-[600px] hidden lg:block">
            
            {/* Main Centerpiece Card (Market Demand - positioned at end of road) */}
            <motion.div 
              variants={floatVariants}
              animate="animate"
              className="absolute top-[300px] left-[400px] xl:left-[420px] z-20 w-[280px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-4 rounded-3xl shadow-2xl border border-white dark:border-gray-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Market Demand</h3>
                  <div className="flex items-end gap-1.5">
                    <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">High</span>
                    <Activity className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +24%
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { icon: tomatoImg, name: "Heirloom Tomatoes", demand: "85%", trend: "+12%" },
                  { icon: broccoliImg, name: "Organic Broccoli", demand: "92%", trend: "+18%" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center p-1">
                        <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: item.demand }}></div>
                          </div>
                          <span className="text-[9px] font-bold text-gray-500">{item.demand}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-green-600">{item.trend}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Farmer Revenue Card (Positioned at start of road) */}
            <motion.div 
              variants={floatReverseVariants}
              animate="animate"
              className="absolute top-[180px] left-[30px] z-30 w-[240px] bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-lg border border-green-200 dark:border-green-800">👨🏽‍🌾</div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Ramesh Patel</h3>
                  <p className="text-[10px] font-semibold text-[#168748] flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-current" /> 4.9 Verified
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-1">Weekly Earnings</p>
                <div className="flex items-end gap-2">
                  <p className="text-xl font-black text-gray-900 dark:text-white leading-none">₹12,450</p>
                  <span className="text-[10px] font-bold text-green-600">+₹840 today</span>
                </div>
              </div>
            </motion.div>

            {/* Buyer Notification Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-[5%] right-[5%] z-10 w-[220px] bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">New Order!</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Restaurant XYZ just bought 50kg Tomatoes</p>
              </div>
            </motion.div>

            {/* Connecting Paths (SVG) */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ filter: "drop-shadow(0 0 8px rgba(22, 135, 72, 0.2))" }}>
              <svg className="w-full h-full overflow-visible">
                <motion.path
                  d="M 150 250 Q 250 150 450 350"
                  fill="none"
                  stroke="url(#gradientPath)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradientPath" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#168748" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#F9A826" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Animated Delivery Truck traveling along the path (High z-index to stay above cards) */}
            <motion.div 
              className="absolute top-0 left-0 flex flex-col items-center z-40 pointer-events-none"
              style={{
                offsetPath: "path('M 150 250 Q 250 150 450 350')",
                offsetRotate: "auto"
              }}
              animate={{ offsetDistance: ["0%", "100%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
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
                  <div className="h-0.5 w-2 bg-[#168748] dark:bg-[#B9F046] rounded-full"></div>
                  <div className="h-0.5 w-3 bg-[#168748] dark:bg-[#B9F046] rounded-full"></div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};