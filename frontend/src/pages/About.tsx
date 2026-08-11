import { useEffect } from 'react';
import { useSEO } from '@/hooks';
import Lenis from 'lenis';

import { AboutHero } from '@/components/about/AboutHero';
import { PlatformEcosystem } from '@/components/about/PlatformEcosystem';
import { FarmerStory } from '@/components/about/FarmerStory';
import { BuyerStory } from '@/components/about/BuyerStory';
import { MarketplaceFlow } from '@/components/about/MarketplaceFlow';
import { AISection } from '@/components/about/AISection';
import { RecommendationSection } from '@/components/about/RecommendationSection';
import { FutureVision } from '@/components/about/FutureVision';

const About = () => {
  useSEO({
    title: 'About Farmket | Our Ecosystem',
    description: 'Explore the Farmket ecosystem. A modern technology product connecting farmers, buyers, and intelligent AI assistance in one unified platform.',
  });

  useEffect(() => {
    // Initialize Lenis for smooth scroll on the About page
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col bg-background text-foreground w-full min-h-screen">
      <AboutHero />
      <PlatformEcosystem />
      <FarmerStory />
      <BuyerStory />
      <MarketplaceFlow />
      <AISection />
      <RecommendationSection />
      <FutureVision />
    </div>
  );
};

export default About;
