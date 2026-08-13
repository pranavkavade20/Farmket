import { motion } from 'framer-motion';
import { Filter, Eye, Heart, Download } from 'lucide-react';
import { floatingVariants, floatingSlightVariants } from '@/utils/animations';
import { Container } from '@/components/ui';

export const RecommendationSection = () => {
  return (
    <section className="bg-background py-32 relative overflow-hidden min-h-[120vh]">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-20"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">How recommendations work.</h2>
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
          We synthesize thousands of data points in real-time to curate the perfect feed for every buyer.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto relative h-[800px] flex items-center justify-center mt-20">
        
        {/* Input Data Nodes (Left Side) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-12 z-10 w-full md:w-auto px-6 md:px-0 md:-ml-12">
          {[
            { icon: Filter, label: "Search History", color: "bg-blue-500/20 text-blue-500", y: -100 },
            { icon: Eye, label: "Product Views", color: "bg-orange-500/20 text-orange-500", y: 0 },
            { icon: Heart, label: "Saved Items", color: "bg-pink-500/20 text-pink-500", y: 100 }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                variants={floatingSlightVariants} 
                animate="animate" 
                style={{ animationDelay: `${i * 0.5}s` }}
                className="flex items-center gap-4 bg-surface/80 backdrop-blur-sm p-4 rounded-xl border border-border-subtle shadow-sm w-48 relative"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
                
                {/* Connector dot */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-border-strong rounded-full"></div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Central AI Engine */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 0 0 rgba(2, 143, 75, 0)", "0 0 0 30px rgba(2, 143, 75, 0.1)", "0 0 0 0 rgba(2, 143, 75, 0)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 bg-surface rounded-3xl border-2 border-brand flex items-center justify-center shadow-lg relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-brand/5"></div>
             <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border border-dashed border-brand/50"
             />
             <div className="absolute font-bold text-brand tracking-widest text-sm">ENGINE</div>
          </motion.div>
        </div>

        {/* Connector Lines (Desktop) */}
        <svg className="absolute inset-0 w-full h-full z-0 hidden md:block" style={{ pointerEvents: 'none' }}>
          {/* Incoming Lines */}
          <path d="M 200 300 Q 350 300 512 400" stroke="var(--color-border-strong)" strokeWidth="2" fill="none" />
          <path d="M 200 400 Q 350 400 512 400" stroke="var(--color-border-strong)" strokeWidth="2" fill="none" />
          <path d="M 200 500 Q 350 500 512 400" stroke="var(--color-border-strong)" strokeWidth="2" fill="none" />
          
          {/* Animated Flow Incoming */}
          <motion.path 
            d="M 200 300 Q 350 300 512 400" 
            stroke="var(--semantic-info)" strokeWidth="3" fill="none" strokeDasharray="1000" 
            animate={{ strokeDashoffset: [1000, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path 
            d="M 200 400 Q 350 400 512 400" 
            stroke="var(--accent-orange)" strokeWidth="3" fill="none" strokeDasharray="1000" 
            animate={{ strokeDashoffset: [1000, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.5 }}
          />
          <motion.path 
            d="M 200 500 Q 350 500 512 400" 
            stroke="#EC4899" strokeWidth="3" fill="none" strokeDasharray="1000" 
            animate={{ strokeDashoffset: [1000, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
          />

          {/* Outgoing Line */}
          <path d="M 512 400 Q 650 400 800 400" stroke="var(--color-border-strong)" strokeWidth="2" fill="none" />
          {/* Animated Flow Outgoing */}
          <motion.path 
            d="M 512 400 Q 650 400 800 400" 
            stroke="var(--brand-primary)" strokeWidth="4" fill="none" strokeDasharray="1000" 
            animate={{ strokeDashoffset: [1000, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
          />
        </svg>

        {/* Output Result (Right Side) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.6 }}
           >
             <motion.div 
               variants={floatingVariants}
               animate="animate"
               className="bg-surface rounded-2xl border border-border-strong shadow-xl p-4 w-72"
             >
               <div className="w-full h-40 bg-background rounded-xl border border-border-subtle mb-4 flex items-center justify-center overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop" alt="Premium Potatoes" className="w-full h-full object-cover" />
                 <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-brand text-xs font-bold px-2 py-1 rounded">98% Match</div>
               </div>
               <h4 className="font-bold mb-1">Premium Russet Potatoes</h4>
               <p className="text-xs text-muted mb-4">Harvested 2 days ago • 15 miles away</p>
               <div className="w-full bg-brand text-white py-2 rounded-lg text-center text-sm font-medium flex justify-center items-center gap-2">
                 <Download className="w-4 h-4" /> Add to Order
               </div>
             </motion.div>
           </motion.div>
        </div>

        {/* Mobile representation of result */}
        <div className="absolute bottom-0 w-full px-6 flex justify-center md:hidden">
           <motion.div 
             initial={{ opacity: 0, y: 24 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
             className="bg-surface w-full rounded-2xl border border-border-strong shadow-xl p-4 max-w-sm"
           >
             <div className="text-center text-sm font-bold text-brand mb-4">AI Recommended Result</div>
             <div className="w-full h-32 bg-muted/20 rounded-xl mb-3"></div>
             <div className="w-2/3 h-4 bg-muted/30 rounded mb-2"></div>
             <div className="w-1/2 h-3 bg-muted/20 rounded mb-4"></div>
             <div className="w-full h-10 bg-brand/20 rounded-lg"></div>
           </motion.div>
        </div>

        </div>

      </Container>
    </section>
  );
};
