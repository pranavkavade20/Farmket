import React from 'react';
import { motion } from 'framer-motion';
import farmerImg from '@/assets/images/farmer_product.png';

export const CTASection = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="rounded-[3rem] bg-[#EBF8FE] dark:bg-blue-950/20 px-10 py-16 lg:px-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl">
        <div className="relative z-10 md:w-1/2 mb-10 md:mb-0">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-[#0A2617] dark:text-white mb-6 leading-[1.1]"
          >
            Ready To Fill Your Cart With Freshness?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[15px] text-gray-600 dark:text-gray-400 mb-8 font-medium max-w-md"
          >
            Shop farm-fresh groceries, daily essentials, and exclusive deals delivered straight to your door.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <button className="h-14 px-8 bg-[#111] rounded-2xl text-white flex items-center justify-center font-bold hover:bg-black transition-colors shadow-xl text-sm">App Store</button>
            <button className="h-14 px-8 bg-[#111] rounded-2xl text-white flex items-center justify-center font-bold hover:bg-black transition-colors shadow-xl text-sm">Google Play</button>
          </motion.div>
        </div>
        
        <div className="md:w-1/2 relative flex justify-end">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/50 dark:bg-blue-900/30 blur-3xl rounded-full" />
          <motion.img 
            src={farmerImg}
            alt="Farmer with fresh produce"
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 60, delay: 0.4 }}
            className="relative z-10 h-72 w-72 object-cover rounded-full shadow-2xl ring-[12px] ring-white/50 dark:ring-gray-900/50"
          />
        </div>
      </div>
    </motion.section>
  );
};
