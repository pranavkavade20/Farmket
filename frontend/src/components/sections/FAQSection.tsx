import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: "How does Farmket verify farmers?",
    a: "Every farmer undergoes a comprehensive onboarding process. This includes verifying their government IDs, land ownership documents, and often an on-site visit by our local field partners to ensure they are legitimate growers."
  },
  {
    q: "Are there any hidden fees?",
    a: "No. We believe in absolute transparency. Farmket charges a small, flat platform fee per transaction which is clearly shown before you complete any purchase. Farmers pay 0% commission."
  },
  {
    q: "How is logistics and delivery handled?",
    a: "Farmket partners with trusted national and regional logistics providers. Once an order is confirmed, our system automatically dispatches a truck to the farm, and you can track it live until it reaches your doorstep."
  },
  {
    q: "What if the produce quality is not as described?",
    a: "We have a strict quality assurance policy. If the delivered produce does not match the specifications agreed upon, our escrow system pauses the payment, and our support team steps in to resolve the issue or process a refund."
  }
];

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative w-full bg-white dark:bg-[#050505] py-24 lg:py-32 border-b border-gray-100 dark:border-white/5 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[800px] px-6 sm:px-8">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gray-200/50 dark:border-white/10 mb-6 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">Support</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-800 dark:from-gray-400 dark:to-white">Questions</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 font-medium"
          >
            Everything you need to know about the platform.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`glass border rounded-2xl overflow-hidden transition-all duration-300 ${openIdx === idx ? 'border-brand-500/50 dark:border-brand-500/30 shadow-lg shadow-brand-500/5' : 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}
            >
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={`font-bold text-lg transition-colors duration-300 ${openIdx === idx ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>{faq.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${openIdx === idx ? 'bg-brand-50 dark:bg-brand-900/30' : 'bg-gray-100 dark:bg-white/5'}`}>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openIdx === idx ? 'rotate-180 text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
              </button>
              
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 font-medium leading-relaxed text-base">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
