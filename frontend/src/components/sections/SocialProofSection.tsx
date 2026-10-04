import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { analyticsService, type PlatformStats } from '@/features/farmer';
import { Skeleton } from '@/components/ui';

const DEFAULT_PARTNERS = [
  "AgriTech India", "Kisan Connect", "FarmFresh", "GreenHarvest", "EcoFoods", "AgroTrade", "BharatFarms", "NatureBasket"
];

function formatStatConfig(rawNumber: number) {
  if (rawNumber >= 1_000_000) {
    return {
      target: parseFloat((rawNumber / 1_000_000).toFixed(1)),
      suffix: 'M+',
      isMillion: true,
    };
  }
  return {
    target: rawNumber,
    suffix: rawNumber > 0 ? '+' : '',
    isMillion: false,
  };
}

interface AnimatedCounterProps {
  target: number;
  suffix: string;
  isMillion?: boolean;
}

const AnimatedCounter = ({ target, suffix, isMillion }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    if (target <= 0) {
      setCount(0);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      if (isMillion) {
        setCount(parseFloat((ease * target).toFixed(1)));
      } else {
        setCount(Math.round(ease * target));
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setCount(target);
      }
    };

    const frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, target, isMillion]);

  const display = isMillion ? count.toFixed(1) : count.toLocaleString();

  return (
    <div
      ref={ref}
      className="text-5xl md:text-6xl font-black text-foreground tracking-tighter mb-2 flex items-baseline transition-colors duration-300"
    >
      {display}
      <span
        className={`text-4xl md:text-5xl tracking-normal transition-colors duration-300 ${
          suffix === 'M+' ? 'text-brand ml-1' : 'text-foreground'
        }`}
      >
        {suffix}
      </span>
    </div>
  );
};

export const SocialProofSection = () => {
  const [statsData, setStatsData] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    analyticsService
      .getPlatformStats()
      .then((data) => {
        if (isMounted) {
          setStatsData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const partnersList =
    statsData?.partners && statsData.partners.length > 0
      ? statsData.partners
      : DEFAULT_PARTNERS;

  const farmersCount =
    (statsData?.verified_farmers ?? 0) > 0
      ? (statsData?.verified_farmers ?? 0)
      : (statsData?.total_farmers ?? 0);

  const buyersCount = statsData?.total_buyers ?? 0;

  const ordersCount =
    (statsData?.completed_orders ?? 0) > 0
      ? (statsData?.completed_orders ?? 0)
      : (statsData?.total_orders ?? 0);

  const ordersLabel =
    (statsData?.completed_orders ?? 0) > 0
      ? 'Successful Orders'
      : 'Orders Placed';

  const citiesCount =
    (statsData?.cities_count ?? 0) > 0
      ? (statsData?.cities_count ?? 0)
      : (statsData?.total_products ?? 0);

  const citiesLabel =
    (statsData?.cities_count ?? 0) > 0
      ? 'Cities Covered'
      : 'Products Listed';

  const stats = [
    {
      label:
        (statsData?.verified_farmers ?? 0) > 0
          ? 'Verified Farmers'
          : 'Registered Farmers',
      ...formatStatConfig(farmersCount),
    },
    {
      label: 'Active Buyers',
      ...formatStatConfig(buyersCount),
    },
    {
      label: ordersLabel,
      ...formatStatConfig(ordersCount),
    },
    {
      label: citiesLabel,
      ...formatStatConfig(citiesCount),
    },
  ];

  return (
    <section className="w-full bg-surface py-16 md:py-24 overflow-hidden font-sans transition-colors duration-300">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex justify-center mb-16">
          <h2 className="text-xs md:text-sm font-bold text-foreground-secondary uppercase tracking-[0.2em] text-center transition-colors duration-300">
            Trusted by the agricultural community across India
          </h2>
        </div>

        {/* Ambient Marquee with real community partners */}
        <div className="w-full max-w-5xl mx-auto overflow-hidden relative mb-20 md:mb-24">
          {/* Smooth gradient masks matching the surface background */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none transition-colors duration-300" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none transition-colors duration-300" />

          <motion.div
            className="flex whitespace-nowrap gap-16 md:gap-24 items-center w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
          >
            {[...partnersList, ...partnersList].map((partner, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 text-2xl md:text-3xl font-bold text-border-strong opacity-40 tracking-tight select-none pointer-events-none transition-colors duration-300"
              >
                {partner}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Minimalist Divider */}
        <div className="w-full h-[1px] bg-border-subtle mb-16 md:mb-20 max-w-5xl mx-auto transition-colors duration-300" />

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 max-w-5xl mx-auto">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center">
                <Skeleton className="h-12 md:h-14 w-28 md:w-36 mb-3 rounded-xl" />
                <Skeleton className="h-4 md:h-5 w-20 md:w-28 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 max-w-5xl mx-auto">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: idx * 0.1,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col items-center justify-center text-center"
              >
                <AnimatedCounter
                  target={stat.target}
                  suffix={stat.suffix}
                  isMillion={stat.isMillion}
                />
                <p className="text-sm md:text-base text-foreground-secondary font-medium transition-colors duration-300">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};