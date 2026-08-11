import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { DashboardMock } from './ui-mocks/DashboardMock';
import { ProductCardMock } from './ui-mocks/ProductCardMock';
import { Sprout, BarChart3, TrendingUp, type LucideIcon } from 'lucide-react';

interface CardData {
  title: string;
  description: string;
  icon: LucideIcon;
  timing: number[];
  opacityMap: number[];
  yMap: number[];
}

const StepTextItem = ({
  card,
  progress
}: {
  card: CardData;
  progress: MotionValue<number>
}) => {
  const opacity = useTransform(progress, card.timing, card.opacityMap, { clamp: true });
  const y = useTransform(progress, card.timing, card.yMap, { clamp: true });

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center transform-gpu"
    >
      <span className="text-brand font-semibold tracking-wider uppercase text-xs md:text-sm mb-2 flex items-center gap-2">
        <card.icon className="w-4 h-4" /> The Farmer Experience
      </span>
      <h2 className="text-3xl md:text-5xl font-display font-bold mb-3 tracking-tight text-foreground drop-shadow-sm">
        {card.title}
      </h2>
      <p className="text-sm md:text-base text-foreground-secondary max-w-lg leading-relaxed drop-shadow-sm">
        {card.description}
      </p>
    </motion.div>
  );
};

export const FarmerStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const progress = scrollYProgress;

  // Scene 1: Dashboard (Phase 1: 0.00 - 0.33)
  const dashboardOpacity = useTransform(progress, [0, 0.05, 0.28, 0.33], [0, 1, 1, 0], { clamp: true });
  const dashboardScale = useTransform(progress, [0, 0.05, 0.28, 0.33], [0.9, 1, 1, 0.95], { clamp: true });
  const dashboardY = useTransform(progress, [0, 0.05, 0.28, 0.33], [30, 0, 0, -30], { clamp: true });

  // Scene 2: Product Card (Phase 2: 0.33 - 0.66)
  const productOpacity = useTransform(progress, [0.33, 0.38, 0.61, 0.66], [0, 1, 1, 0], { clamp: true });
  const productScale = useTransform(progress, [0.33, 0.38, 0.61, 0.66], [0.85, 1, 1, 0.9], { clamp: true });
  const productY = useTransform(progress, [0.33, 0.38, 0.61, 0.66], [30, 0, 0, -30], { clamp: true });

  // Scene 3: Marketplace Context (Phase 3: 0.66 - 1.00)
  const marketplaceOpacity = useTransform(progress, [0.66, 0.71, 0.95, 1.0], [0, 1, 1, 1], { clamp: true });
  const marketplaceScale = useTransform(progress, [0.66, 0.71, 0.95, 1.0], [0.9, 1, 1, 1], { clamp: true });
  const marketplaceY = useTransform(progress, [0.66, 0.71, 0.95, 1.0], [30, 0, 0, 0], { clamp: true });

  const cards: CardData[] = [
    {
      title: "Digital Production",
      description: "Farmers digitize their inventory, crop cycles, and farm data to gain a comprehensive view of their operations directly on the platform.",
      icon: Sprout,
      timing: [0, 0.05, 0.28, 0.33],
      opacityMap: [0, 1, 1, 0],
      yMap: [20, 0, 0, -20]
    },
    {
      title: "Product Generation",
      description: "Create premium listings with automated quality scoring and real-time inventory tracking, ready for the marketplace.",
      icon: BarChart3,
      timing: [0.33, 0.38, 0.61, 0.66],
      opacityMap: [0, 1, 1, 0],
      yMap: [20, 0, 0, -20]
    },
    {
      title: "Direct Marketplace",
      description: "Listings flow seamlessly into the algorithm-driven marketplace, bypassing middlemen and maximizing profit.",
      icon: TrendingUp,
      timing: [0.66, 0.71, 0.95, 1.0],
      opacityMap: [0, 1, 1, 1],
      yMap: [20, 0, 0, 0]
    }
  ];

  return (
    <section className="bg-background relative">
      <div ref={containerRef} className="relative w-full h-[350vh]">
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-start pt-16 md:pt-20">

          {/* Background Ambient Glow */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-brand/10 rounded-full blur-[120px] transform-gpu opacity-20" />
          </div>

          {/* Text Overlay Sequence */}
          <div className="relative w-full max-w-2xl h-36 md:h-40 z-40 pointer-events-none px-6 md:px-12 shrink-0 flex items-center justify-center">
            {cards.map((card, i) => (
              <StepTextItem key={i} card={card} progress={progress} />
            ))}
          </div>

          {/* UI Scenes Stage */}
          <div className="relative w-full flex-1 mt-2 md:mt-4 perspective-1000 flex items-start justify-center">

            {/* Scene 1: Dashboard (z-10) */}
            <motion.div
              style={{
                opacity: dashboardOpacity,
                scale: dashboardScale,
                y: dashboardY,
              }}
              className="absolute z-10 w-full flex justify-center top-0 px-4 md:px-6 transform origin-top scale-[0.75] sm:scale-85 md:scale-95 lg:scale-100 transform-gpu pointer-events-none"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-brand/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <DashboardMock className="rotate-x-6 shadow-2xl border-brand/20 pointer-events-auto" />
              </div>
            </motion.div>

            {/* Scene 2: Product Card (z-20) */}
            <motion.div
              style={{
                opacity: productOpacity,
                scale: productScale,
                y: productY,
              }}
              className="absolute z-20 w-full flex justify-center top-4 md:top-8 px-4 transform origin-top scale-95 md:scale-100 transform-gpu pointer-events-none"
            >
              <div className="relative">
                <div className="absolute -inset-6 bg-brand/20 rounded-3xl blur-2xl"></div>
                <ProductCardMock className="shadow-2xl ring-2 ring-brand/30 relative z-10 pointer-events-auto" />
              </div>
            </motion.div>

            {/* Scene 3: Live Marketplace Grid (z-30) */}
            <motion.div
              style={{
                opacity: marketplaceOpacity,
                scale: marketplaceScale,
                y: marketplaceY,
              }}
              className="absolute z-30 w-full flex justify-center top-0 px-4 md:px-6 transform origin-top scale-[0.75] sm:scale-85 md:scale-95 lg:scale-100 transform-gpu pointer-events-none"
            >
              <div className="w-full max-w-5xl bg-surface-elevated rounded-2xl border border-border-subtle shadow-2xl p-6 md:p-8 backdrop-blur-xl pointer-events-auto">
                <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
                  <div>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground">Live Marketplace</h3>
                    <p className="text-xs text-foreground-secondary">Real-time direct listings</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 h-7 rounded-md bg-surface border border-border-subtle"></div>
                    <div className="w-20 h-7 rounded-md bg-surface border border-border-subtle"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-center">
                      <ProductCardMock className={`scale-[0.85] transform origin-top ${i === 2 ? 'ring-2 ring-brand' : 'opacity-70 grayscale-[0.2]'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};