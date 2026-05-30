import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Verified Farmers', value: '15,000+', suffix: '' },
  { label: 'Active Buyers', value: '45,000+', suffix: '' },
  { label: 'Successful Orders', value: '2.5', suffix: 'M+' },
  { label: 'Cities Covered', value: '120+', suffix: '' }
];

export const SocialProofSection = () => {
  return (
    <section className="w-full bg-white dark:bg-[#0A0A0A] py-16 lg:py-24 border-b border-gray-100 dark:border-gray-900">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-center mb-12">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">
            Trusted by the agricultural community across India
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-2 flex items-baseline">
                {stat.value}
                <span className="text-2xl lg:text-3xl text-[#168748]">{stat.suffix}</span>
              </div>
              <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
