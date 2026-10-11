import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Search, Sprout, Store } from 'lucide-react';
import { Container } from '@/components/ui';

const steps = [
  {
    number: '01',
    label: 'For farmers',
    title: 'List what you grow',
    description: 'Share available produce, quantity, and harvest details in one place.',
    icon: Sprout,
    color: 'text-brand',
    tint: 'bg-brand/10',
  },
  {
    number: '02',
    label: 'On Farmket',
    title: 'Get discovered',
    description: 'Relevant listings are easier to find with clear details and smart matching.',
    icon: Store,
    color: 'text-accent-berry',
    tint: 'bg-accent-berry-muted',
  },
  {
    number: '03',
    label: 'For buyers',
    title: 'Source farm-direct',
    description: 'Explore fresh options, compare what matters, and connect with growers.',
    icon: Search,
    color: 'text-accent-sky',
    tint: 'bg-accent-sky-muted',
  },
];

export const MarketplaceFlow = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="how-it-works" aria-labelledby="journey-title" className="scroll-mt-20 bg-surface py-20 sm:py-24 lg:py-28">
      <Container>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-16"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand">How Farmket works</p>
          <h2 id="journey-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Three steps. A more direct journey.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-foreground-secondary sm:text-lg">
            Farmket helps fresh produce move from the people who grow it to the people who need it.
          </p>
        </motion.div>

        <ol className="relative grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map(({ number, label, title, description, icon: Icon, color, tint }, index) => (
            <motion.li
              key={number}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: prefersReducedMotion ? 0 : index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              className="group relative rounded-2xl border border-border-subtle bg-background p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-sm font-semibold tracking-widest text-foreground-secondary">{number}</span>
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tint} ${color} transition-transform duration-300 group-hover:scale-105`}>
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
              </div>
              <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${color}`}>{label}</p>
              <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-secondary sm:text-base">{description}</p>
              {index < steps.length - 1 && (
                <ArrowRight aria-hidden="true" className="absolute -right-[1.15rem] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-border-strong md:block" />
              )}
            </motion.li>
          ))}
        </ol>

        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.3 }}
          className="mt-8 text-center text-sm text-foreground-secondary"
        >
          Less friction between harvest and the people looking for it.
        </motion.p>
      </Container>
    </section>
  );
};
