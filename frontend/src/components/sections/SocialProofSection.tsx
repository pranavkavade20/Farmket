import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  Scale,
  PackageSearch,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';
import { analyticsService, type PlatformStats } from '@/features/farmer';
import { Skeleton } from '@/components/ui';

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

const AnimatedCounter = ({
  target,
  suffix,
  isMillion,
}: AnimatedCounterProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(shouldReduceMotion ? target : 0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    if (target <= 0 || shouldReduceMotion) {
      setCount(Math.max(0, target));
      return;
    }

    const duration = 900;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
  }, [isInView, target, isMillion, shouldReduceMotion]);

  const display = isMillion ? count.toFixed(1) : count.toLocaleString();

  return (
    <div
      ref={ref}
      className="text-3xl sm:text-4xl font-display font-black text-foreground tracking-tight mb-1 flex items-baseline"
    >
      <span>{display}</span>
      <span className="text-2xl sm:text-3xl text-brand ml-0.5">{suffix}</span>
    </div>
  );
};

const PLATFORM_CAPABILITIES = [
  {
    icon: Scale,
    title: 'Direct Unit Pricing',
    description:
      'Farmers publish exact rates per kg, quintal, crate, or unit so buyers see transparent base pricing.',
  },
  {
    icon: PackageSearch,
    title: 'Structured Crop Discovery',
    description:
      'Browse produce organized by agricultural category with clear stock availability on every card.',
  },
  {
    icon: UserCheck,
    title: 'Dedicated Farmer Dashboard',
    description:
      'Producers manage their own product catalog, update harvest quantities, and control active listings.',
  },
  {
    icon: ShoppingBag,
    title: 'Streamlined Buyer Cart',
    description:
      'Buyers evaluate multiple farm listings and add available agricultural produce directly to their cart.',
  },
];

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
      ? 'Completed Orders'
      : 'Orders Placed';

  const citiesOrProductsCount =
    (statsData?.cities_count ?? 0) > 0
      ? (statsData?.cities_count ?? 0)
      : (statsData?.total_products ?? 0);

  const citiesOrProductsLabel =
    (statsData?.cities_count ?? 0) > 0
      ? 'Locations Reached'
      : 'Products Listed';

  const rawStats = [
    {
      label:
        (statsData?.verified_farmers ?? 0) > 0
          ? 'Verified Farmers'
          : 'Registered Farmers',
      raw: farmersCount,
      ...formatStatConfig(farmersCount),
    },
    {
      label: 'Registered Buyers',
      raw: buyersCount,
      ...formatStatConfig(buyersCount),
    },
    {
      label: ordersLabel,
      raw: ordersCount,
      ...formatStatConfig(ordersCount),
    },
    {
      label: citiesOrProductsLabel,
      raw: citiesOrProductsCount,
      ...formatStatConfig(citiesOrProductsCount),
    },
  ];

  // Only render live numeric counters that actually have positive values from the backend
  const positiveStats = rawStats.filter((item) => item.raw > 0);
  const verifiedPartners =
    statsData?.partners && statsData.partners.length > 0
      ? statsData.partners
      : [];

  return (
    <section
      aria-label="Platform capabilities and marketplace transparency"
      className="w-full bg-surface border-b border-border-subtle py-12 md:py-16 font-sans transition-colors duration-300"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Core Marketplace Transparency Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORM_CAPABILITIES.map((capability) => {
            const IconComponent = capability.icon;
            return (
              <div
                key={capability.title}
                className="rounded-2xl bg-background border border-border-subtle p-5 sm:p-6 flex flex-col justify-between transition-colors hover:border-border-strong"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-brand mb-4">
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-foreground mb-1.5">
                    {capability.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Platform Activity Metrics (Rendered only while loading or when real positive stats exist) */}
        {loading ? (
          <div
            className="mt-10 pt-8 border-t border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-6"
            aria-busy="true"
            aria-label="Loading live platform statistics"
          >
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center text-center"
              >
                <Skeleton className="h-9 w-24 mb-2 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
            ))}
          </div>
        ) : positiveStats.length > 0 ? (
          <div className="mt-10 pt-8 border-t border-border-subtle">
            <div
              className={`grid grid-cols-2 ${
                positiveStats.length >= 4
                  ? 'md:grid-cols-4'
                  : positiveStats.length === 3
                    ? 'md:grid-cols-3'
                    : 'md:grid-cols-2'
              } gap-6 max-w-5xl mx-auto`}
            >
              {positiveStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: idx * 0.08, duration: 0.45 }}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-background/60 border border-border-subtle"
                >
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    isMillion={stat.isMillion}
                  />
                  <p className="text-xs sm:text-sm text-foreground-secondary font-semibold">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Verified Community Partners (Only shown when returned by backend API) */}
        {!loading && verifiedPartners.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border-subtle flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              Participating Organizations:
            </span>
            {verifiedPartners.map((partner) => (
              <span
                key={partner}
                className="text-xs sm:text-sm font-bold text-foreground-secondary"
              >
                {partner}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
