import { useSEO } from '@/hooks';

import {
  ProblemSolutionSection,
  FeaturesBentoSection,
  HowItWorksSection,
  TrustSecuritySection,
  FAQSection,
} from '@/components/sections';

const About = () => {
  useSEO({
    title: 'About Farmket | Our Mission & Platform',
    description: 'Learn how Farmket is revolutionizing agricultural commerce by cutting out middlemen and connecting farmers directly with buyers.',
  });
  
  return (
    <div className="flex flex-col bg-background text-foreground w-full min-h-screen pt-8 md:pt-10 transition-colors duration-300">

      <ProblemSolutionSection />
      <FeaturesBentoSection />
      <HowItWorksSection />
      <TrustSecuritySection />
      <FAQSection />
    </div>
  );
};

export default About;
