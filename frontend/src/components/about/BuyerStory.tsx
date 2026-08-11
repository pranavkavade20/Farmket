import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SearchInterfaceMock } from './ui-mocks/SearchInterfaceMock';
import { ProductCardMock } from './ui-mocks/ProductCardMock';
import { Search, Sparkles, ShieldCheck } from 'lucide-react';

export const BuyerStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const searchY = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const searchScale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  const productsOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const productsY = useTransform(scrollYProgress, [0.4, 0.6], [50, 0]);

  return (
    <section ref={containerRef} className="bg-surface py-32 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex-1 max-w-xl"
          >
            <span className="text-blue-500 font-semibold tracking-wider uppercase text-sm mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> The Buyer Experience
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
              Sourcing made incredibly simple.
            </h2>
            <p className="text-lg text-foreground-secondary mb-8 leading-relaxed">
              Buyers type what they need in plain English. Our AI parses the request, filters by quality, location, and price, and instantly presents the best farm-direct options.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Intelligent Search</h4>
                  <p className="text-foreground-secondary text-sm">Semantic understanding of complex sourcing requirements.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Quality Guaranteed</h4>
                  <p className="text-foreground-secondary text-sm">Every suggested product passes automated quality scoring.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cinematic UI Presentation */}
          <div className="flex-1 w-full relative h-[600px] flex items-center justify-center perspective-1000">
            <motion.div
              style={{ y: searchY, scale: searchScale }}
              className="absolute z-20 w-full flex justify-center -top-10"
            >
              <SearchInterfaceMock className="shadow-2xl ring-1 ring-black/5" />
            </motion.div>

            {/* Emerging Product Result */}
            <motion.div
              style={{ opacity: productsOpacity, y: productsY }}
              className="absolute z-30 w-full flex justify-center top-64"
            >
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-brand/50 to-transparent"></div>
                <ProductCardMock className="shadow-2xl ring-2 ring-brand/50 rotate-y-[-5deg] rotate-x-[5deg] scale-110" />

                {/* Highlight Glow */}
                <div className="absolute -inset-4 bg-brand/20 blur-2xl -z-10 rounded-full opacity-50"></div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
