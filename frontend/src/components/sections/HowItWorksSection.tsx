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
    <section id="how-it-works" className="w-full bg-[#FAFAF8] dark:bg-[#050505] py-24 lg:py-32 border-b border-gray-100 dark:border-gray-900 overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            How Farmket Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 font-medium"
          >
            A frictionless ecosystem designed for maximum efficiency, whether you are growing the food or buying it.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Farmer Journey */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-xl">👨🏽‍🌾</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">For Farmers</h3>
            </div>
            
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800" />
              
              <div className="space-y-10">
                {farmerSteps.map((step, idx) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative flex gap-6"
                  >
                    <div className="relative z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-2 border-green-500 flex items-center justify-center shrink-0 shadow-sm">
                      <step.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="pt-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{step.title}</h4>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Buyer Journey */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-xl">👩🏻‍🦰</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">For Buyers</h3>
            </div>
            
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800" />
              
              <div className="space-y-10">
                {buyerSteps.map((step, idx) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative flex gap-6"
                  >
                    <div className="relative z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-2 border-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                      <step.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="pt-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{step.title}</h4>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{step.desc}</p>
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
