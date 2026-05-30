import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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
    <section className="w-full bg-[#FAFAF8] dark:bg-[#050505] py-24 lg:py-32 border-b border-gray-100 dark:border-gray-900">
      <div className="mx-auto max-w-[800px] px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Everything you need to know about the platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm"
            >
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-bold text-gray-900 dark:text-white text-lg">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
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
