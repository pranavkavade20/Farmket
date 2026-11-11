import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Search,
} from 'lucide-react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'framer-motion';

import farmerImg from '@/assets/images/hero/indian_farmer.png';
import buyerImg from '@/assets/images/hero/young_buyer.png';

/**
 * Farmket hero.
 *
 * The two photos are the visual. Instead of a UI card on top of them, a short
 * three-step story plays between the people (PRD §12, Journey 1):
 *   1. Farmer sets the price   → listing chip appears on the farmer
 *   2. You chat directly       → a dot travels the line between you, chat bubble
 *   3. You order fresh         → order chip on you, "new order" on the farmer
 *
 * Engineering notes:
 *  - H1, search and photos render immediately (no opacity-0 start), so LCP is
 *    not delayed. Motion only runs on decorative / supporting parts.
 *  - The story pauses on hover and focus, restarts from the clicked step, and
 *    never auto-plays for people with "reduce motion" turned on.
 *  - No made-up numbers: social proof renders only if you pass real `stats`.
 *  - `onTrack` lets you wire the product events proposed in PRD §24.
 */

/* ───────────── Config: adjust to match your routes and API ───────────── */

const MARKETPLACE_PATH = '/marketplace';
/** Query param your marketplace page reads for text search. */
const SEARCH_PARAM = 'search';
/** Rotating hint inside the search box. */
const SEARCH_HINTS = [
  'fresh tomatoes',
  'organic onions',
  'mangoes',
  'a farmer by name',
];

/* ───────────── Types ───────────── */

type Step = 0 | 1 | 2;
type TrackFn = (event: string, props?: Record<string, unknown>) => void;

export interface HeroSectionProps {
  /** Real platform numbers. Each one renders only when provided. */
  stats?: {
    farmers?: number;
    ordersFulfilled?: number;
  };
  /** Analytics hook, e.g. (name, props) => posthog.capture(name, props). */
  onTrack?: TrackFn;
}

/* ───────────── Sample story content ───────────── */

const SAMPLE = {
  crop: 'Red Tomatoes',
  farm: 'Jadhav Farm, Nashik',
  pricePerKg: 34,
  readyKg: 450,
  orderKg: 25,
};
const SAMPLE_TOTAL = SAMPLE.pricePerKg * SAMPLE.orderKg;

const STEP_MS = 3600;

const STORY: Array<{ title: string; caption: string }> = [
  {
    title: 'Farmer sets the price',
    caption: `${SAMPLE.crop} listed at ₹${SAMPLE.pricePerKg}/kg.`,
  },
  {
    title: 'You chat direct',
    caption: 'No middlemen. Ask the farmer anything.',
  },
  {
    title: 'You order fresh',
    caption: `${SAMPLE.orderKg} kg, straight from the field.`,
  },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/* ───────────── Connection arc geometry ─────────────
 * The arc runs under the photos from the farmer's centre to the buyer's
 * centre. The travelling dot follows the same cubic bezier, sampled into
 * percentages so it stays aligned at any width.
 */

const ARC_VIEWBOX_H = 24;
const ARC_POINTS = [
  [29, 0],
  [29, 22],
  [80, 22],
  [80, 0],
] as const;
const ARC_PATH = `M${ARC_POINTS[0].join(' ')} C ${ARC_POINTS[1].join(
  ' '
)}, ${ARC_POINTS[2].join(' ')}, ${ARC_POINTS[3].join(' ')}`;

const sampleArc = (samples: number) => {
  const xs: string[] = [];
  const ys: string[] = [];
  const [p0, p1, p2, p3] = ARC_POINTS;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const u = 1 - t;
    const b0 = u * u * u;
    const b1 = 3 * u * u * t;
    const b2 = 3 * u * t * t;
    const b3 = t * t * t;
    const x = b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0];
    const y = b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1];
    xs.push(`${x}%`);
    ys.push(`${(y / ARC_VIEWBOX_H) * 100}%`);
  }
  return { xs, ys };
};
const ARC_DOT = sampleArc(16);
const ARC_MID_Y = `${((0.75 * ARC_POINTS[1][1]) / ARC_VIEWBOX_H) * 100}%`;

