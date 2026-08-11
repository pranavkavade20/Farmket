import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardMock } from './ui-mocks/DashboardMock';
import { ProductCardMock } from './ui-mocks/ProductCardMock';
import { Sprout, BarChart3, TrendingUp, type LucideIcon } from 'lucide-react';
import { floatingVariants } from '@/utils/animations';

interface CardData {
  title: string;
  description: string;
  icon: LucideIcon;
}

const cards: CardData[] = [
  {
    title: "Digital Production",
    description: "Farmers digitize their inventory, crop cycles, and farm data to gain a comprehensive view of their operations directly on the platform.",
    icon: Sprout,
  },
  {
    title: "Product Generation",
    description: "Create premium listings with automated quality scoring and real-time inventory tracking, ready for the marketplace.",
    icon: BarChart3,
  },
  {
    title: "Direct Marketplace",
    description: "Listings flow seamlessly into the algorithm-driven marketplace, bypassing middlemen and maximizing profit.",
    icon: TrendingUp,
  }
];

export const FarmerStory = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % cards.length);
    }, 5000); // 5 seconds per step
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-background relative w-full h-screen min-h-[800px] overflow-hidden flex flex-col items-center justify-start pt-16 md:pt-20">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-brand/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Text Overlay Sequence */}
      <div className="relative w-full max-w-2xl h-36 md:h-40 z-40 pointer-events-none px-6 md:px-12 shrink-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center transform-gpu"
          >
            <span className="text-brand font-semibold tracking-wider uppercase text-xs md:text-sm mb-2 flex items-center gap-2">
              {(() => {
                const Icon = cards[currentStep].icon;
                return <Icon className="w-4 h-4" />;
              })()} 
              The Farmer Experience
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-3 tracking-tight text-foreground drop-shadow-sm">
              {cards[currentStep].title}
            </h2>
            <p className="text-sm md:text-base text-foreground-secondary max-w-lg leading-relaxed drop-shadow-sm">
              {cards[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* UI Scenes Stage */}
      <div className="relative w-full flex-1 mt-2 md:mt-4 perspective-1000 flex items-start justify-center">
        {/* Scene 1: Dashboard */}
        <motion.div
          animate={{
            opacity: currentStep === 0 ? 1 : 0,
            scale: currentStep === 0 ? 1 : 0.95,
            y: currentStep === 0 ? 0 : currentStep > 0 ? -30 : 30,
            pointerEvents: currentStep === 0 ? 'auto' : 'none'
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute z-10 w-full flex justify-center top-0 px-4 md:px-6 origin-top scale-[0.75] sm:scale-85 md:scale-95 lg:scale-100"
        >
          <motion.div variants={floatingVariants} animate="animate" className="relative group">
            <div className="absolute -inset-4 bg-brand/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <DashboardMock className="rotate-x-6 shadow-2xl border-brand/20 pointer-events-auto" />
          </motion.div>
        </motion.div>

        {/* Scene 2: Product Card */}
        <motion.div
          animate={{
            opacity: currentStep === 1 ? 1 : 0,
            scale: currentStep === 1 ? 1 : 0.95,
            y: currentStep === 1 ? 0 : currentStep > 1 ? -30 : 30,
            pointerEvents: currentStep === 1 ? 'auto' : 'none'
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute z-20 w-full flex justify-center top-4 md:top-8 px-4 origin-top scale-95 md:scale-100"
        >
          <motion.div variants={floatingVariants} animate="animate" className="relative">
            <div className="absolute -inset-6 bg-brand/20 rounded-3xl blur-2xl"></div>
            <ProductCardMock className="shadow-2xl ring-2 ring-brand/30 relative z-10 pointer-events-auto" />
          </motion.div>
        </motion.div>

        {/* Scene 3: Live Marketplace Grid */}
        <motion.div
          animate={{
            opacity: currentStep === 2 ? 1 : 0,
            scale: currentStep === 2 ? 1 : 0.95,
            y: currentStep === 2 ? 0 : 30,
            pointerEvents: currentStep === 2 ? 'auto' : 'none'
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute z-30 w-full flex justify-center top-0 px-4 md:px-6 origin-top scale-[0.75] sm:scale-85 md:scale-95 lg:scale-100"
        >
          <motion.div variants={floatingVariants} animate="animate" className="w-full max-w-5xl bg-surface-elevated rounded-2xl border border-border-subtle shadow-2xl p-6 md:p-8 backdrop-blur-xl pointer-events-auto">
            <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground">Live Marketplace</h3>
                <p className="text-xs text-foreground-secondary">Real-time direct listings</p>
              </div>
              <div className="flex gap-2">
                <div className="w-20 h-7 rounded-md bg-surface border border-border-subtle"></div>
                <div className="w-20 h-7 rounded-md bg-surface border border-border-subtle"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-center">
                  <ProductCardMock className={`scale-[0.85] transform origin-top ${i === 2 ? 'ring-2 ring-brand' : 'opacity-70 grayscale-[0.2]'}`} />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Step Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-40">
        {cards.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep === i ? 'bg-brand w-6' : 'bg-border-strong hover:bg-brand/50'}`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};