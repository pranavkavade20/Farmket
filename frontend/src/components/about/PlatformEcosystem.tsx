import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DashboardMock } from './ui-mocks/DashboardMock';
import { ProductCardMock } from './ui-mocks/ProductCardMock';
import { SearchInterfaceMock } from './ui-mocks/SearchInterfaceMock';
import { AIMock } from './ui-mocks/AIMock';

export const PlatformEcosystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  // Specific element animations for a "pulling together" effect
  const dashboardX = useTransform(scrollYProgress, [0, 0.5], [-200, 0]);
  const searchX = useTransform(scrollYProgress, [0, 0.5], [200, 0]);
  const aiY = useTransform(scrollYProgress, [0, 0.5], [-200, 0]);
  const productY = useTransform(scrollYProgress, [0, 0.5], [200, 0]);

  return (
    <section ref={containerRef} className="py-32 bg-background relative overflow-hidden flex flex-col items-center">
      <div className="container mx-auto px-6 md:px-12 mb-20 text-center relative z-20">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
          One unified ecosystem.
        </h2>
        <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
          Every component works together seamlessly to bring the farm directly to the buyer, optimized at every step.
        </p>
      </div>

      <div className="w-full max-w-7xl h-[800px] relative perspective-1000 flex items-center justify-center">
        <motion.div 
          style={{ scale, opacity }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Central Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[100px] -z-10" />

          {/* Core Structure: Lines connecting everything */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-20">
            <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
            <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
            <circle cx="50%" cy="50%" r="200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
          </svg>

          {/* Left: Farmer Dashboard */}
          <motion.div style={{ x: dashboardX }} className="absolute left-[5%] top-1/2 -translate-y-1/2 z-10 hidden lg:block">
            <DashboardMock className="scale-[0.55] transform origin-left rotate-y-[15deg] opacity-80 blur-[1px] hover:blur-none hover:opacity-100 hover:z-50 transition-all duration-500" />
          </motion.div>

          {/* Right: Buyer Search */}
          <motion.div style={{ x: searchX }} className="absolute right-[5%] top-1/2 -translate-y-1/2 z-10 hidden lg:block">
            <SearchInterfaceMock className="scale-[0.65] transform origin-right rotate-y-[-15deg] opacity-80 blur-[1px] hover:blur-none hover:opacity-100 hover:z-50 transition-all duration-500" />
          </motion.div>

          {/* Top: AI Widget */}
          <motion.div style={{ y: aiY }} className="absolute top-[10%] left-1/2 -translate-x-1/2 z-30">
            <AIMock className="scale-[0.8] transform origin-top rotate-x-[15deg] shadow-2xl ring-1 ring-purple-500/30" />
          </motion.div>

          {/* Center/Bottom: The Product uniting them all */}
          <motion.div style={{ y: productY }} className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-40">
            <ProductCardMock className="scale-[1.1] shadow-2xl ring-4 ring-brand/20 bg-surface-elevated/90 backdrop-blur-2xl" />
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
