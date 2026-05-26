import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, ShoppingBag, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui';

import promoImg from '@/assets/images/promo/promo1.png';
import logoImg from '@/assets/images/logo.png';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export const PromoBanners = () => {
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl flex flex-col items-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E2F5D6] dark:bg-green-900/30 text-[#168748] dark:text-green-400 text-xs font-bold tracking-wider uppercase mb-6 border border-green-200 dark:border-green-800/50">
            Farmket Solutions
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6">
            Smart Digital Solutions For Modern Farming
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">
            Farmket simplifies farm-to-customer commerce with smart technology, direct selling, and organic marketplace solutions.
          </p>
        </motion.div>

        {/* 3 Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full mb-16"
        >
          
          {/* CARD 1: 10% OFF */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#111] rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col group relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-[0_8px_40px_rgba(22,135,72,0.1)]">
             <div className="h-48 md:h-56 w-full rounded-3xl bg-gray-100 dark:bg-gray-800 mb-10 relative overflow-hidden flex items-center justify-center">
                <img src={promoImg} alt="Promo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                
                {/* Floating UI Overlay */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/50 dark:border-gray-700"
                >
                   <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🎉</div>
                   <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">New User Reward</p>
                      <p className="text-[10px] text-gray-500 font-medium">Coupon applied!</p>
                   </div>
                </motion.div>
             </div>
             
             <div className="flex-1 flex flex-col">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#168748] mb-3">Welcome Offer</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">NEW HERE? ENJOY 10% OFF YOUR FIRST ORDER</h3>
                <p className="text-[15px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Sign up today and get instant savings on your first grocery purchase.</p>
             </div>
          </motion.div>

          {/* CARD 2: FREE DELIVERY */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#111] rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col group relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-[0_8px_40px_rgba(22,135,72,0.1)]">
             <div className="h-48 md:h-56 w-full rounded-3xl bg-blue-50/50 dark:bg-gray-900/50 mb-10 relative flex items-center justify-center border border-gray-100 dark:border-gray-800">
                {/* Outer animated ring */}
                <div className="absolute w-40 h-40 border-[1px] border-dashed border-gray-300 dark:border-gray-700 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute w-24 h-24 border-[1px] border-gray-200 dark:border-gray-700 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                
                {/* Center Logo */}
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-xl z-10 flex items-center justify-center p-3 ring-4 ring-[#E2F5D6] dark:ring-green-900/30">
                   <img src={logoImg} alt="Farmket Logo" className="w-full h-full object-contain brightness-0 dark:invert" />
                </div>

                {/* Orbiting Icons */}
                <div className="absolute w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center -top-2 right-12 z-20"><Truck className="w-4 h-4 text-[#168748]" /></div>
                <div className="absolute w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center bottom-4 left-6 z-20"><Package className="w-4 h-4 text-[#B9F046]" /></div>
                <div className="absolute w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center top-14 -left-4 z-20"><ShoppingBag className="w-4 h-4 text-[#168748]" /></div>
             </div>
             
             <div className="flex-1 flex flex-col">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#168748] mb-3">Logistics</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">FREE DELIVERY ON ORDERS OVER $50</h3>
                <p className="text-[15px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Stock up on your weekly groceries and save more with zero delivery charges.</p>
             </div>
          </motion.div>

          {/* CARD 3: FRESH GROCERIES */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#111] rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col group relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-[0_8px_40px_rgba(22,135,72,0.1)]">
             <div className="h-48 md:h-56 w-full rounded-3xl bg-gray-50 dark:bg-gray-900 mb-10 relative overflow-hidden flex items-end justify-center pt-8 px-4 border border-gray-100 dark:border-gray-800">
                {/* Analytics CSS Visual */}
                <div className="w-full h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-10">
                     <div className="w-full h-[1px] bg-gray-500" />
                     <div className="w-full h-[1px] bg-gray-500" />
                     <div className="w-full h-[1px] bg-gray-500" />
                  </div>
                  
                  {/* Bar Chart Mockup */}
                  <div className="absolute bottom-0 w-full h-[80%] flex items-end justify-between px-2 gap-2">
                     <motion.div initial={{ height: 0 }} whileInView={{ height: "40%" }} transition={{ duration: 0.8 }} className="w-full bg-[#168748]/30 dark:bg-[#168748]/50 rounded-t-sm" />
                     <motion.div initial={{ height: 0 }} whileInView={{ height: "65%" }} transition={{ duration: 0.8, delay: 0.1 }} className="w-full bg-[#168748]/50 dark:bg-[#168748]/70 rounded-t-sm" />
                     <motion.div initial={{ height: 0 }} whileInView={{ height: "45%" }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full bg-[#168748]/30 dark:bg-[#168748]/50 rounded-t-sm" />
                     <motion.div initial={{ height: 0 }} whileInView={{ height: "90%" }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full bg-[#B9F046] rounded-t-sm relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold py-1 px-2 rounded-lg">100%</div>
                     </motion.div>
                     <motion.div initial={{ height: 0 }} whileInView={{ height: "70%" }} transition={{ duration: 0.8, delay: 0.4 }} className="w-full bg-[#168748]/50 dark:bg-[#168748]/70 rounded-t-sm" />
                  </div>
                </div>
             </div>
             
             <div className="flex-1 flex flex-col">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#168748] mb-3">Quality Assurance</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">FRESH GROCERIES FOR YOUR FAMILY, WITHOUT HASSLE</h3>
                <p className="text-[15px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">We deliver everything you need straight to your door with utmost care.</p>
             </div>
          </motion.div>

        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
           <Button className="rounded-full bg-gradient-to-r from-[#168748] to-[#116a38] text-white px-8 py-7 text-[15px] font-bold shadow-lg shadow-[#168748]/30 transition-all hover:scale-105 flex items-center justify-center border-none">
              Explore Platform
           </Button>
           <Button className="rounded-full bg-white dark:bg-[#111] text-gray-900 dark:text-white px-8 py-7 text-[15px] font-bold shadow-sm hover:shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800">
              Get Started <ArrowRight className="h-4 w-4" />
           </Button>
        </motion.div>

      </div>
    </section>
  );
};
