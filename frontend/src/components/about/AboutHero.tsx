import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { DashboardMock } from './ui-mocks/DashboardMock';
import { floatingVariants, ambientBackgroundVariants } from '@/utils/animations';
import { Container } from '@/components/ui';

export const AboutHero = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[680px] w-full items-center justify-center overflow-hidden bg-background py-24 sm:min-h-[740px] lg:min-h-[820px] lg:py-28">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          variants={ambientBackgroundVariants}
          animate={prefersReducedMotion ? undefined : 'animate'}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" 
        />
        <motion.div 
          variants={ambientBackgroundVariants}
          animate={prefersReducedMotion ? undefined : 'animate'}
          style={{ animationDelay: '2s' }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" 
        />
      </div>

      <Container className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="z-20 mb-10 max-w-4xl sm:mb-12"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand">A more direct way to trade fresh produce</p>
          <h1 className="mb-5 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text font-display text-4xl font-bold leading-[1.08] tracking-tight text-transparent drop-shadow-sm sm:text-6xl lg:text-7xl">
            From the farm.<br className="hidden sm:block" /> Straight to your table.
          </h1>
          <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-foreground-secondary sm:text-xl">
            Farmket brings farmers and buyers together to discover fresh produce, connect directly, and make sourcing simpler.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              See how it works <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </a>
            <a
              href="#farmer-experience"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface/70 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Explore the platform <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* Cinematic UI Presentation */}
        <div className="w-full max-w-5xl perspective-1000 flex items-center justify-center relative z-10 flex-1">
          {/* Entrance animation wrapper */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98, rotateX: 8, y: 24 }}
            animate={{ opacity: 1, scale: 1, rotateX: 10, y: 0 }}
            transition={{ duration: 0.8, delay: prefersReducedMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex items-center justify-center"
          >
            {/* Continuous floating animation wrapper */}
            <motion.div
              variants={floatingVariants}
              animate={prefersReducedMotion ? undefined : 'animate'}
              className="w-full flex items-center justify-center"
            >
              <DashboardMock />
            </motion.div>
          </motion.div>
        </div>

      </Container>

      {/* Overlay gradient to blend with next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-30 pointer-events-none"></div>
    </section>
  );
};
