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
    <div className="flex flex-col bg-green-50 dark:bg-[#0A0A0A] w-full min-h-screen pt-12">

      <ProblemSolutionSection />
      <FeaturesBentoSection />
      <HowItWorksSection />
      <TrustSecuritySection />
      <FAQSection />
    </div>
  );
};

export default About;
