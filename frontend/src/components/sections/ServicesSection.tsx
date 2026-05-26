import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Users, Leaf, Truck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';

import featureOne from '@/assets/images/features/featureOne.png';
import featureTwo from '@/assets/images/features/featureTwo.png';
import featureThree from '@/assets/images/features/featureThree.png';
import featureFour from '@/assets/images/features/featureFour.png';
import logoImg from '@/assets/images/logo.png';

interface ServiceCardProps {
  image: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay?: number;
}

const ServiceCard = ({ image, icon, title, desc, delay = 0 }: ServiceCardProps) => {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-gray-50 dark:bg-[#111] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(22,135,72,0.15)] transition-all relative group h-full flex flex-col"
    >
      {/* Top Image Section */}
      <div className="h-48 w-full overflow-hidden relative">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      </div>

      {/* Floating Icon Badge */}
      <div className="absolute top-40 left-6 z-20 w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center text-[#168748] group-hover:-translate-y-2 transition-transform duration-300">
        {icon}
      </div>

      {/* Content */}
      <div className="px-8 pt-12 pb-8 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-[15px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

export const ServicesSection = () => {
  return (
    <section className="relative w-full bg-white dark:bg-[#0A0A0A] py-24 rounded-[3rem] px-6 lg:px-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
      
      {/* Background Soft Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B9F046] opacity-10 dark:opacity-[0.03] blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#168748] opacity-10 dark:opacity-[0.03] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-10">
           <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
           >
              <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                Farmket Services
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                Empowering Farmers <br className="hidden md:block"/> & Organic Buyers
              </h2>
           </motion.div>
           
           <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 lg:max-w-lg lg:text-right flex flex-col lg:items-end gap-6"
           >
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
                We help farmers grow their business digitally while enabling buyers to access fresh, trusted, and organic farm products directly from the source.
              </p>
              <Button className="rounded-full bg-[#111] hover:bg-[#168748] text-white px-8 py-7 text-[15px] font-bold shadow-xl shadow-black/10 dark:shadow-[#168748]/20 transition-all hover:scale-105 flex items-center justify-center gap-2 border-2 border-transparent">
                 Explore Farmket <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
           </motion.div>
        </div>

        {/* 3-Column Interactive Grid Layout */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-16 items-center">
          
          {/* SVG Connector Lines Overlay (Desktop Only) */}
          <div className="absolute inset-0 hidden lg:block pointer-events-none z-0 overflow-visible">
             <svg className="w-full h-full" style={{ position: 'absolute' }}>
                {/* We use percentage-based coordinates that roughly align with the grid centers */}
                {/* Left Top to Center */}
                <path d="M 25% 25% C 40% 25%, 45% 50%, 50% 50%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-gray-300 dark:text-gray-700 opacity-60" />
                <circle cx="25%" cy="25%" r="4" fill="currentColor" className="text-[#168748]" />
                
                {/* Left Bottom to Center */}
                <path d="M 25% 75% C 40% 75%, 45% 50%, 50% 50%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-gray-300 dark:text-gray-700 opacity-60" />
                <circle cx="25%" cy="75%" r="4" fill="currentColor" className="text-[#168748]" />

                {/* Right Top to Center */}
                <path d="M 75% 25% C 60% 25%, 55% 50%, 50% 50%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-gray-300 dark:text-gray-700 opacity-60" />
                <circle cx="75%" cy="25%" r="4" fill="currentColor" className="text-[#168748]" />

                {/* Right Bottom to Center */}
                <path d="M 75% 75% C 60% 75%, 55% 50%, 50% 50%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-gray-300 dark:text-gray-700 opacity-60" />
                <circle cx="75%" cy="75%" r="4" fill="currentColor" className="text-[#168748]" />
                
                {/* Animated Dots flowing towards center */}
                <circle r="4" fill="#168748" className="shadow-lg">
                  <animateMotion dur="3s" repeatCount="indefinite" path="M 25% 25% C 40% 25%, 45% 50%, 50% 50%" />
                </circle>
                <circle r="4" fill="#168748">
                  <animateMotion dur="3.5s" repeatCount="indefinite" path="M 25% 75% C 40% 75%, 45% 50%, 50% 50%" />
                </circle>
                <circle r="4" fill="#168748">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path="M 75% 25% C 60% 25%, 55% 50%, 50% 50%" />
                </circle>
                <circle r="4" fill="#168748">
                  <animateMotion dur="3.8s" repeatCount="indefinite" path="M 75% 75% C 60% 75%, 55% 50%, 50% 50%" />
                </circle>
             </svg>
          </div>

          {/* Left Column Cards */}
          <div className="flex flex-col gap-12 z-10 w-full relative">
             <div className="relative h-full"><ServiceCard 
                image={featureOne} 
                icon={<Users className="w-6 h-6"/>} 
                title="Direct Farmer Marketplace" 
                desc="Farmers can sell fresh produce directly to customers without middlemen."
                delay={0.1}
             /></div>
             <div className="relative h-full mt-0 lg:mt-8"><ServiceCard 
                image={featureTwo} 
                icon={<Leaf className="w-6 h-6"/>} 
                title="Organic Product Discovery" 
                desc="Buyers can easily explore healthy, organic, and locally sourced products."
                delay={0.3}
             /></div>
          </div>

          {/* Center Animated Circle */}
          <div className="flex justify-center items-center py-12 lg:py-0 z-20 order-first lg:order-none relative h-full">
             <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                {/* Outer pulsing rings */}
                <div className="absolute inset-0 bg-[#E2F5D6] dark:bg-green-900/30 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-4 bg-[#B9F046]/40 dark:bg-green-800/40 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
                
                {/* Inner glowing core */}
                <div className="relative z-10 w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-[#168748] to-[#0A2617] rounded-full shadow-[0_0_40px_rgba(22,135,72,0.4)] flex items-center justify-center border-4 border-white dark:border-gray-900 ring-8 ring-[#E2F5D6]/50 dark:ring-green-900/20">
                   <motion.img 
                      src={logoImg} 
                      alt="Farmket Logo" 
                      className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-xl brightness-0 invert"
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   />
                </div>
             </div>
          </div>

          {/* Right Column Cards */}
          <div className="flex flex-col gap-12 z-10 w-full relative">
             <div className="relative h-full"><ServiceCard 
                image={featureThree} 
                icon={<Truck className="w-6 h-6"/>} 
                title="Smart Delivery Network" 
                desc="Fast and reliable delivery system connecting farms to households."
                delay={0.2}
             /></div>
             <div className="relative h-full mt-0 lg:mt-8"><ServiceCard 
                image={featureFour} 
                icon={<TrendingUp className="w-6 h-6"/>} 
                title="Farmer Business Growth" 
                desc="Helping farmers expand online with better visibility, orders, and earnings."
                delay={0.4}
             /></div>
          </div>

        </div>
      </div>
    </section>
  );
};
