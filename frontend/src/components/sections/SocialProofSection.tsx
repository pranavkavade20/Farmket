import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Verified Farmers', value: '15,000+', suffix: '' },
  { label: 'Active Buyers', value: '45,000+', suffix: '' },
  { label: 'Successful Orders', value: '2.5', suffix: 'M+' },
  { label: 'Cities Covered', value: '120+', suffix: '' }
];

const partners = [
  "AgriTech India", "Kisan Connect", "FarmFresh", "GreenHarvest", "EcoFoods", "AgroTrade", "BharatFarms", "NatureBasket"
];

export const SocialProofSection = () => {
  return (
    <section className="w-full bg-white dark:bg-[#050505] py-20 lg:py-32 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />
      
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-center mb-16">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center mb-8">
            Trusted by the agricultural community across India
          </p>
          
          {/* Infinite Marquee */}
          <div className="w-full max-w-5xl mx-auto overflow-hidden relative mask-image-fade">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10" />
            
            <motion.div 
              className="flex whitespace-nowrap gap-12 lg:gap-24 items-center py-4"
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              {[...partners, ...partners].map((partner, idx) => (
                <div key={idx} className="flex-shrink-0 text-2xl font-black text-gray-300 dark:text-[#1A1A1A] tracking-tighter hover:text-gray-400 dark:hover:text-[#333] transition-colors">
                  {partner}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mt-20">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex flex-col items-center justify-center text-center group"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-3 flex items-baseline group-hover:scale-105 transition-transform duration-500">
                {stat.value}
                <span className="text-2xl lg:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-400">{stat.suffix}</span>
              </div>
              <p className="text-sm md:text-base font-semibold text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
