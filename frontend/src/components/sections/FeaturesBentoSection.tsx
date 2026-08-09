import { motion } from 'framer-motion';
import { 
  MapPin, 
  LineChart, 
  Globe, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

export const FeaturesBentoSection = () => {
  return (
    <section id="features" className="relative w-full bg-background py-24 lg:py-32 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-strong mb-6 shadow-sm bg-background"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-widest">Platform Features</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2.25rem,4vw,3.5rem)] font-display font-black text-foreground tracking-tight mb-6 leading-tight"
          >
            Everything you need to <span className="text-brand">scale.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-foreground-secondary font-medium leading-relaxed max-w-2xl"
          >
            Enterprise-grade tools built specifically for modern agricultural commerce. Powerful, reliable, and incredibly easy to use.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[320px]">
          
          {/* Feature 1 (Large Span) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-2 row-span-2 bg-background border border-border-subtle rounded-3xl p-8 relative overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-surface border border-border-strong flex items-center justify-center shadow-sm mb-6 group-hover:scale-105 transition-transform duration-300">
                <LineChart className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Real-time Demand Forecasting</h3>
              <p className="text-foreground-secondary font-medium text-base max-w-md leading-relaxed">
                Understand exactly what crops to plant and when. Our intelligence engine analyzes market trends to guarantee you the best possible price at harvest.
              </p>
              
              {/* Mock UI inserted at the bottom */}
              <div className="mt-auto pt-8 w-full flex-1 flex flex-col justify-end relative">
                <div className="w-full h-48 bg-surface rounded-t-2xl border border-b-0 border-border-strong p-6 relative overflow-hidden shadow-sm">
                   <div className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-between px-6 gap-2">
                      {[40, 70, 45, 90, 65, 80, 100, 60, 85].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05, duration: 0.8, type: "spring", stiffness: 100 }}
                          className={`w-full rounded-t-sm relative overflow-hidden ${i === 6 ? 'bg-brand' : 'bg-border-strong'}`}
                        />
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 lg:col-span-2 bg-background border border-border-subtle rounded-3xl p-8 relative overflow-hidden group hover:shadow-md transition-all duration-300"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border-strong flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <MapPin className="w-5 h-5 text-foreground" />
                </div>
                <span className="bg-surface text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border-strong shadow-sm flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                  </span>
                  Live Tracking
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Farm to Doorstep Tracking</h3>
              <p className="text-foreground-secondary text-sm font-medium leading-relaxed max-w-sm">
                Watch your produce travel from the farm directly to your location with precise tracking and real-time updates.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 lg:col-span-1 bg-background border border-border-subtle rounded-3xl p-8 group hover:shadow-md transition-all duration-300 flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-surface border border-border-strong flex items-center justify-center shadow-sm mb-6 group-hover:scale-105 transition-transform duration-300">
              <Globe className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Localized Access</h3>
            <p className="text-foreground-secondary text-sm font-medium leading-relaxed">
              Available in 12+ regional languages to ensure accessibility for every farmer across the country.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 lg:col-span-1 bg-foreground text-background rounded-3xl p-8 border border-transparent group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-background/10 border border-background/20 flex items-center justify-center shadow-sm mb-6 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-background" />
            </div>
            <h3 className="text-lg font-bold mb-2">100% Secured</h3>
            <p className="text-background/80 text-sm font-medium leading-relaxed">
              Bank-grade security for all payments. Instant settlements directly to farmer accounts with zero hidden fees.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
