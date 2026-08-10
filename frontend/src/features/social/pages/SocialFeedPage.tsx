import React from 'react';
import { SocialFeed } from '../components/SocialFeed';

const SocialFeedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-2 pt-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 tracking-tight pb-1">Community Feed</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">See what farmers are harvesting and sharing.</p>
        </div>
        <SocialFeed />
      </div>
    </div>
  );
};

export default SocialFeedPage;
