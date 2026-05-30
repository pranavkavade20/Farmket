import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  LineChart, 
  Globe, 
  ShieldCheck, 
  Smartphone 
} from 'lucide-react';

export const FeaturesBentoSection = () => {
  return (
    <section id="features" className="w-full bg-white dark:bg-[#0A0A0A] py-24 lg:py-32 border-b border-gray-100 dark:border-gray-900">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            Everything you need to scale.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 font-medium"
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
            className="md:col-span-2 lg:col-span-2 row-span-2 bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-2xl hover:shadow-[#168748]/10 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/10 dark:bg-green-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                <LineChart className="w-6 h-6 text-[#168748]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Real-time Demand Forecasting</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium max-w-sm">
                Understand exactly what crops to plant and when. Our AI analyzes market trends to guarantee you the best possible price at harvest.
              </p>
              
              {/* Mock UI inserted at the bottom */}
              <div className="mt-auto pt-8 w-full">
                <div className="w-full h-32 bg-white dark:bg-[#050505] rounded-t-2xl border border-b-0 border-gray-200 dark:border-gray-700 shadow-inner p-4 relative overflow-hidden">
                   <div className="absolute bottom-0 left-0 w-full h-24 flex items-end justify-between px-2 gap-2 opacity-50 dark:opacity-80">
                      {[40, 70, 45, 90, 65, 80, 100, 60, 85].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 0.8 }}
                          className={`w-full rounded-t-sm ${i === 6 ? 'bg-[#168748]' : 'bg-gray-200 dark:bg-gray-700'}`}
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
            className="md:col-span-1 lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full">Live Tracking</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Farm to Doorstep Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Watch your produce travel from the farm directly to your location with GPS precision.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 lg:col-span-1 bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 group hover:shadow-xl transition-all duration-500"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Multi-Language</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Available in 12+ regional languages to ensure accessibility for every farmer.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 lg:col-span-1 bg-[#168748] dark:bg-[#116936] rounded-3xl p-8 border border-transparent group hover:shadow-xl hover:shadow-[#168748]/30 transition-all duration-500"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-6">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">100% Secured</h3>
            <p className="text-green-50 text-sm font-medium">
              Bank-grade security for all payments. Instant settlements directly to farmer accounts.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
