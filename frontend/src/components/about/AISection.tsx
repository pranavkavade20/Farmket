import { motion, useReducedMotion } from 'framer-motion';
import { AIMock } from './ui-mocks/AIMock';
import { DashboardMock } from './ui-mocks/DashboardMock';
import { BrainCircuit, Sparkles, Network } from 'lucide-react';
import { ambientBackgroundVariants } from '@/utils/animations';
import { Container } from '@/components/ui';

export const AISection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="intelligence-title" className="bg-gray-50 dark:bg-[#0A100D] py-20 relative overflow-hidden text-gray-900 dark:text-white transition-colors duration-300 sm:py-24 lg:py-28">
      {/* Dynamic Background Network */}
      <motion.div 
        variants={ambientBackgroundVariants}
        animate={prefersReducedMotion ? undefined : 'animate'}
        className="absolute inset-0 z-0 opacity-20"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </motion.div>

      <Container className="relative z-10 flex flex-col lg:flex-row-reverse items-center gap-16">
        
        {/* Text Content */}
        <motion.div 
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1"
        >
          <span className="text-purple-600 dark:text-purple-400 font-semibold tracking-wider uppercase text-sm mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Intelligence Layer
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900 dark:text-white leading-tight">
            Intelligence built into the experience.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Farmket uses AI-assisted discovery to help buyers find relevant produce listings and make more informed sourcing decisions.
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Network className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Relevant discovery</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Find listings that better fit what buyers are looking for.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Useful product details</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Compare listings with clearer information in one place.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cinematic UI Presentation */}
        <div className="flex-1 w-full flex justify-center perspective-1000 relative h-[600px] items-center">
          
          {/* Background UI Context (Dashboard) */}
          <motion.div 
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 0.35, scale: 0.9 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="absolute z-10 w-full flex justify-center blur-[2px] grayscale-[0.5]"
          >
            <div>
              <DashboardMock className="border-purple-500/20" />
            </div>
          </motion.div>

          {/* Foreground AI Widget */}
          <motion.div 
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.1 }}
            className="absolute z-20 w-full flex justify-center"
          >
            <div className="relative">
              {/* Connecting glowing line from background to foreground */}
              <svg aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-2 h-32 -z-10 text-purple-500/50">
              <line x1="1" y1="0" x2="1" y2="128" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
              
              <AIMock className="shadow-[0_0_100px_rgba(139,92,246,0.3)] ring-1 ring-purple-500/50" />
              
              {/* Ambient Glow */}
              <div className="absolute -inset-10 bg-purple-500/20 blur-3xl rounded-full -z-10 opacity-70"></div>
            </div>
          </motion.div>

        </div>

      </Container>
    </section>
  );
};
