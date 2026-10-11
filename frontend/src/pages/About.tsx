import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useSEO } from '@/hooks';
import Lenis from 'lenis';

import { AboutHero } from '@/components/about/AboutHero';
import { FarmerStory } from '@/components/about/FarmerStory';
import { BuyerStory } from '@/components/about/BuyerStory';
import { MarketplaceFlow } from '@/components/about/MarketplaceFlow';
import { AISection } from '@/components/about/AISection';
import { FutureVision } from '@/components/about/FutureVision';

const About = () => {
  const prefersReducedMotion = useReducedMotion();

  useSEO({
    title: 'About Farmket | Our Ecosystem',
    description: 'Explore the Farmket ecosystem. A modern technology product connecting farmers, buyers, and intelligent AI assistance in one unified platform.',
  });

  useEffect(() => {
    if (prefersReducedMotion !== false) return;

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let frameId = 0;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return (
    <div className="flex flex-col bg-background text-foreground w-full min-h-screen">
      <AboutHero />
      <MarketplaceFlow />
      <FarmerStory />
      <BuyerStory />
      <AISection />
      <FutureVision />
    </div>
  );
};

export default About;
