import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AIMock } from './ui-mocks/AIMock';
import { DashboardMock } from './ui-mocks/DashboardMock';
import { BrainCircuit, Sparkles, Network } from 'lucide-react';

export const AISection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const dashboardScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);
  const dashboardOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.4, 0.4, 0]);
  
  const aiY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const aiScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);
  const aiOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="bg-gray-50 dark:bg-[#0A100D] py-32 relative overflow-hidden text-gray-900 dark:text-white transition-colors duration-300">
      {/* Dynamic Background Network */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row-reverse items-center gap-16">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <span className="text-purple-600 dark:text-purple-400 font-semibold tracking-wider uppercase text-sm mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Intelligence Layer
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900 dark:text-white leading-tight">
            Intelligence built into the experience.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Farmket's AI doesn't just process data; it actively anticipates needs. Seamlessly embedded within the UI, it analyzes market trends and user behavior to create a self-optimizing ecosystem.
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Network className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Dynamic Neural Matching</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Continuously learning algorithms pair supply with demand perfectly.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Predictive Insights</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Actionable intelligence delivered directly where decisions are made.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cinematic UI Presentation */}
        <div className="flex-1 w-full flex justify-center perspective-1000 relative h-[600px] items-center">
          
          {/* Background UI Context (Dashboard) */}
          <motion.div 
            style={{ y: dashboardY, scale: dashboardScale, opacity: dashboardOpacity }}
            className="absolute z-10 w-full flex justify-center scale-90 blur-[2px] grayscale-[0.5]"
          >
            <DashboardMock className="border-purple-500/20" />
          </motion.div>

          {/* Foreground AI Widget */}
          <motion.div 
            style={{ y: aiY, scale: aiScale, opacity: aiOpacity }}
            className="absolute z-20 w-full flex justify-center"
          >
            <div className="relative">
              {/* Connecting glowing line from background to foreground */}
              <svg className="absolute -top-32 left-1/2 -translate-x-1/2 w-2 h-32 -z-10 text-purple-500/50">
                <line x1="1" y1="0" x2="1" y2="128" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
              </svg>
              
              <AIMock className="shadow-[0_0_100px_rgba(139,92,246,0.3)] ring-1 ring-purple-500/50" />
              
              {/* Ambient Glow */}
              <div className="absolute -inset-10 bg-purple-500/20 blur-3xl rounded-full -z-10 opacity-70"></div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
