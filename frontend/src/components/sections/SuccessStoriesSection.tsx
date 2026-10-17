import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sprout,
  Store,
  ClipboardList,
  Tag,
  ShoppingBag,
  Search,
  Scale,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth';

type RoleView = 'buyer' | 'farmer';

const BUYER_STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Discover Produce by Category',
    description:
      'Browse fresh vegetables, fruits, grains, and staples or filter directly by crop category to inspect current farm listings.',
    highlight: 'Category & keyword filtering',
  },
  {
    step: '02',
    icon: Scale,
    title: 'Evaluate Price, Unit & Stock',
    description:
      'Review clear per-unit pricing, available harvest quantities, and product details published directly by the seller.',
    highlight: 'Transparent unit rates',
  },
  {
    step: '03',
    icon: ShoppingBag,
    title: 'Add to Cart & Place Order',
    description:
      'Select the quantities you need, add produce items to your buyer cart, and complete your order through your account.',
    highlight: 'Direct digital checkout flow',
  },
];

const FARMER_STEPS = [
  {
    step: '01',
    icon: Sprout,
    title: 'Create Your Producer Account',
    description:
      'Register on Farmket and access your dedicated farmer dashboard designed for straightforward inventory management.',
    highlight: 'Simple onboarding',
  },
  {
    step: '02',
    icon: ClipboardList,
    title: 'List Harvest Lots & Units',
    description:
      'Add product photos, select the appropriate crop category, and specify your selling unit and available stock quantity.',
    highlight: 'Full catalog control',
  },
  {
    step: '03',
    icon: Tag,
    title: 'Set Your Own Selling Price',
    description:
      'Publish listings at your chosen price per unit so buyers across the marketplace can discover and purchase your produce.',
    highlight: 'No middleman price cuts',
  },
];

const ROLE_BENEFITS = {
  buyer: [
    'Compare unit prices and available quantities before adding items to cart',
    'Browse structured agricultural categories without intermediary markups',
    'Manage your selected produce items cleanly from a single buyer cart',
  ],
  farmer: [
    'List produce with clear units, photos, and descriptions from any device',
    'Update prices and available stock as new harvests become ready',
    'Reach retail and wholesale buyers directly through a central catalog',
  ],
};

export const SuccessStoriesSection = () => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleView>('buyer');

  const activeSteps = selectedRole === 'buyer' ? BUYER_STEPS : FARMER_STEPS;
  const activeBenefits = ROLE_BENEFITS[selectedRole];

  return (
    <section
      id="how-farmket-works"
      aria-labelledby="how-it-works-heading"
      className="relative w-full bg-surface py-16 md:py-24 border-b border-border-subtle overflow-hidden font-sans transition-colors duration-300"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header & Role Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border-subtle mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
              <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                How Farmket Works
              </span>
            </div>
            <h2
              id="how-it-works-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-foreground tracking-tight leading-[1.1]"
            >
              Built for both <span className="text-brand">farmers and buyers.</span>
            </h2>
            <p className="text-sm sm:text-base text-foreground-secondary mt-3 leading-relaxed">
              A clear, predictable workflow whether you are listing a fresh
              harvest from your farm or sourcing agricultural produce for your
              business or household.
            </p>
          </div>

          {/* Interactive Role Switcher */}
          <div
            role="tablist"
            aria-label="Choose workflow view"
            className="inline-flex p-1.5 rounded-2xl bg-background border border-border-strong self-start lg:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === 'buyer'}
              onClick={() => setSelectedRole('buyer')}
              className={`inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                selectedRole === 'buyer'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <Store className="w-4 h-4" aria-hidden="true" />
              <span>Buyer Journey</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === 'farmer'}
              onClick={() => setSelectedRole('farmer')}
              className={`inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                selectedRole === 'farmer'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <Sprout className="w-4 h-4" aria-hidden="true" />
              <span>Farmer Journey</span>
            </button>
          </div>
        </div>

        {/* 3-Step Journey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {activeSteps.map((item, idx) => {
            const StepIcon = item.icon;
            return (
              <motion.div
                key={`${selectedRole}-${item.step}`}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.07 }}
                className="bg-background rounded-2xl p-6 sm:p-8 border border-border-subtle flex flex-col justify-between hover:border-border-strong transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-brand">
                      <StepIcon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-foreground-secondary px-2.5 py-1 rounded-md bg-surface border border-border-subtle">
                      Step {item.step}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2.5 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-foreground-secondary text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-subtle mt-auto flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                  <span className="text-foreground text-xs font-semibold">
                    {item.highlight}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Role Summary Bar with Concrete Benefits & Direct Action */}
        <div className="rounded-2xl bg-background border border-border-strong p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand">
              {selectedRole === 'buyer'
                ? 'Why Buyers Source on Farmket'
                : 'Why Farmers Sell on Farmket'}
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 pt-1">
              {activeBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground font-medium leading-relaxed"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-brand shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 w-full lg:w-auto">
            {selectedRole === 'buyer' ? (
              <Link
                to="/marketplace"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span>Explore Available Produce</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                to={user ? '/dashboard/products/add' : '/register'}
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span>{user ? 'Add New Product Listing' : 'Create Farmer Account'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
