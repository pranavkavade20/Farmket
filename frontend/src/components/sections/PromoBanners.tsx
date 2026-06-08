import { motion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

import promoImg from '@/assets/images/promo/promo1.png';
import promoImg2 from '@/assets/images/promo/promo2.png';
import promoImg3 from '@/assets/images/promo/promo3.png';

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
    <section className="w-full font-sans">
      <div className="w-full flex flex-col items-center">
        
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
             <div className="h-48 md:h-56 w-full rounded-3xl bg-gray-100 dark:bg-gray-800 mb-10 relative overflow-hidden flex items-center justify-center">
                <img src={promoImg2} alt="Promo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             </div>
             
             <div className="flex-1 flex flex-col">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#168748] mb-3">Logistics</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">FREE DELIVERY ON ORDERS OVER $50</h3>
                <p className="text-[15px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Stock up on your weekly groceries and save more with zero delivery charges.</p>
             </div>
          </motion.div>

          {/* CARD 3: FRESH GROCERIES */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#111] rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col group relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-[0_8px_40px_rgba(22,135,72,0.1)]">
             <div className="h-48 md:h-56 w-full rounded-3xl bg-gray-100 dark:bg-gray-800 mb-10 relative overflow-hidden flex items-center justify-center">
                <img src={promoImg3} alt="Promo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             </div>
             
             <div className="flex-1 flex flex-col">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#168748] mb-3">Quality Assurance</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">FRESH GROCERIES FOR YOUR FAMILY, WITHOUT HASSLE</h3>
                <p className="text-[15px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">We deliver everything you need straight to your door with utmost care.</p>
             </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
};
