import React from 'react';
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
    <section id="success-stories" className="relative w-full bg-[#FAFAF8] dark:bg-[#050505] py-24 lg:py-32 border-b border-gray-100 dark:border-white/5 overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-brand-400/10 dark:bg-brand-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-yellow-400/10 dark:bg-yellow-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-200/50 dark:border-yellow-900/30 mb-6 shadow-sm"
          >
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">Success Stories</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            Don't just take our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-brand-500">word for it.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6, ease: "easeOut" }}
              className="glass-card rounded-[2rem] p-8 lg:p-10 border border-gray-200 dark:border-white/5 relative group hover:-translate-y-2 hover:shadow-2xl hover:border-brand-500/20 transition-all duration-500"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-gray-100 dark:text-white/5 transition-colors duration-500 group-hover:text-brand-50 dark:group-hover:text-brand-900/20" />
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                  {t.image}
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.location} • {t.type}</p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg leading-relaxed mb-10 relative z-10 italic">
                "{t.quote}"
              </p>
              
              <div className="pt-6 border-t border-gray-100 dark:border-white/5 mt-auto relative z-10">
                <span className="inline-block bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-bold px-4 py-2 rounded-xl shadow-sm">
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
