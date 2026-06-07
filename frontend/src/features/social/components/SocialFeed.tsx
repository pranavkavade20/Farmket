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
    // Navigate to the marketplace product details page using slug
    navigate(`/marketplace/${product.slug}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-0">
      {/* Floating Action Button & Modal for Farmers */}
      {user?.user_type === 'farmer' && (
        <>
          <AnimatePresence>
            {!showComposer && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowComposer(true)}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all border-4 border-white dark:border-gray-900"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showComposer && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowComposer(false);
                }}
              >
                <PostComposer 
                  onClose={() => setShowComposer(false)} 
                  onSuccess={() => {
                    setShowComposer(false);
                    setCursor(undefined); // Reset feed
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
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
