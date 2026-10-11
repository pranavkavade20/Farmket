import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Sprout, Store, Users } from 'lucide-react';
import { Container } from '@/components/ui';

const community = [
  { label: 'Farmers', icon: Sprout, className: 'bg-brand/10 text-brand' },
  { label: 'Buyers', icon: Users, className: 'bg-accent-sky-muted text-accent-sky' },
  { label: 'One marketplace', icon: Store, className: 'bg-accent-berry-muted text-accent-berry' },
];

export const FutureVision = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="future-title" className="relative overflow-hidden bg-surface py-20 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent-sky/10 blur-3xl" />
      </div>

      <Container className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand">Better connections, from farm to buyer</p>
          <h2 id="future-title" className="max-w-xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Fresh produce deserves a clearer path.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-secondary sm:text-lg">
            Farmket gives growers and buyers one place to meet, discover produce, and make direct connections.
          </p>
          <a
            href="#how-it-works"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            See the journey <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.ul
          aria-label="Who Farmket brings together"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.1 }}
          className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
        >
          {community.map(({ label, icon: Icon, className }, index) => (
            <motion.li
              key={label}
              whileHover={prefersReducedMotion ? undefined : { x: 4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-background/80 p-4 shadow-sm sm:flex-col sm:items-start sm:p-5 lg:flex-row lg:items-center"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-display font-semibold">{label}</p>
                <p className="mt-1 text-sm text-foreground-secondary">
                  {index === 0 && 'Share fresh produce and reach new customers.'}
                  {index === 1 && 'Discover listings and connect with growers.'}
                  {index === 2 && 'Bring supply and demand closer together.'}
                </p>
              </div>
              {index < community.length - 1 && (
                <span aria-hidden="true" className="hidden text-border-strong sm:block lg:hidden">↓</span>
              )}
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
};
