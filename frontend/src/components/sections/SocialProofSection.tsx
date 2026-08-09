import { motion } from 'framer-motion';

const stats = [
  { label: 'Verified Farmers', value: '15,000+', suffix: '' },
  { label: 'Active Buyers', value: '45,000+', suffix: '' },
  { label: 'Successful Orders', value: '2.5', suffix: 'M+' },
  { label: 'Cities Covered', value: '120+', suffix: '' }
];

const partners = [
  "AgriTech India", "Kisan Connect", "FarmFresh", "GreenHarvest", "EcoFoods", "AgroTrade", "BharatFarms", "NatureBasket"
];

export const SocialProofSection = () => {
  return (
    <section className="w-full bg-surface border-y border-border-subtle py-12 md:py-16 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center mb-10">
          <p className="text-sm font-semibold text-foreground-secondary uppercase tracking-widest text-center mb-8">
            Trusted by the agricultural community across India
          </p>
          
          {/* Infinite Marquee */}
          <div className="w-full max-w-5xl mx-auto overflow-hidden relative mask-image-fade">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent z-10" />
            
            <motion.div 
              className="flex whitespace-nowrap gap-12 lg:gap-24 items-center py-4"
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              {[...partners, ...partners].map((partner, idx) => (
                <div key={idx} className="flex-shrink-0 text-2xl font-display font-bold text-border-strong tracking-tight hover:text-foreground-secondary transition-colors duration-300">
                  {partner}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mt-20 border-t border-border-subtle pt-16">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight mb-2 flex items-baseline">
                {stat.value}
                <span className="text-2xl text-brand">{stat.suffix}</span>
              </div>
              <p className="text-sm font-medium text-foreground-secondary">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
