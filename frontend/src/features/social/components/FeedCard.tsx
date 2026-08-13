import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, ShoppingBag, MapPin, MoreHorizontal, Pin, VolumeX, Volume2, Calendar, Sprout } from 'lucide-react';
import { useLikePostMutation, useUnlikePostMutation, useSavePostMutation, useUnsavePostMutation } from '../api/socialApi';
import { useAppSelector } from '@/app/hooks';
import type { Post, Product } from '@/types';

interface FeedCardProps {
  post: Post;
  onCommentClick: (postId: number) => void;
  onBuyNowClick: (product: Product) => void;
  isActive?: boolean;
}

interface ActionButtonsProps {
  isDesktop?: boolean;
  isLiked: boolean;
  likesCount: number;
  handleLike: () => void;
  onCommentClick: (postId: number) => void;
  post: Post;
  handleSave: () => void;
  isSaved: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  isDesktop = false, 
  isLiked, 
  likesCount, 
  handleLike, 
  onCommentClick, 
  post, 
  handleSave, 
  isSaved 
}) => (
  <>
    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleLike}
      className={`flex ${isDesktop ? 'flex-col' : ''} items-center justify-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-foreground-secondary hover:text-red-500'}`}
      title="Like"
    >
      <div className={`p-2 rounded-full ${isDesktop ? 'bg-surface-elevated' : ''}`}>
        <Heart size={isDesktop ? 22 : 24} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'drop-shadow-sm' : ''} />
      </div>
      <span className="font-semibold text-xs">{likesCount}</span>
    </motion.button>

    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onCommentClick(post.id)}
      className={`flex ${isDesktop ? 'flex-col' : ''} items-center justify-center gap-1.5 text-foreground-secondary hover:text-orange-500 transition-colors`}
      title="Comment"
    >
      <div className={`p-2 rounded-full ${isDesktop ? 'bg-surface-elevated' : ''}`}>
        <MessageCircle size={isDesktop ? 22 : 24} />
      </div>
      <span className="font-semibold text-xs">{post.comments_count}</span>
    </motion.button>

    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`flex ${isDesktop ? 'flex-col' : ''} items-center justify-center gap-1.5 text-foreground-secondary hover:text-blue-500 transition-colors`}
      title="Share"
    >
      <div className={`p-2 rounded-full ${isDesktop ? 'bg-surface-elevated' : ''}`}>
        <Share2 size={isDesktop ? 22 : 24} />
      </div>
      {isDesktop && <span className="font-semibold text-xs">Share</span>}
    </motion.button>

    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleSave}
      className={`flex ${isDesktop ? 'flex-col' : ''} items-center justify-center gap-1.5 transition-colors ${isSaved ? 'text-orange-600 dark:text-orange-400' : 'text-foreground-secondary hover:text-orange-500'}`}
      title="Bookmark"
    >
      <div className={`p-2 rounded-full ${isDesktop ? 'bg-surface-elevated' : ''}`}>
        <Bookmark size={isDesktop ? 22 : 24} fill={isSaved ? 'currentColor' : 'none'} />
      </div>
      {isDesktop && <span className="font-semibold text-xs">Save</span>}
    </motion.button>
  </>
);

