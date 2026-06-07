import React from 'react';
import { motion } from 'framer-motion';
import farmerImg from '@/assets/images/farmer_product.png';

// Exact proportional Apple Logo
const AppleIcon = ({ className = "w-7 h-7" }) => (
  <svg 
    className={className} 
    viewBox="0 0 384 512" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

// Official Multi-Colored Google Play Logo
const GooglePlayIcon = ({ className = "w-7 h-7" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Blue/Cyan Left Triangle */}
    <path d="M3.203 1.257c-.201.21-.328.56-.328 1.035v19.416c0 .475.127.825.328 1.035l.044.045 10.94-10.941v-.136L3.247 1.212l-.044.045z" fill="#00A0FF" />
    {/* Yellow Right Triangle */}
    <path d="M17.818 15.34l-3.633-3.633v-.136l3.633-3.633.056.032 4.316 2.453c1.233.702 1.233 1.854 0 2.556l-4.316 2.453-.056.032z" fill="#FFE000" />
    {/* Red Bottom Triangle */}
    <path d="M14.185 11.707l-10.94 10.94c.354.375.946.425 1.637.033l9.303-5.289-4.317-4.317z" fill="#FF3A44" />
    {/* Green Top Triangle */}
    <path d="M14.185 11.571l4.317-4.316-9.303-5.29c-.69-.392-1.283-.342-1.637.033l10.94 10.94z" fill="#00DC64" />
  </svg>
);

export const CTASection = () => {
  return (
    <section className="w-full bg-white dark:bg-[#050505] py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} // Smoother Apple-like easing
          className="relative w-full"
        > 
          {/* Container with modern subtle gradient and glass border */}
          <div className="rounded-[2.5rem] glass-card px-8 py-14 lg:px-16 lg:py-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl border border-brand-200/50 dark:border-white/5">
            
            {/* Background Decorative Mesh/Glow */}
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-brand-400/20 dark:bg-brand-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-lighten" />
            <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] bg-accent/15 dark:bg-accent/5 blur-[100px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-lighten" />

            {/* Text Content */}
            <div className="relative z-10 md:w-1/2 mb-16 md:mb-0">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.15]"
              >
                Join the future of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent dark:from-brand-400 dark:to-orange-400">
                  Agricultural Commerce
                </span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 font-medium max-w-md leading-relaxed"
              >
                Experience zero-commission trading, real-time tracking, and instant payments. Download the app today.
              </motion.p>
              
         
              {/* App Store Buttons Wrapper */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 mt-8"
              >
                {/* Apple App Store Button */}
                <a 
                  href="#" 
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3.5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-gray-900/20 dark:shadow-white/10"
                >
                  <AppleIcon className="w-8 h-8 pb-1" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] uppercase tracking-wider opacity-80 leading-[10px] mb-[2px]">
                      Download on the
                    </span>
                    <span className="text-xl font-bold leading-none tracking-tight">
                      App Store
                    </span>
                  </div>
                </a>

                {/* Google Play Button */}
                <a 
                  href="#" 
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3.5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-gray-900/20 dark:shadow-white/10"
                >
                  <GooglePlayIcon className="w-[30px] h-[30px]" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] uppercase tracking-wider opacity-80 leading-[10px] mb-[2px]">
                      Get it on
                    </span>
                    <span className="text-xl font-bold leading-none tracking-tight">
                      Google Play
                    </span>
                  </div>
                </a>
              </motion.div>

              {/* Social Proof / Micro-copy */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium"
              >
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <span>Trusted by over 60,000+ users</span>
              </motion.div>
            </div>
            
            {/* Image Display */}
            <div className="md:w-5/12 relative flex justify-center md:justify-end perspective-1000">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: -15, x: 20 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", bounce: 0.4, duration: 1, delay: 0.2 }}
                className="relative z-10"
              >
                {/* Soft decorative shadow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-accent rounded-[2.5rem] blur-2xl opacity-40 translate-y-6" />
                
                {/* Modern floating card style */}
                <img 
                  src={farmerImg}
                  alt="Farmer with fresh produce"
                  className="relative z-10 h-80 w-80 md:h-96 md:w-96 object-cover rounded-[2.5rem] shadow-2xl border-4 border-white/80 dark:border-white/10 rotate-3 hover:rotate-0 transition-transform duration-500 ease-out bg-white dark:bg-[#111]"
                />
                
                {/* Optional Floating Badge Element */}
                <div className="absolute -bottom-6 -left-6 z-20 glass-card text-gray-900 dark:text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                   <div className="bg-brand-50 dark:bg-brand-900/30 p-2.5 rounded-xl border border-brand-100 dark:border-brand-800/30">
                     <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-0.5">Verified</span>
                     <span className="text-base font-black">Quality Produce</span>
                   </div>
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};