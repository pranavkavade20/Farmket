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
    <section id="success-stories" className="w-full bg-[#FAFAF8] dark:bg-[#050505] py-24 lg:py-32 border-b border-gray-100 dark:border-gray-900">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 mb-6"
          >
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Success Stories</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            Don't just take our word for it.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] p-8 border border-gray-200 dark:border-gray-800 shadow-xl relative group hover:-translate-y-2 transition-transform duration-300"
            >
              <Quote className="absolute top-8 right-8 w-10 h-10 text-gray-100 dark:text-gray-800 transition-colors group-hover:text-green-50 dark:group-hover:text-green-900/20" />
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-2xl">
                  {t.image}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.location} • {t.type}</p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8 relative z-10">
                "{t.quote}"
              </p>
              
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
                <span className="inline-block bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold px-4 py-2 rounded-full">
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
