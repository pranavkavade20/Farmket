import React, { useState, useEffect } from 'react';
import { useGetFeedQuery } from '../api/socialApi';
import { FeedCard } from './FeedCard';
import { PostComposer } from './PostComposer';
import { useAppSelector } from '@/app/hooks';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const SocialFeed: React.FC = () => {
  const [cursor, setCursor] = useState<string | void>(undefined);
  const [posts, setPosts] = useState<any[]>([]);
  const { data, isLoading, isFetching } = useGetFeedQuery(cursor);
  const { user } = useAppSelector(state => state.auth);
  
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    if (data && data.results) {
      if (cursor) {
        setPosts(prev => [...prev, ...data.results]);
      } else {
        setPosts(data.results);
      }
    }
  }, [data, cursor]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) {
      return;
    }
    if (data?.next) {
      // Extract cursor from URL
      const url = new URL(data.next);
      const nextCursor = url.searchParams.get('cursor');
      if (nextCursor) setCursor(nextCursor);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data, isFetching]);

  const navigate = useNavigate();

  const handleBuyNowClick = (product: any) => {
    // Navigate to the marketplace product details page
    navigate(`/marketplace/${product.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-0">
      {/* Top action bar for Farmers */}
      {user?.role === 'farmer' && (
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {!showComposer ? (
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => setShowComposer(true)}
                className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {user.first_name?.[0] || 'F'}
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 rounded-full py-2.5 px-4 flex-1 text-left">
                  What are you harvesting today?
                </div>
              </motion.button>
            ) : (
              <PostComposer 
                onClose={() => setShowComposer(false)} 
                onSuccess={() => {
                  setShowComposer(false);
                  setCursor(undefined); // Reset feed
                }} 
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <FeedCard 
            key={`${post.id}-${index}`} 
            post={post} 
            onCommentClick={(id) => console.log('Open comments for', id)} 
            onBuyNowClick={handleBuyNowClick} 
          />
        ))}
      </div>

      {/* Loading state */}
      {isFetching && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      )}
      
      {!isFetching && posts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No posts to show right now.
        </div>
      )}
    </div>
  );
};
