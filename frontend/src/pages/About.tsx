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
    <div className="flex flex-col bg-white dark:bg-[#0A0A0A] w-full min-h-screen pt-12">
      
      {/* Small Header for About Page */}
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 py-12 lg:py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
          Building the future of <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#168748] to-[#84D836]">agricultural commerce.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
          We exist to empower farmers to earn what they deserve and provide buyers with the freshest produce directly from the source.
        </p>
      </div>

      <ProblemSolutionSection />
      <FeaturesBentoSection />
      <HowItWorksSection />
      <TrustSecuritySection />
      <FAQSection />
    </div>
  );
};

export default About;
