import { useState, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import {
  Scale,
  PackageSearch,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';
import { analyticsService, type PlatformStats } from '@/features/farmer';
import { Container, Skeleton } from '@/components/ui';

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
  const [count, setCount] = useState(() => (shouldReduceMotion ? Math.max(0, target) : 0));
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    if (target <= 0 || shouldReduceMotion) {
      const frameId = requestAnimationFrame(() => {
        setCount(Math.max(0, target));
      });
      return () => cancelAnimationFrame(frameId);
    }

    const duration = 800;
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
      className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-foreground tracking-tight mb-1 flex items-baseline"
    >
      <span className="tabular-nums">{display}</span>
      <span className="text-2xl sm:text-3xl text-brand ml-0.5">{suffix}</span>
    </div>
  );
};

const PLATFORM_CAPABILITIES = [
  {
    icon: Scale,
    title: 'Direct Unit Pricing',
    description:
      'Farmers publish exact prices per kg, crate, or quintal. Buyers see true base rates with zero distributor inflation.',
  },
  {
    icon: PackageSearch,
    title: 'Structured Category Discovery',
    description:
      'Browse fresh produce organized by agricultural harvest type with real-time stock availability on every listing.',
  },
  {
    icon: UserCheck,
    title: 'Dedicated Producer Controls',
    description:
      'Farmers manage crop lifecycle tracking, active harvest lots, and unit pricing directly from their mobile or desktop.',
  },
  {
    icon: ShoppingBag,
    title: 'Transparent Settlement',
    description:
      'Direct order fulfillment with direct digital checkout and immediate confirmation for farm pickups and dispatches.',
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
      ? 'Completed Direct Orders'
      : 'Direct Orders Placed';

  const citiesOrProductsCount =
    (statsData?.cities_count ?? 0) > 0
      ? (statsData?.cities_count ?? 0)
      : (statsData?.total_products ?? 0);

  const citiesOrProductsLabel =
    (statsData?.cities_count ?? 0) > 0
      ? 'Farming Regions Reached'
      : 'Active Produce Listings';

  const rawStats = [
    {
      label:
        (statsData?.verified_farmers ?? 0) > 0
          ? 'Verified Farm Producers'
          : 'Registered Farmers',
      raw: farmersCount,
      ...formatStatConfig(farmersCount),
    },
    {
      label: 'Direct Buyers Onboarded',
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

  const positiveStats = rawStats.filter((item) => item.raw > 0);

  return (
    <section
      aria-labelledby="platform-proof-heading"
      className="w-full bg-surface border-b border-border-subtle py-14 sm:py-20"
    >
      <Container>
        {/* Metric proof row */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-10 w-28 mb-2" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : positiveStats.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 pb-12 border-b border-border-subtle">
            {positiveStats.map((item, idx) => (
              <div key={idx} className="flex flex-col items-start">
                <AnimatedCounter
                  target={item.target}
                  suffix={item.suffix}
                  isMillion={item.isMillion}
                />
                <span className="text-xs sm:text-sm font-semibold text-foreground-secondary">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 pb-12 border-b border-border-subtle">
            <div>
              <div className="text-3xl sm:text-4xl font-display font-black text-foreground">
                0%
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground-secondary">
                Intermediary Cuts
              </span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-display font-black text-foreground">
                100%
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground-secondary">
                Transparent Pricing
              </span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-display font-black text-foreground">
                24hr
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground-secondary">
                Harvest-to-Buyer Freshness
              </span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-display font-black text-foreground">
                150+
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground-secondary">
                Verified Farm Hubs
              </span>
            </div>
          </div>
        )}

        {/* Section Heading */}
        <div className="text-left mb-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand block mb-2">
            Why Farmket
          </span>
          <h2
            id="platform-proof-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-foreground leading-tight"
          >
            Built for direct agricultural commerce.
          </h2>
          <p className="text-sm sm:text-base text-foreground-secondary mt-2 leading-relaxed">
            Eliminating opacity and multi-tier broker markups through verified digital trade infrastructure.
          </p>
        </div>

        {/* Platform capability cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORM_CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="bg-background rounded-2xl border border-border-subtle p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card hover:border-border-strong group"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-brand mb-5 group-hover:bg-brand/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
