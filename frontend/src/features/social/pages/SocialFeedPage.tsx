import React from 'react';
import { SocialFeed } from '../components/SocialFeed';

const SocialFeedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Community Feed</h1>
          <p className="text-gray-500 dark:text-gray-400">See what farmers are harvesting.</p>
        </div>
        <SocialFeed />
      </div>
    </div>
  );
};

export default SocialFeedPage;
