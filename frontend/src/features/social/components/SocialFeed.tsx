import React, { useState, useEffect } from 'react';
import { useGetFeedQuery } from '../api/socialApi';
import { FeedCard } from './FeedCard';
import { PostComposer } from './PostComposer';
import { CommentPanel } from './CommentPanel';
import { useAppSelector } from '@/app/hooks';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui';

export const SocialFeed: React.FC = () => {
  const [cursor, setCursor] = useState<string | void>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const { data, isFetching } = useGetFeedQuery(cursor);
  const { user } = useAppSelector(state => state.auth);
  
  const [showComposer, setShowComposer] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);

  useEffect(() => {
    if (data && data.results) {
      if (cursor) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPosts(prev => [...prev, ...data.results]);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isFetching]);

  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBuyNowClick = (product: any) => {
    // Navigate to the marketplace product details page using slug
    navigate(`/marketplace/${product.slug}`);
  };

  useEffect(() => {
    if (activeCommentPostId) {
      setTimeout(() => {
        const el = document.getElementById(`post-${activeCommentPostId}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 30; // 30px padding from top
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150); // allow layout transition to occur first
    }
  }, [activeCommentPostId]);

  return (
    <Container maxWidth="reading" className="py-8 px-0 sm:px-0">
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
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all border-4 border-white dark:border-gray-900"
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
      <div className={`space-y-8 mx-auto transition-all duration-300 ${activeCommentPostId ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {posts.map((post, index) => (
          <div key={`${post.id}-${index}`} id={`post-${post.id}`} className={`flex flex-col md:flex-row gap-4 lg:gap-6 items-start justify-center transition-all duration-500 ${activeCommentPostId === post.id ? 'md:h-[85vh]' : ''}`}>
            {/* Feed Card */}
            <div className={`transition-all duration-300 w-full mx-auto ${activeCommentPostId === post.id ? 'md:w-[500px] lg:w-[600px] flex-shrink-0 md:mx-0 h-full' : 'max-w-2xl'}`}>
              <FeedCard 
                post={post} 
                onCommentClick={(id) => setActiveCommentPostId(activeCommentPostId === id ? null : id)} 
                onBuyNowClick={handleBuyNowClick}
                isActive={activeCommentPostId === post.id}
              />
            </div>
            
            {/* Desktop Inline Comment Panel */}
            <AnimatePresence>
              {activeCommentPostId === post.id && (
                <motion.div 
                  initial={{ opacity: 0, width: 0, x: -20 }}
                  animate={{ opacity: 1, width: '100%', maxWidth: '400px', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -20 }}
                  className="hidden md:block flex-shrink-0 h-full w-[350px] lg:w-[400px]"
                >
                  <CommentPanel 
                    postId={activeCommentPostId} 
                    isOpen={true} 
                    onClose={() => setActiveCommentPostId(null)} 
                    isInline={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {isFetching && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      )}
      
      {!isFetching && posts.length === 0 && (
        <div className="text-center py-20 text-muted">
          No posts to show right now.
        </div>
      )}

      {/* Mobile Modal Comment Panel */}
      <div className="md:hidden">
        <CommentPanel 
          postId={activeCommentPostId} 
          isOpen={activeCommentPostId !== null} 
          onClose={() => setActiveCommentPostId(null)} 
          isInline={false}
        />
      </div>
    </Container>
  );
};
