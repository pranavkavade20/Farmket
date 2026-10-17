import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Sprout,
  Store,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import farmerImg from '@/assets/images/farmer_product.png';

export const CTASection = () => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="w-full bg-background py-16 md:py-24 overflow-hidden transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-surface p-6 sm:p-10 lg:p-14 relative overflow-hidden border border-border-strong shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Left Content Area */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border-subtle text-xs font-semibold text-foreground-secondary mb-5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                <span>Ready to Get Started</span>
              </div>

              <h2
                id="final-cta-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-foreground mb-4 leading-[1.1]"
              >
                Start buying or selling on{' '}
                <span className="text-brand">Farmket today.</span>
              </h2>

              <p className="text-base sm:text-lg text-foreground-secondary mb-8 max-w-xl leading-relaxed">
                Whether you are a farmer ready to list your latest harvest or a
                buyer looking for dependable agricultural produce with clear unit
                pricing, you can get started in minutes.
              </p>

              {/* Primary & Secondary Web Actions (Replaces dead '#' App Store links) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
                <Link
                  to="/marketplace"
                  className="group inline-flex items-center justify-center gap-2.5 min-h-[48px] bg-foreground text-background hover:bg-foreground/90 px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Explore Marketplace</span>
                  <ArrowRight
                    className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to={user ? '/dashboard/products/add' : '/register'}
                  className="group inline-flex items-center justify-center gap-2.5 min-h-[48px] bg-background text-foreground border border-border-strong hover:bg-state-hover px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Sprout className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                  <span>{user ? 'List Produce Now' : 'Create an Account'}</span>
                  <ArrowRight
                    className="w-4 h-4 shrink-0 text-foreground-secondary group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              {/* Practical Role Checkpoints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-border-subtle w-full">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground-secondary font-medium">
                  <CheckCircle2
                    className="w-4 h-4 text-brand shrink-0"
                    aria-hidden="true"
                  />
                  <span>Direct producer listings &amp; unit prices</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground-secondary font-medium">
                  <CheckCircle2
                    className="w-4 h-4 text-brand shrink-0"
                    aria-hidden="true"
                  />
                  <span>Accessible on mobile, tablet &amp; desktop web</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="overflow-hidden rounded-2xl border border-border-subtle bg-background shadow-sm">
                  <img
                    src={farmerImg}
                    alt="Farmer showcasing freshly harvested agricultural produce"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-64 sm:h-72 object-cover"
                  />
                  <div className="p-5 bg-background border-t border-border-subtle flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-brand tracking-wider block mb-0.5">
                        Direct Farm Sourcing
                      </span>
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        Transparent Harvest Listings
                      </span>
                    </div>
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-surface border border-border-strong text-foreground hover:text-brand hover:border-brand transition-colors shrink-0"
                      aria-label="Browse marketplace listings"
                    >
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