/* ───────────── Search ───────────── */

const HeroSearch = ({ onTrack }: { onTrack?: TrackFn }) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [hintIndex, setHintIndex] = useState(0);

  // Rotate the hint while the box is empty
  useEffect(() => {
    if (reduceMotion || query) return;
    const id = window.setInterval(
      () => setHintIndex((i) => (i + 1) % SEARCH_HINTS.length),
      2600
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, query]);

  const goToSearch = (term: string) => {
    const trimmed = term.trim();
    onTrack?.('hero_search', { source: 'form', query: trimmed });
    navigate(
      trimmed
        ? `${MARKETPLACE_PATH}?${SEARCH_PARAM}=${encodeURIComponent(trimmed)}`
        : MARKETPLACE_PATH
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    goToSearch(query);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex items-stretch rounded-2xl border border-border-strong bg-surface p-1 shadow-sm transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30 hover:border-border-strong/90 hover:shadow-md"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search produce, categories or farmers
      </label>
      <Search
        aria-hidden="true"
        className="ml-3.5 h-5 w-5 shrink-0 self-center text-foreground-secondary"
      />

      <div className="relative min-w-0 flex-1">
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          enterKeyHint="search"
          className="w-full bg-transparent px-3 py-3.5 text-base text-foreground focus:outline-none"
        />
        {!query && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-3 text-base text-foreground-secondary/70"
          >
            <span className="whitespace-pre">Search </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={SEARCH_HINTS[hintIndex]}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="truncate"
              >
                {SEARCH_HINTS[hintIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`group inline-flex items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-all hover:bg-foreground/90 active:scale-[0.97] sm:px-6 ${focusRing}`}
      >
        <span>Search</span>
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </form>
  );
};

/* ───────────── Story stage (photos + animated connection) ───────────── */

const chipMotion = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { type: 'spring' as const, stiffness: 380, damping: 30 },
};
const chipClass =
  'absolute inset-x-2.5 bottom-2.5 sm:inset-x-3 sm:bottom-3 rounded-xl border border-border-subtle bg-background px-3 py-2.5 shadow-md';

const TypingDots = () => (
  <span className="inline-flex items-center gap-1 py-1" aria-label="Typing">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-foreground-secondary"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
      />
    ))}
  </span>
);

/** Buyer's message: typing dots first, then the text. */
const ChatBubble = ({ reduceMotion }: { reduceMotion: boolean | null }) => {
  const [typed, setTyped] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setTyped(true), reduceMotion ? 0 : 1000);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-secondary">
        You
      </p>
      <div className="mt-1 min-h-[22px]">
        <AnimatePresence mode="wait" initial={false}>
          {typed ? (
            <motion.p
              key="msg"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-foreground"
            >
              Can I get {SAMPLE.orderKg} kg?
            </motion.p>
          ) : (
            <motion.div key="dots" exit={{ opacity: 0 }}>
              <TypingDots />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const CheckBadge = () => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}
    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand"
  >
    <Check className="h-3.5 w-3.5 text-foreground" strokeWidth={3} aria-hidden="true" />
  </motion.span>
);

const Photo = ({
  src,
  alt,
  label,
  active,
  priority,
  className,
  children,
}: {
  src: string;
  alt: string;
  label: string;
  active: boolean;
  priority?: boolean;
  className: string;
  children: ReactNode;
}) => (
  <figure
    className={`group relative overflow-hidden rounded-xl border bg-surface transition-[box-shadow,border-color] duration-500 ${active
        ? 'border-brand shadow-[0_0_0_3px] shadow-brand/20'
        : 'border-border-subtle'
      } ${className}`}
  >
    <img
      src={src}
      alt={alt}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
    />
    <figcaption className="absolute left-2.5 top-2.5 rounded-md bg-background px-2.5 py-1 text-xs font-semibold text-foreground sm:left-3 sm:top-3">
      {label}
    </figcaption>
    {children}
  </figure>
);

