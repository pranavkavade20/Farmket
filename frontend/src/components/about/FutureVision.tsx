import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ambientBackgroundVariants } from '@/utils/animations';

export const FutureVision = () => {
  const [particles, setParticles] = useState<Array<{x: number, y: number, duration: number, delay: number}>>([]);

  useEffect(() => {
    // Only generate random coordinates on mount to prevent hydration mismatch/layout shifts
    setParticles(
      [...Array(12)].map(() => ({
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  return (
    <section className="relative w-full min-h-[80vh] bg-surface flex flex-col items-center justify-center overflow-hidden py-32">
      {/* Background glowing gradients */}
      <motion.div 
        variants={ambientBackgroundVariants}
        animate="animate"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" 
      />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-8">
            Building a <span className="text-gradient">smarter</span> agricultural ecosystem.
          </h2>
          <p className="text-xl text-foreground-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Farmket isn't just a marketplace. It's a foundational layer for the future of agriculture, where data, AI, and direct connections empower everyone from the farm to the table.
          </p>
        </motion.div>

        {/* Abstract Ecosystem representation */}
        <div className="relative w-full max-w-3xl h-64 md:h-96 flex items-center justify-center mt-10">
          
          {/* Center */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-30 w-24 h-24 bg-surface rounded-full shadow-glow border-2 border-brand/50 flex items-center justify-center backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-full bg-brand"></div>
          </motion.div>

          {/* Orbits */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute z-20 w-64 h-64 rounded-full border border-border-strong"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-orange-400"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-blue-400"></div>
          </motion.div>

          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute z-10 w-96 h-96 rounded-full border border-border-subtle hidden md:block"
          >
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-purple-400"></div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-yellow-400"></div>
          </motion.div>

          {/* Data particles */}
          {particles.map((particle, i) => (
             <motion.div 
               key={i}
               className="absolute w-1 h-1 bg-brand rounded-full z-20"
               animate={{ 
                 opacity: [0, 1, 0],
                 scale: [1, 2, 1],
                 x: [particle.x, 0],
                 y: [particle.y, 0]
               }}
               transition={{ 
                 duration: particle.duration, 
                 repeat: Infinity, 
                 delay: particle.delay 
               }}
             />
          ))}

        </div>
      </div>
    </section>
  );
};
