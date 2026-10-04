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
    <section id="success-stories" className="relative w-full bg-surface py-24 lg:py-32 border-b border-border-subtle overflow-hidden font-sans transition-colors duration-300">

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Star className="w-4 h-4 text-accent-yellow fill-current" />
            <span className="text-xs font-bold text-foreground-secondary uppercase tracking-[0.2em]">
              Success Stories
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-foreground tracking-tighter mb-6 leading-[1.1] transition-colors duration-300"
          >
            Don't just take our <span className="text-accent-yellow">word for it.</span>
          </motion.h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2 + (idx * 0.1), duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-background rounded-2xl p-8 lg:p-10 border border-border-subtle relative flex flex-col transition-colors duration-300"
            >
              {/* Static structural background icon */}
              <Quote className="absolute top-8 right-8 w-10 h-10 text-border-subtle opacity-50" />

              {/* Profile Block */}
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-2xl transition-colors duration-300">
                  {t.image}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground transition-colors duration-300">
                    {t.name}
                  </h4>
                  <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mt-0.5 transition-colors duration-300">
                    {t.location} • {t.type}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <p className="text-foreground-secondary font-medium text-base leading-relaxed mb-10 relative z-10 flex-1 transition-colors duration-300">
                "{t.quote}"
              </p>

              {/* Stat Badge */}
              <div className="pt-6 border-t border-border-subtle mt-auto relative z-10 transition-colors duration-300">
                <div className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand" />
                  <span className="text-foreground text-sm font-bold tracking-tight transition-colors duration-300">
                    {t.stats}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};