const HeroStory = ({ onTrack }: { onTrack?: TrackFn }) => {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance. Restarts after every step change (including manual clicks).
  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setTimeout(
      () => setStep((s) => ((s + 1) % 3) as Step),
      STEP_MS
    );
    return () => window.clearTimeout(id);
  }, [step, paused, reduceMotion]);

  const farmerActive = step !== 2;
  const buyerActive = step !== 0;
  const filling = !paused && !reduceMotion;

  return (
    <MotionConfig reducedMotion="user">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Photos, bottoms aligned so the connection hangs from both */}
        <div className="grid grid-cols-12 items-end gap-3 sm:gap-4">
          <Photo
            src={farmerImg}
            alt="A farmer in their field holding a basket of fresh vegetables"
            label="The grower"
            active={farmerActive}
            priority
            className="col-span-7 aspect-[4/5] rounded-tl-[56px]"
          >
            <AnimatePresence mode="wait">
              {step !== 2 && (
                <motion.div key="listing" {...chipMotion} className={chipClass}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-bold text-foreground">
                      {SAMPLE.crop}
                    </span>
                    <motion.span
                      key={`price-${step}`}
                      initial={{ scale: step === 0 ? 1.25 : 1 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                      className="shrink-0 text-sm font-bold text-brand tabular-nums"
                    >
                      ₹{SAMPLE.pricePerKg}/kg
                    </motion.span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-foreground-secondary">
                    {SAMPLE.readyKg} kg ready · {SAMPLE.farm}
                  </p>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="new-order"
                  {...chipMotion}
                  className={`${chipClass} flex items-center gap-2.5`}
                >
                  <CheckBadge />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      New order · {SAMPLE.orderKg} kg
                    </p>
                    <p className="truncate text-xs text-foreground-secondary">
                      ₹{SAMPLE_TOTAL.toLocaleString('en-IN')}, direct to you
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Photo>

          <Photo
            src={buyerImg}
            alt="A young buyer ordering fresh produce on their phone"
            label="You"
            active={buyerActive}
            className="col-span-5 aspect-[3/4] rounded-tr-[56px]"
          >
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="chat" {...chipMotion} className={chipClass}>
                  <ChatBubble reduceMotion={reduceMotion} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="ordered"
                  {...chipMotion}
                  className={`${chipClass} flex items-center gap-2`}
                >
                  <CheckBadge />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      Order placed
                    </p>
                    <p className="truncate text-xs text-foreground-secondary tabular-nums">
                      {SAMPLE.orderKg} kg · ₹{SAMPLE_TOTAL.toLocaleString('en-IN')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Photo>
        </div>

        {/* Direct connection: farmer → you, nothing in between */}
        <div className="relative h-[72px]" aria-hidden="true">
          <svg
            viewBox={`0 0 100 ${ARC_VIEWBOX_H}`}
            preserveAspectRatio="none"
            fill="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <motion.path
              d={ARC_PATH}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="2 7"
              vectorEffect="non-scaling-stroke"
              className={`transition-colors duration-500 ${step === 1 ? 'text-brand' : 'text-border-strong'
                }`}
              animate={
                step === 1 && !reduceMotion
                  ? { strokeDashoffset: [0, -18] }
                  : { strokeDashoffset: 0 }
              }
              transition={
                step === 1 && !reduceMotion
                  ? { duration: 0.9, ease: 'linear', repeat: Infinity }
                  : { duration: 0 }
              }
            />
          </svg>

          {step === 1 && !reduceMotion && (
            <motion.span
              key="dot"
              className="absolute -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/20"
              style={{ left: ARC_DOT.xs[0], top: ARC_DOT.ys[0] }}
              animate={{
                left: ARC_DOT.xs,
                top: ARC_DOT.ys,
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{
                left: { duration: 1.9, ease: 'linear', delay: 0.15 },
                top: { duration: 1.9, ease: 'linear', delay: 0.15 },
                opacity: {
                  duration: 1.9,
                  times: [0, 0.08, 0.5, 0.92, 1],
                  delay: 0.15,
                },
              }}
            />
          )}

          <span
            className={`absolute left-[54.5%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border bg-background px-3 py-1 text-xs font-semibold transition-colors duration-500 ${step === 1
                ? 'border-brand text-foreground'
                : 'border-border-subtle text-foreground-secondary'
              }`}
            style={{ top: ARC_MID_Y }}
          >
            Direct · no middlemen
          </span>
        </div>

        {/* Step controls: also the timeline progress */}
        <ol
          aria-label="How Farmket works"
          className="mt-1 grid grid-cols-3 gap-3 sm:gap-4"
        >
          {STORY.map((item, i) => {
            const active = step === i;
            return (
              <li key={item.title}>
                <button
                  type="button"
                  aria-current={active ? 'step' : undefined}
                  onClick={() => {
                    setStep(i as Step);
                    onTrack?.('hero_story_step', { step: i + 1 });
                  }}
                  className={`block w-full rounded-sm text-left ${focusRing}`}
                >
                  <span className="relative block h-0.5 w-full overflow-hidden rounded-full bg-border-subtle">
                    {active && (
                      <motion.span
                        key={`${step}-${filling}`}
                        className="absolute inset-y-0 left-0 bg-brand"
                        initial={{ width: filling ? '0%' : '100%' }}
                        animate={{ width: '100%' }}
                        transition={{
                          duration: filling ? STEP_MS / 1000 : 0,
                          ease: 'linear',
                        }}
                      />
                    )}
                  </span>
                  <span
                    className={`mt-2.5 block text-xs font-semibold transition-colors sm:text-sm ${active ? 'text-foreground' : 'text-foreground-secondary'
                      }`}
                  >
                    <span className="tabular-nums">{i + 1}. </span>
                    {item.title}
                  </span>
                  <span className="mt-1 hidden text-xs leading-snug text-foreground-secondary sm:block">
                    {item.caption}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </MotionConfig>
  );
};

/* ───────────── Hero ───────────── */

export const HeroSection = ({ stats, onTrack }: HeroSectionProps) => {
  const reduceMotion = useReducedMotion();

  const proof = [
    stats?.farmers
      ? `${stats.farmers.toLocaleString('en-IN')}+ farmers selling direct`
      : null,
    stats?.ordersFulfilled
      ? `${stats.ordersFulfilled.toLocaleString('en-IN')}+ orders delivered`
      : null,
  ].filter(Boolean) as string[];

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full overflow-hidden border-b border-border-subtle bg-background font-sans"
    >
      {/* Subtle ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-12 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-14">
          {/* ───────────── Left: message + primary action ───────────── */}
          <div className="lg:col-span-6 xl:col-span-6">
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground-secondary">
              <span aria-hidden="true" className="h-px w-8 bg-brand" />
              Farm-to-buyer marketplace
            </p>

            <h1
              id="hero-heading"
              className="font-display text-[clamp(2.5rem,4.8vw,4.25rem)] font-bold leading-[1.06] tracking-tight text-foreground [text-wrap:balance]"
            >
              Buy it from the{' '}
              <span className="relative inline-block">
                farmer
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 14"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute -bottom-1.5 left-0 h-3 w-full text-brand"
                >
                  <motion.path
                    d="M3 9 C 40 2, 72 13, 112 7 S 172 3, 197 8"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                  />
                </svg>
              </span>{' '}
              who grew it.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground-secondary">
              Farmers set their own price. You order fresh produce straight
              from the field, or reserve a crop while it&apos;s still growing.
            </p>

            <div className="mt-8 max-w-xl">
              <HeroSearch onTrack={onTrack} />
            </div>

            {proof.length > 0 && (
              <p className="mt-6 text-sm text-foreground-secondary">
                {proof.join('  ·  ')}
              </p>
            )}
          </div>

          {/* ───────────── Right: the story between grower and you ───────────── */}
          <div className="mx-auto w-full max-w-[560px] lg:col-span-6 lg:max-w-none lg:pl-6 xl:pl-10">
            <HeroStory onTrack={onTrack} />
          </div>
        </div>
      </div>
    </section>
  );
};