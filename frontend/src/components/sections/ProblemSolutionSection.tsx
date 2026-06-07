import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';

export const ProblemSolutionSection = () => {
  return (
    <section className="relative w-full bg-[#FAFAF8] dark:bg-[#050505] py-24 lg:py-32 overflow-hidden border-b border-gray-100 dark:border-white/5">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-400/5 dark:bg-red-500/5 blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-400/10 dark:bg-brand-500/10 blur-[150px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-orange-200/50 dark:border-orange-900/30 mb-6 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">The Problem</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            The Traditional Supply Chain is <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Broken.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium"
          >
            Multiple middlemen inflate prices for consumers while squeezing farmers' profits. Produce loses freshness, and transparency is non-existent.
          </motion.p>
        </div>

        {/* Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Traditional Way */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative glass-card p-8 md:p-10 border border-gray-200 dark:border-white/5 shadow-xl opacity-90 filter grayscale-[10%]"
          >
            <div className="absolute top-6 right-6">
              <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/30 shadow-sm">Old Way</span>
            </div>
            
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 flex items-center justify-center font-bold text-2xl shadow-sm">👨🏽‍🌾</div>
                <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-800"></div>
                <div className="text-sm font-bold bg-gray-50 dark:bg-[#111] px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">Farmer gets ₹10</div>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin-slow opacity-50" />
                <div className="w-full bg-red-50/50 dark:bg-red-950/10 rounded-2xl p-5 border border-red-100/50 dark:border-red-900/20 text-center backdrop-blur-sm">
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">3-4 Middlemen Involved</p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium mt-1.5">Quality drops • Prices soar • Delays happen</p>
                </div>
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin-slow opacity-50" />
              </div>
              
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 flex items-center justify-center font-bold text-2xl shadow-sm">👩🏻‍🦰</div>
                <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-800"></div>
                <div className="text-sm font-bold bg-gray-50 dark:bg-[#111] px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">Buyer pays ₹50</div>
              </div>
            </div>
          </motion.div>

          {/* Farmket Way */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative glass p-8 md:p-10 rounded-[2rem] border border-brand-200/50 dark:border-brand-500/20 shadow-2xl ring-4 ring-brand-50 dark:ring-brand-900/10"
          >
            <div className="absolute top-6 right-6">
              <span className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-black px-4 py-1.5 rounded-full border border-brand-200 dark:border-brand-800/30 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Farmket
              </span>
            </div>
            
            <div className="flex flex-col gap-8 mt-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-400 blur-xl opacity-20 rounded-full"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-[#111] flex items-center justify-center font-bold text-3xl border border-brand-100 dark:border-brand-900/30 shadow-lg">👨🏽‍🌾</div>
                </div>
                
                <div className="flex-1 flex flex-col items-center relative">
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-accent rounded-full"
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="absolute -top-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    0% Commission
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-accent blur-xl opacity-20 rounded-full"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-[#111] flex items-center justify-center font-bold text-3xl border border-orange-100 dark:border-orange-900/30 shadow-lg">👩🏻‍🦰</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5 mt-4">
                <div className="bg-white/60 dark:bg-[#111]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-white/5 shadow-sm hover:-translate-y-1 transition-transform">
                  <TrendingUp className="w-6 h-6 text-brand-500 mb-3" />
                  <p className="text-base font-bold text-gray-900 dark:text-white">Farmer gets ₹30</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 bg-brand-50 dark:bg-brand-900/20 inline-block px-2 py-0.5 rounded-md text-brand-600 dark:text-brand-400">+200% Profit</p>
                </div>
                <div className="bg-white/60 dark:bg-[#111]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-white/5 shadow-sm hover:-translate-y-1 transition-transform">
                  <TrendingDown className="w-6 h-6 text-accent mb-3" />
                  <p className="text-base font-bold text-gray-900 dark:text-white">Buyer pays ₹35</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 bg-orange-50 dark:bg-orange-900/20 inline-block px-2 py-0.5 rounded-md text-orange-600 dark:text-orange-400">-30% Cost</p>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};
