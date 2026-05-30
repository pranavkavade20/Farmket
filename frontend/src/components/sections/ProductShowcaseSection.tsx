import React from 'react';
import { motion } from 'framer-motion';

export const ProductShowcaseSection = () => {
  return (
    <section className="w-full bg-[#FAFAF8] dark:bg-[#050505] py-24 lg:py-32 border-b border-gray-100 dark:border-gray-900 overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
      
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            Built for Scale. <br className="hidden sm:block" />
            Designed for Simplicity.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 font-medium"
          >
            Experience a world-class interface that brings the entire agricultural marketplace directly to your fingertips.
          </motion.p>
        </div>

        {/* CSS Mockup of the Platform */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Main Browser Mockup */}
          <div className="rounded-[2rem] bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 shadow-[0_40px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden">
            
            {/* Browser Header */}
            <div className="bg-gray-100 dark:bg-[#111] px-6 py-4 flex items-center border-b border-gray-200 dark:border-gray-800">
              <div className="flex space-x-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto bg-white dark:bg-[#050505] text-gray-400 text-xs font-bold px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 w-64 text-center">
                farmket.com/dashboard
              </div>
            </div>
            
            {/* Browser Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 bg-gray-50 dark:bg-[#050505]">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col gap-4 col-span-3">
                <div className="w-full h-8 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-800"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                ))}
              </div>
              
              {/* Main Content Area */}
              <div className="col-span-1 md:col-span-9 flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="w-48 h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-500"></div>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900"></div>
                      <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  ))}
                </div>
                
                {/* Chart Area */}
                <div className="h-48 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative overflow-hidden">
                   <div className="absolute bottom-6 left-6 right-6 flex items-end gap-2 h-24">
                     {[20, 40, 30, 60, 50, 80, 70, 90, 85, 100].map((h, i) => (
                       <div key={i} className="w-full bg-[#168748] rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Mobile Mockup */}
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-12 -right-6 lg:-right-12 w-64 h-[500px] bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border-[8px] border-gray-900 dark:border-gray-800 shadow-2xl overflow-hidden hidden md:block"
          >
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 dark:bg-gray-800 rounded-b-xl w-32 mx-auto z-20"></div>
            
            {/* App Content */}
            <div className="w-full h-full bg-gray-50 dark:bg-[#050505] p-5 pt-12 flex flex-col gap-4 relative">
              <div className="w-full h-32 bg-green-500 rounded-2xl p-4 text-white">
                 <div className="w-20 h-4 bg-white/30 rounded mb-2"></div>
                 <div className="w-32 h-8 bg-white/50 rounded"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="h-24 bg-white dark:bg-gray-900 rounded-xl"></div>
                 <div className="h-24 bg-white dark:bg-gray-900 rounded-xl"></div>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                 <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded mb-4"></div>
                 <div className="space-y-3">
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className="flex gap-3 items-center">
                       <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800"></div>
                       <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};