export const FeedCard: React.FC<FeedCardProps> = ({ post, onCommentClick, onBuyNowClick, isActive = false }) => {
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();
  
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isSaved, setIsSaved] = useState(post.is_saved);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  const currentMedia = post.media && post.media.length > 0 ? post.media[currentMediaIndex] : null;
  const isVideo = currentMedia?.type === 'video';

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.6 }
    );
    
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [post.media, currentMediaIndex, isVideo]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        setIsLiked(false);
        setLikesCount((p: number) => p - 1);
        await unlikePost(post.id).unwrap();
      } else {
        setIsLiked(true);
        setLikesCount((p: number) => p + 1);
        await likePost(post.id).unwrap();
      }
    } catch {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        setIsSaved(false);
        await unsavePost(post.id).unwrap();
      } else {
        setIsSaved(true);
        await savePost(post.id).unwrap();
      }
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const handleMediaClick = () => {
    if (isVideo) {
      setIsMuted(!isMuted);
    } else {
      setIsImageExpanded(!isImageExpanded);
    }
  };

  const captionText = post.description || '';
  const isLongCaption = captionText.length > 120;
  const displayCaption = isLongCaption && !isCaptionExpanded ? captionText.slice(0, 120) + '...' : captionText;



  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border-subtle overflow-hidden mb-8 ${isActive ? 'md:h-full flex flex-col' : ''}`}
    >
      <div className={`flex flex-col md:flex-row ${isActive ? 'md:h-full' : ''}`}>
        {/* Main Content Area */}
        <div className={`flex-1 min-w-0 ${isActive ? 'flex flex-col md:h-full' : ''}`}>
          {/* Header */}
          <div className="p-4 md:p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-inner ring-2 ring-white dark:ring-gray-900">
                {post.farmer?.first_name?.[0] || post.farmer?.username?.[0] || 'F'}
              </div>
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-1.5 text-base">
                  {post.farmer?.first_name} {post.farmer?.last_name}
                  {post.is_pinned && <Pin size={14} className="text-orange-500 rotate-45" />}
                </h3>
                <p className="text-xs font-medium text-muted flex items-center gap-1">
                  {post.location && <><MapPin size={12} /> {post.location} • </>}
                  {formattedDate}
                </p>
              </div>
            </div>
            <button className="p-2 text-muted hover:text-foreground hover:bg-surface-elevated rounded-full transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Caption */}
          <div className="px-4 md:px-5 pb-4">
            {post.title && <h4 className="font-bold text-foreground text-lg mb-1">{post.title}</h4>}
            <div className="text-foreground-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {displayCaption}
              {isLongCaption && (
                <button 
                  onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                  className="ml-1 text-orange-500 hover:text-orange-600 font-semibold text-sm focus:outline-none"
                >
                  {isCaptionExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
            
            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3">
                {post.hashtags.map((tag: string, i: number) => (
                  <span key={i} className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-1 rounded-full font-semibold border border-orange-100 dark:border-orange-800/50">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media Area */}
          {currentMedia && (
            <div className={`relative w-full bg-black group ${isActive ? 'flex-1 min-h-0 flex items-center justify-center' : 'aspect-[4/5] sm:aspect-square md:aspect-[4/3]'}`} onClick={handleMediaClick}>
              {isVideo ? (
                <>
                  <video
                    key={currentMedia.id}
                    ref={videoRef}
                    src={currentMedia.file}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-contain sm:object-cover"
                  />
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-20">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </div>
                </>
              ) : (
                <img 
                  key={currentMedia.id}
                  src={currentMedia.file} 
                  alt={post.title} 
                  className={`w-full h-full object-contain sm:object-cover transition-transform duration-500 cursor-pointer ${isImageExpanded ? 'scale-105' : ''}`}
                />
              )}
              
              {post.media.length > 1 && (
                <>
                  <AnimatePresence>
                    {currentMediaIndex > 0 && (
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(p => p - 1); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {currentMediaIndex < post.media.length - 1 && (
                      <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(p => p + 1); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {post.media.map((_: unknown, idx: number) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentMediaIndex ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`} 
                      />
                    ))}
                  </div>

                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white font-medium text-xs px-2.5 py-1 rounded-full z-20 pointer-events-none">
                    {currentMediaIndex + 1}/{post.media.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Commerce Section (Pinned Product) */}
          {post.product && (
            <div className="m-4 md:m-5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-100 dark:border-orange-800/50 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    {post.product.name}
                    {post.product.is_prebookable && (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold tracking-wide uppercase">
                        Pre-book
                      </span>
                    )}
                  </p>
                  <p className="text-xl font-black text-orange-600 dark:text-orange-400 mt-0.5">
                    ₹{post.product.price}
                  </p>
                  <p className="text-xs text-foreground-secondary font-medium mt-0.5">
                    {post.product.market_state === 'READY_FOR_PREBOOKING' ? 'Pre-booking open' : `${post.product.stock_quantity} available`}
                  </p>
                </div>
                {user?.user_type === 'buyer' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onBuyNowClick(post.product!)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none transition-colors whitespace-nowrap"
                  >
                    {post.product.is_prebookable ? (
                      <><Calendar size={18} /> Pre-book</>
                    ) : (
                      <><ShoppingBag size={18} /> Buy Now</>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Upcoming Harvest Progress */}
              {post.product.crop_stage && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl border border-white dark:border-gray-700 shadow-sm mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <Sprout size={14} /> {post.product.crop_stage.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-foreground-secondary flex items-center gap-1 font-semibold">
                      <Calendar size={12} className="text-muted" /> {post.product.harvest_countdown} days to harvest
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                      style={{ width: `${post.product.progress_percentage || 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Action Bar (Horizontal at the bottom) */}
          <div className="md:hidden flex items-center justify-between p-4 border-t border-border-subtle">
            <div className="flex items-center gap-6">
              <ActionButtons 
                isDesktop={false} 
                isLiked={isLiked} 
                likesCount={likesCount} 
                handleLike={handleLike} 
                onCommentClick={onCommentClick} 
                post={post} 
                handleSave={handleSave} 
                isSaved={isSaved} 
              />
            </div>
          </div>
        </div>

        {/* Desktop Action Column (Vertical on the right) */}
        <div className="hidden md:flex flex-col items-center justify-end p-4 border-l border-border-subtle w-20 bg-surface-elevated gap-8">
          <ActionButtons 
            isDesktop={true} 
            isLiked={isLiked} 
            likesCount={likesCount} 
            handleLike={handleLike} 
            onCommentClick={onCommentClick} 
            post={post} 
            handleSave={handleSave} 
            isSaved={isSaved} 
          />
        </div>
      </div>
    </motion.div>
  );
};
