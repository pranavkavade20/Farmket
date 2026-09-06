import React from 'react';
import { SocialFeed } from '../components/SocialFeed';
import { Container, Badge } from '@/components/ui';
import { Newspaper } from 'lucide-react';

const SocialFeedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pt-6 pb-16">
      <Container>
        <div className="mb-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-2.5 pt-4">
          <Badge variant="brand" className="px-3 py-1 gap-1.5 shadow-sm">
            <Newspaper className="h-3.5 w-3.5" />
            <span>Farm Life & Updates</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Community Feed
          </h1>
          <p className="text-foreground-secondary font-medium text-sm sm:text-base max-w-md leading-relaxed">
            See real-time crop growth, harvest updates, and farm stories directly from verified producers.
          </p>
        </div>
        <SocialFeed />
      </Container>
    </div>
  );
};

export default SocialFeedPage;
