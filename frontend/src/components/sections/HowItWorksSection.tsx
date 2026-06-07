import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, PlusCircle, Sprout, Truck, Store, Search, CreditCard, ShoppingBag, MapPin } from 'lucide-react';

const farmerSteps = [
  { id: 1, icon: UserPlus, title: "Register Profile", desc: "Create a verified farmer account." },
  { id: 2, icon: PlusCircle, title: "List Produce", desc: "Add current or upcoming crops." },
  { id: 3, icon: Sprout, title: "Update Growth", desc: "Share real-time crop health." },
  { id: 4, icon: Truck, title: "Dispatch", desc: "Send produce directly to buyer." }
];

const buyerSteps = [
  { id: 1, icon: Search, title: "Discover", desc: "Browse local organic farms." },
  { id: 2, icon: CreditCard, title: "Purchase", desc: "Securely lock in your order." },
  { id: 3, icon: MapPin, title: "Track", desc: "Follow delivery live." },
  { id: 4, icon: ShoppingBag, title: "Receive", desc: "Get farm-fresh produce." }
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative w-full bg-white dark:bg-[#050505] py-24 lg:py-32 border-b border-gray-100 dark:border-white/5 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-brand-50/50 dark:bg-brand-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            How Farmket <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Works</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium"
          >
            A frictionless ecosystem designed for maximum efficiency, whether you are growing the food or buying it.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative">
          
          {/* Subtle divider between columns on desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-white/10 to-transparent -translate-x-1/2" />

          {/* Farmer Journey */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-2xl border border-brand-100 dark:border-brand-800/30 shadow-sm">👨🏽‍🌾</div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">For Farmers</h3>
            </div>
            
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden">
                <motion.div 
                  className="w-full h-1/3 bg-gradient-to-b from-transparent via-brand-500 to-transparent"
                  animate={{ y: ["-100%", "300%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="space-y-6">
                {farmerSteps.map((step, idx) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
                    className="relative flex gap-6 group"
                  >
                    <div className="relative z-10 w-14 h-14 rounded-full bg-white dark:bg-[#111] border-2 border-brand-100 dark:border-brand-900/50 flex items-center justify-center shrink-0 shadow-sm group-hover:border-brand-400 dark:group-hover:border-brand-500 transition-colors duration-300">
                      <step.icon className="w-6 h-6 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 glass-card p-5 group-hover:-translate-y-1 transition-all duration-300">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                      <p className="text-base font-medium text-gray-500 dark:text-gray-400">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Buyer Journey */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-2xl border border-orange-100 dark:border-orange-800/30 shadow-sm">👩🏻‍🦰</div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">For Buyers</h3>
            </div>
            
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden">
                <motion.div 
                  className="w-full h-1/3 bg-gradient-to-b from-transparent via-accent to-transparent"
                  animate={{ y: ["-100%", "300%"] }}
                  transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="space-y-6">
                {buyerSteps.map((step, idx) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
                    className="relative flex gap-6 group"
                  >
                    <div className="relative z-10 w-14 h-14 rounded-full bg-white dark:bg-[#111] border-2 border-orange-100 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-sm group-hover:border-accent dark:group-hover:border-accent transition-colors duration-300">
                      <step.icon className="w-6 h-6 text-accent dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 glass-card p-5 group-hover:-translate-y-1 transition-all duration-300">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                      <p className="text-base font-medium text-gray-500 dark:text-gray-400">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
