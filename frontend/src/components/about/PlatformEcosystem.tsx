import { motion } from 'framer-motion';
import { DashboardMock } from './ui-mocks/DashboardMock';
import { ProductCardMock } from './ui-mocks/ProductCardMock';
import { SearchInterfaceMock } from './ui-mocks/SearchInterfaceMock';
import { AIMock } from './ui-mocks/AIMock';
import { floatingVariants, pulseVariants } from '@/utils/animations';

export const PlatformEcosystem = () => {
  return (
    <section className="py-32 bg-background relative overflow-hidden flex flex-col items-center">
      <div className="container mx-auto px-6 md:px-12 mb-20 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            One unified ecosystem.
          </h2>
          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
            Every component works together seamlessly to bring the farm directly to the buyer, optimized at every step.
          </p>
        </motion.div>
      </div>

      <div className="w-full max-w-7xl h-[800px] relative perspective-1000 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Central Glow */}
          <motion.div 
            variants={pulseVariants}
            animate="animate"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[100px] -z-10" 
          />

          {/* Core Structure: Lines connecting everything */}
          <motion.svg 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-20 origin-center"
          >
            <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
            <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
            <circle cx="50%" cy="50%" r="200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
          </motion.svg>

          {/* Left: Farmer Dashboard */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute left-[5%] top-1/2 -translate-y-1/2 z-10 hidden lg:block"
          >
            <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: '0s' }}>
              <DashboardMock className="scale-[0.55] transform origin-left rotate-y-[15deg] opacity-80 blur-[1px] hover:blur-none hover:opacity-100 hover:z-50 transition-all duration-500" />
            </motion.div>
          </motion.div>

          {/* Right: Buyer Search */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute right-[5%] top-1/2 -translate-y-1/2 z-10 hidden lg:block"
          >
            <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: '1.5s' }}>
              <SearchInterfaceMock className="scale-[0.65] transform origin-right rotate-y-[-15deg] opacity-80 blur-[1px] hover:blur-none hover:opacity-100 hover:z-50 transition-all duration-500" />
            </motion.div>
          </motion.div>

          {/* Top: AI Widget */}
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 z-30"
          >
            <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: '0.8s' }}>
              <AIMock className="scale-[0.8] transform origin-top rotate-x-[15deg] shadow-2xl ring-1 ring-purple-500/30" />
            </motion.div>
          </motion.div>

          {/* Center/Bottom: The Product uniting them all */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-40"
          >
            <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: '2s' }}>
              <ProductCardMock className="scale-[1.1] shadow-2xl ring-4 ring-brand/20 bg-surface-elevated/90 backdrop-blur-2xl" />
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
