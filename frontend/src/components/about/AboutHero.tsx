import { motion } from 'framer-motion';
import { DashboardMock } from './ui-mocks/DashboardMock';
import { floatingVariants, ambientBackgroundVariants } from '@/utils/animations';

export const AboutHero = () => {
  return (
    <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          variants={ambientBackgroundVariants}
          animate="animate"
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" 
        />
        <motion.div 
          variants={ambientBackgroundVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" 
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center mt-20 h-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mb-16 z-20"
        >
          <h1 className="text-[3.5rem] md:text-[5rem] font-display font-bold leading-tight tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 drop-shadow-sm">
            The intelligent ecosystem.
          </h1>
          <p className="text-xl md:text-2xl text-foreground-secondary font-medium max-w-2xl mx-auto drop-shadow-md">
            Farmket connects farmers directly with buyers, powered by a seamless, AI-driven platform.
          </p>
        </motion.div>

        {/* Cinematic UI Presentation */}
        <div className="w-full max-w-5xl perspective-1000 flex items-center justify-center relative z-10 flex-1">
          {/* Entrance animation wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, rotateX: 15, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 10, y: 0 }}
            transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex items-center justify-center"
          >
            {/* Continuous floating animation wrapper */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="w-full flex items-center justify-center"
            >
              <DashboardMock />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        >
          <span className="text-sm font-medium text-muted uppercase tracking-widest">Explore</span>
          <div className="w-px h-16 bg-gradient-to-b from-brand to-transparent"></div>
        </motion.div>
      </div>

      {/* Overlay gradient to blend with next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-30 pointer-events-none"></div>
    </section>
  );
};
