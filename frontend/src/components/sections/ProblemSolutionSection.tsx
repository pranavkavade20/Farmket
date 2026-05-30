import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';

export const ProblemSolutionSection = () => {
  return (
    <section className="relative w-full bg-[#FAFAF8] dark:bg-[#050505] py-24 lg:py-32 overflow-hidden border-b border-gray-100 dark:border-gray-900">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 mb-6"
          >
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">The Problem</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            The Traditional Supply Chain is Broken.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 font-medium"
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
            className="relative bg-white dark:bg-[#0A0A0A] p-8 md:p-10 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-xl opacity-80 filter grayscale-[20%]"
          >
            <div className="absolute top-6 right-6">
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-200 dark:border-red-800">Old Way</span>
            </div>
            
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center font-bold text-xl">👨🏽‍🌾</div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>
                <div className="text-sm font-bold">Farmer gets ₹10</div>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin-slow" />
                <div className="w-full bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-100 dark:border-red-900/50 text-center">
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">3-4 Middlemen Involved</p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">Quality drops • Prices soar • Delays happen</p>
                </div>
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin-slow" />
              </div>
              
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center font-bold text-xl">👩🏻‍🦰</div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>
                <div className="text-sm font-bold">Buyer pays ₹50</div>
              </div>
            </div>
          </motion.div>

          {/* Farmket Way */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[2rem] border border-green-200 dark:border-green-800/50 shadow-2xl ring-4 ring-green-50 dark:ring-green-900/10"
          >
            <div className="absolute top-6 right-6">
              <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-black px-4 py-1.5 rounded-full border border-green-200 dark:border-green-800/50 shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Farmket
              </span>
            </div>
            
            <div className="flex flex-col gap-8 mt-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 blur-md opacity-30 rounded-full"></div>
                  <div className="relative w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center font-bold text-2xl border border-green-100 dark:border-green-800">👨🏽‍🌾</div>
                </div>
                
                <div className="flex-1 flex flex-col items-center relative">
                  <div className="w-full h-1.5 bg-gradient-to-r from-green-500 to-[#B9F046] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full w-1/3 bg-white/50"
                      animate={{ x: ["0%", "300%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <div className="absolute -top-8 bg-[#168748] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    0% Commission
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-400 blur-md opacity-30 rounded-full"></div>
                  <div className="relative w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center font-bold text-2xl border border-orange-100 dark:border-orange-800">👩🏻‍🦰</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-[#0A0A0A] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Farmer gets ₹30</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">+200% Profit</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0A0A0A] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <TrendingDown className="w-5 h-5 text-orange-500 mb-2" />
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Buyer pays ₹35</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">-30% Cost</p>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};
