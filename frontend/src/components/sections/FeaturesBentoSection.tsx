import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  LineChart, 
  Globe, 
  ShieldCheck, 
  Smartphone,
  Sparkles
} from 'lucide-react';

export const FeaturesBentoSection = () => {
  return (
    <section id="features" className="relative w-full bg-white dark:bg-[#050505] py-24 lg:py-32 border-b border-gray-100 dark:border-white/5 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-400/10 dark:bg-brand-500/10 blur-[150px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-400/5 dark:bg-orange-500/5 blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-200/50 dark:border-brand-900/30 mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">Platform Features</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent">scale.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium"
          >
            Enterprise-grade tools built specifically for modern agricultural commerce. Powerful, reliable, and incredibly easy to use.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
          
          {/* Feature 1 (Large Span) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-2 row-span-2 glass-card p-8 relative overflow-hidden group hover:shadow-2xl hover:border-brand-500/30 transition-all duration-500 flex flex-col"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-400/10 dark:bg-brand-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shadow-sm mb-8 border border-brand-100 dark:border-brand-800/30 group-hover:scale-110 transition-transform duration-500">
                <LineChart className="w-7 h-7 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Real-time Demand Forecasting</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg max-w-sm leading-relaxed">
                Understand exactly what crops to plant and when. Our AI analyzes market trends to guarantee you the best possible price at harvest.
              </p>
              
              {/* Mock UI inserted at the bottom */}
              <div className="mt-auto pt-8 w-full flex-1 flex flex-col justify-end relative">
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white dark:from-[#0d0d0d] to-transparent z-10" />
                <div className="w-full h-48 bg-gray-50/50 dark:bg-[#111]/50 backdrop-blur-sm rounded-t-3xl border border-b-0 border-gray-200 dark:border-white/5 p-6 relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                   <div className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-between px-6 gap-3 opacity-60 dark:opacity-80">
                      {[40, 70, 45, 90, 65, 80, 100, 60, 85].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 1, type: "spring" }}
                          className={`w-full rounded-t-md relative overflow-hidden ${i === 6 ? 'bg-gradient-to-t from-brand-600 to-brand-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] z-10' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                          {i === 6 && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                        </motion.div>
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
            className="md:col-span-1 lg:col-span-2 glass-card p-8 relative overflow-hidden group hover:shadow-2xl hover:border-accent/30 transition-all duration-500"
          >
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shadow-sm border border-orange-100 dark:border-orange-800/30 group-hover:scale-110 transition-transform duration-500">
                  <MapPin className="w-7 h-7 text-accent" />
                </div>
                <span className="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full border border-orange-100 dark:border-orange-800/30 shadow-sm flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Live Tracking
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Farm to Doorstep Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-relaxed max-w-sm">
                Watch your produce travel from the farm directly to your location with real-time GPS precision and estimated arrival times.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 lg:col-span-1 glass-card p-8 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-colors duration-500"></div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800/30 group-hover:scale-110 transition-transform duration-500">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Multi-Language</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed">
              Available in 12+ regional languages to ensure maximum accessibility for every farmer across the country.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-brand-600 to-brand-500 rounded-3xl p-8 border border-transparent group hover:shadow-2xl hover:shadow-brand-500/30 hover:-translate-y-1 transition-all duration-500 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgyNHYyNEgwem0xIDF2MjJoMjJWMXptMSAxaDIwdjIwSDJ6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-50" />
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 relative z-10">100% Secured</h3>
            <p className="text-green-50 text-sm font-medium leading-relaxed relative z-10">
              Bank-grade security for all payments. Instant settlements directly to farmer accounts with zero hidden fees.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
