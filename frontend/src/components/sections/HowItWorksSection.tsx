import { motion } from 'framer-motion';
import { UserPlus, PlusCircle, Sprout, Truck,  Search, CreditCard, ShoppingBag, MapPin } from 'lucide-react';

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
    <section id="how-it-works" className="relative w-full bg-background py-20 lg:py-32 border-b border-border-subtle overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-brand/5 dark:bg-brand/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-foreground tracking-tight mb-4 sm:mb-6"
          >
            How Farmket <span className="text-brand">Works</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-lg md:text-xl text-foreground-secondary font-medium leading-relaxed"
          >
            A frictionless ecosystem designed for maximum efficiency, whether you are growing the food or buying it.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative">
          
          {/* Subtle divider between columns on desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border-subtle -translate-x-1/2" />

          {/* Farmer Journey */}
          <div className="relative">
            <div className="flex items-center gap-3.5 mb-8 sm:mb-12">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-2xl border border-brand/20 shadow-xs">👨🏽‍🌾</div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">For Farmers</h3>
            </div>
            
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[23px] sm:left-[27px] top-6 bottom-6 w-0.5 bg-border-subtle rounded-full overflow-hidden">
                <motion.div 
                  className="w-full h-1/3 bg-gradient-to-b from-transparent via-brand to-transparent"
                  animate={{ y: ["-100%", "300%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {farmerSteps.map((step, idx) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="relative flex gap-3.5 sm:gap-6 group"
                  >
                    <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface border-2 border-brand/30 flex items-center justify-center shrink-0 shadow-xs group-hover:border-brand transition-colors duration-300">
                      <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 rounded-2xl bg-surface border border-border-subtle p-4 sm:p-5 group-hover:-translate-y-0.5 hover:border-brand/40 transition-all duration-300 shadow-xs">
                      <h4 className="text-base sm:text-xl font-bold text-foreground mb-1">{step.title}</h4>
                      <p className="text-xs sm:text-base font-medium text-foreground-secondary">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Buyer Journey */}
          <div className="relative">
            <div className="flex items-center gap-3.5 mb-8 sm:mb-12">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-2xl border border-amber-500/20 shadow-xs">👩🏻‍🦰</div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">For Buyers</h3>
            </div>
            
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[23px] sm:left-[27px] top-6 bottom-6 w-0.5 bg-border-subtle rounded-full overflow-hidden">
                <motion.div 
                  className="w-full h-1/3 bg-gradient-to-b from-transparent via-amber-500 to-transparent"
                  animate={{ y: ["-100%", "300%"] }}
                  transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {buyerSteps.map((step, idx) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="relative flex gap-3.5 sm:gap-6 group"
                  >
                    <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface border-2 border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs group-hover:border-amber-500 transition-colors duration-300">
                      <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 rounded-2xl bg-surface border border-border-subtle p-4 sm:p-5 group-hover:-translate-y-0.5 hover:border-amber-500/40 transition-all duration-300 shadow-xs">
                      <h4 className="text-base sm:text-xl font-bold text-foreground mb-1">{step.title}</h4>
                      <p className="text-xs sm:text-base font-medium text-foreground-secondary">{step.desc}</p>
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
