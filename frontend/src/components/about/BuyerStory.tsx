import { motion, useReducedMotion } from 'framer-motion';
import { SearchInterfaceMock } from './ui-mocks/SearchInterfaceMock';
import { ProductCardMock } from './ui-mocks/ProductCardMock';
import { Search, Sparkles, ShieldCheck } from 'lucide-react';
import { ambientBackgroundVariants } from '@/utils/animations';
import { Container } from '@/components/ui';

export const BuyerStory = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="buyer-story-title" className="bg-surface py-20 relative overflow-hidden sm:py-24 lg:py-28">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          variants={ambientBackgroundVariants}
          animate={prefersReducedMotion ? undefined : 'animate'}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" 
        />
        <motion.div 
          variants={ambientBackgroundVariants}
          animate={prefersReducedMotion ? undefined : 'animate'}
          style={{ animationDelay: '2s' }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" 
        />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Text Content */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 max-w-xl"
          >
            <span className="text-blue-500 font-semibold tracking-wider uppercase text-sm mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> The Buyer Experience
            </span>
            <h2 id="buyer-story-title" className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight">
              Find the produce you need.
            </h2>
            <p className="text-base sm:text-lg text-foreground-secondary mb-8 leading-relaxed">
              Search Farmket for fresh listings, compare useful details, and connect with farmers directly—without the extra steps.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Clear product listings</h4>
                  <p className="text-foreground-secondary text-sm">Review availability, price, and source details together.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Connect with growers</h4>
                  <p className="text-foreground-secondary text-sm">Choose an option that fits and reach the farmer directly.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cinematic UI Presentation */}
          <div className="relative grid w-full flex-1 items-center gap-5 perspective-1000 md:min-h-[520px] md:grid-cols-1">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.1 }}
              className="relative z-20 flex w-full justify-center md:absolute md:-top-4"
            >
              <SearchInterfaceMock className="w-full max-w-xl shadow-xl ring-1 ring-black/5" />
            </motion.div>

            {/* Emerging Product Result */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.15 }}
              className="relative z-30 flex w-full justify-center md:absolute md:top-56"
            >
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute -top-8 left-1/2 hidden h-8 w-px -translate-x-1/2 bg-gradient-to-b from-brand/50 to-transparent md:block"></div>
                <ProductCardMock className="shadow-xl ring-2 ring-brand/40 md:rotate-y-[-3deg] md:rotate-x-[3deg]" />

                {/* Highlight Glow */}
                <div className="absolute -inset-4 bg-brand/20 blur-2xl -z-10 rounded-full opacity-50"></div>
              </div>
            </motion.div>
          </div>

        </div>
      </Container>
    </section>
  );
};
