import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    type: "Farmer",
    name: "Ramesh Patel",
    location: "Gujarat, India",
    quote: "Since joining Farmket, my income has doubled. I no longer have to beg middlemen for fair prices. I set my rate, and buyers come to me directly.",
    stats: "+120% Revenue",
    image: "👨🏽‍🌾"
  },
  {
    type: "Buyer",
    name: "Fresh Foods Inc.",
    location: "Mumbai, India",
    quote: "The quality and freshness we get through Farmket is unmatched. We track our tomatoes from the moment they are harvested to our kitchen door.",
    stats: "30% Cost Saved",
    image: "🏢"
  },
  {
    type: "Farmer",
    name: "Anjali Devi",
    location: "Punjab, India",
    quote: "The payment is instant. I used to wait weeks to get paid by agents. Now, the moment my wheat is delivered, the money is in my bank account.",
    stats: "0 Payment Delays",
    image: "👩🏽‍🌾"
  }
];

export const SuccessStoriesSection = () => {
  return (
    <section id="success-stories" className="relative w-full bg-surface py-24 lg:py-32 border-b border-border-subtle overflow-hidden">
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-strong mb-6 shadow-sm bg-background"
          >
            <Star className="w-3.5 h-3.5 text-accent-yellow fill-current" />
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-widest">Success Stories</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(2.25rem,4vw,3.5rem)] font-display font-black text-foreground tracking-tight mb-6 leading-tight"
          >
            Don't just take our <span className="text-accent-yellow">word for it.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-background rounded-3xl p-8 lg:p-10 border border-border-subtle relative group hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <Quote className="absolute top-8 right-8 w-10 h-10 text-border-strong transition-colors duration-300 group-hover:text-brand/20" />
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-border-strong flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {t.image}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">{t.name}</h4>
                  <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">{t.location} • {t.type}</p>
                </div>
              </div>
              
              <p className="text-foreground-secondary font-medium text-base leading-relaxed mb-10 relative z-10 flex-1">
                "{t.quote}"
              </p>
              
              <div className="pt-6 border-t border-border-subtle mt-auto relative z-10">
                <span className="inline-flex items-center bg-surface border border-border-strong text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  {t.stats}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
