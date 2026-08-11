import type { Variants } from 'framer-motion';

/**
 * Reusable continuous animation variants for Farmket.
 * These animations provide ambient, organic movement without relying on scroll position.
 */

// Subtle floating motion for decorative elements, images, or selected cards
export const floatingVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const floatingSlightVariants: Variants = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Continuous background breathing/scaling
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Continuous background breathing for very large shapes
export const ambientBackgroundVariants: Variants = {
  animate: {
    scale: [1, 1.03, 1],
    opacity: [0.4, 0.6, 0.4],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Continuous rotation for orbits or abstract shapes
export const rotateContinuousVariants: Variants = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 30,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};
