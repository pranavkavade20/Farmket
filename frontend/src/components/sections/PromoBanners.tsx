import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { motion, type Variants } from 'framer-motion';
import farmerImg from '@/assets/images/farmer_product.png';
const rightBannerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const rightBannerItem: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 60 } }
};

export const PromoBanners = () => {
  return (
    <section className="grid lg:grid-cols-[1fr_350px] gap-6 w-full">
      {/* Light Blue Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: -30 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-[#EBF8FE] rounded-[2.5rem] p-10 lg:p-14 text-gray-900 flex flex-col md:flex-row items-center justify-between overflow-hidden relative min-h-[300px]"
      >
        <div className="relative z-10 md:w-3/5 text-left">
          <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-4 text-[#0A2617]">
            Fresh Fruits & Vegetables.<br />Delivered Daily.
          </h2>
          <p className="text-[15px] text-gray-600 font-medium mb-8 max-w-sm">
            We deliver everything you need straight to your door.
          </p>
          <Button className="rounded-full bg-[#111] hover:bg-black text-white px-6 py-6 text-sm font-bold shadow-xl">
            Shop Fresh Produce <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="relative z-10 md:w-2/5 flex justify-end mt-8 md:mt-0">
          <div className="w-64 h-64 bg-white/40 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          {/* Fallback Basket Placeholder */}
          <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[#D4F1F9] rounded-full opacity-50 blur-2xl"></div>
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
      </motion.div>

      {/* 3 Vertical Promo Banners */}
      <motion.div
        variants={rightBannerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col gap-4"
      >
        <motion.div variants={rightBannerItem} className="rounded-[2rem] bg-gradient-to-br from-[#419468] to-[#168748] p-6 text-white relative overflow-hidden flex-1 shadow-lg group">
          <div className="relative z-10 max-w-[70%] h-full flex flex-col justify-between">
            <h3 className="text-[15px] font-black leading-snug uppercase tracking-wide">NEW HERE? ENJOY 10% OFF YOUR FIRST ORDER</h3>
            <div className="mt-4 flex items-end justify-between w-[140%]">
              <p className="text-xs text-white/80 font-medium max-w-[55%]">Sign up today and get instant savings on your first grocery purchase.</p>
              <button className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={rightBannerItem} className="rounded-[2rem] bg-gradient-to-br from-[#FF6B6B] to-[#F03E3E] p-6 text-white relative overflow-hidden flex-1 shadow-lg group">
          <div className="relative z-10 max-w-[70%] h-full flex flex-col justify-between">
            <h3 className="text-[15px] font-black leading-snug uppercase tracking-wide">FREE DELIVERY ON ORDERS OVER $50</h3>
            <div className="mt-4 flex items-end justify-between w-[140%]">
              <p className="text-xs text-white/80 font-medium max-w-[55%]">Stock up on your weekly groceries and save more with zero delivery charges.</p>
              <button className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={rightBannerItem} className="rounded-[2rem] bg-gradient-to-br from-[#FFD43B] to-[#FCC419] p-6 text-[#111] relative overflow-hidden flex-1 shadow-lg group">
          <div className="relative z-10 max-w-[70%] h-full flex flex-col justify-between">
            <h3 className="text-[15px] font-black leading-snug uppercase tracking-wide">FRESH GROCERIES FOR YOUR FAMILY, WITHOUT HASSLE.</h3>
            <div className="mt-4 flex items-end justify-between w-[140%]">
              <p className="text-xs text-gray-800 font-medium max-w-[55%]">We deliver everything you need straight to your door.</p>
              <button className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
