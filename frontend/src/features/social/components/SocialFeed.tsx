import React, { useState, useEffect, useMemo } from 'react';
import { useGetFeedQuery } from '../api/socialApi';
import { FeedCard } from './FeedCard';
import { PostComposer } from './PostComposer';
import { CommentPanel } from './CommentPanel';
import { useAppSelector } from '@/app/hooks';
import { Loader2, Plus, Sparkles, Sprout, Tag, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EmptyState, Skeleton, Button } from '@/components/ui';
import type { Post, Product } from '@/types';

type FeedFilter = 'all' | 'prebooking' | 'harvest' | 'organic' | 'pinned';

export const SocialFeed: React.FC = () => {
  const [cursor, setCursor] = useState<string | void>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const { data, isFetching } = useGetFeedQuery(cursor);
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [showComposer, setShowComposer] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);

  useEffect(() => {
    if (data && data.results) {
      if (cursor) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPosts((prev) => {
          const newPosts = data.results.filter(
            (newPost: Post) => !prev.some((p: Post) => p.id === newPost.id)
          );
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(data.results);
      }
    }
  }, [data, cursor]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop <
        document.documentElement.offsetHeight - 200 ||
      isFetching
    ) {
      return;
    }
    if (data?.next) {
      try {
        const url = new URL(data.next);
        const nextCursor = url.searchParams.get('cursor');
        if (nextCursor) setCursor(nextCursor);
      } catch {
        // ignore invalid URL
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isFetching]);

  const handleBuyNowClick = (product: Product) => {
    if (product.slug) {
      navigate(`/marketplace/${product.slug}`);
    }
  };

  // Client-side filtering by category / hashtag / pinned status
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (activeFilter === 'pinned') return post.is_pinned;
      if (activeFilter === 'prebooking') return post.product?.is_prebookable;
      if (activeFilter === 'harvest') {
        return (
          Boolean(post.product?.crop_stage) ||
          post.hashtags?.some((t) => t.toLowerCase().includes('harvest')) ||
          post.title?.toLowerCase().includes('harvest')
        );
      }
      if (activeFilter === 'organic') {
        return (
          post.hashtags?.some((t) => t.toLowerCase().includes('organic')) ||
          post.description?.toLowerCase().includes('organic')
        );
      }
      return true;
    });
  }, [posts, activeFilter]);

  const filterTabs = [
    { key: 'all' as FeedFilter, label: 'All Stories', icon: Sparkles },
    { key: 'prebooking' as FeedFilter, label: 'Pre-Bookings', icon: Tag },
    { key: 'harvest' as FeedFilter, label: 'Harvest Ready', icon: Sprout },
    { key: 'pinned' as FeedFilter, label: 'Announcements', icon: Pin },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0 relative">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar select-none">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-brand text-on-brand border-brand shadow-xs'
                  : 'bg-surface hover:bg-surface-elevated text-foreground-secondary border-border-subtle'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-on-brand' : 'text-muted'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Action Button for Verified Farmers */}
      {user?.user_type === 'farmer' && (
        <>
          <AnimatePresence>
            {!showComposer && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowComposer(true)}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 h-14 w-14 sm:h-16 sm:w-16 bg-brand hover:bg-brand-hover text-on-brand rounded-full shadow-2xl flex items-center justify-center z-40 transition-all border-4 border-surface group"
                title="Create a new farm update"
                aria-label="Create a new farm update"
              >
                <Plus size={28} className="transition-transform group-hover:rotate-90 duration-200" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Post Composer Modal */}
          <AnimatePresence>
            {showComposer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowComposer(false);
                }}
              >
                <PostComposer
                  onClose={() => setShowComposer(false)}
                  onSuccess={() => {
                    setShowComposer(false);
                    setCursor(undefined); // Reset feed to top
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Feed Cards Column */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            onCommentClick={(id) =>
              setActiveCommentPostId(activeCommentPostId === id ? null : id)
            }
            onBuyNowClick={handleBuyNowClick}
            isActive={activeCommentPostId === post.id}
          />
        ))}
      </div>

      {/* Realistic Skeletons while Initial Fetch */}
      {isFetching && posts.length === 0 && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-3xl p-5 border border-border-subtle space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-64 sm:h-80 w-full rounded-2xl" />
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isFetching && filteredPosts.length === 0 && (
        <div className="py-12">
          <EmptyState
            title={
              activeFilter === 'all'
                ? 'No farm stories yet'
                : `No stories found for ${activeFilter}`
            }
            description={
              user?.user_type === 'farmer'
                ? 'Be the first producer to share crop growth updates, harvest schedules, and farming milestones with buyers.'
                : 'Producers haven’t posted any updates under this filter yet. Check back soon for fresh harvest announcements.'
            }
            action={
              user?.user_type === 'farmer' ? (
                <Button variant="brand" onClick={() => setShowComposer(true)} leftIcon={<Plus size={16} />}>
                  Share First Update
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setActiveFilter('all')}>
                  View All Updates
                </Button>
              )
            }
          />
        </div>
      )}

      {/* Infinite Scroll Fetching Indicator */}
      {isFetching && posts.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-xs font-semibold text-muted">
          <Loader2 className="animate-spin text-brand" size={20} />
          <span>Loading more farm stories...</span>
        </div>
      )}

      {/* Comment Slide-Over Panel */}
      <CommentPanel
        postId={activeCommentPostId}
        isOpen={activeCommentPostId !== null}
        onClose={() => setActiveCommentPostId(null)}
        isInline={false}
      />
    </div>
  );
};
