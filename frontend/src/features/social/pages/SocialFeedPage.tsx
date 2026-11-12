import React from 'react';
import { SocialFeed } from '../components/SocialFeed';
import { Container, Badge } from '@/components/ui';
import { Newspaper, BookOpen, ArrowRight } from 'lucide-react';
import { useSEO } from '@/hooks';
import { useAppSelector } from '@/app/hooks';
import { Link } from 'react-router-dom';

const SocialFeedPage: React.FC = () => {
  useSEO({
    title: 'Farm Life & Community Stories | Farmket',
    description:
      'Explore real-time crop lifecycle milestones, harvest dates, and transparent agricultural stories directly from local farmers.',
  });

  const { user } = useAppSelector((state) => state.auth);
  const isFarmer = user?.user_type === 'farmer';

  return (
    <div className="min-h-screen bg-background pt-6 pb-20">
      <Container>
        {/* Page Header */}
        <div className="mb-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-3 pt-2">
          <Badge variant="brand" className="px-3 py-1 gap-1.5 shadow-xs">
            <Newspaper className="h-3.5 w-3.5" />
            <span>Fresh Farm Stories</span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight">
            Community Harvest Feed
          </h1>

          <p className="text-foreground-secondary font-medium text-sm sm:text-base max-w-lg leading-relaxed">
            Follow transparent farm journeys: track live crop growth, pre-booking windows, and harvest announcements directly from local producers.
          </p>

          {isFarmer && (
            <div className="pt-2">
              <Link
                to="/farmer/posts"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-hover hover:underline transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Manage My Published Updates</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Social Feed Component */}
        <SocialFeed />
      </Container>
    </div>
  );
};

export default SocialFeedPage;
