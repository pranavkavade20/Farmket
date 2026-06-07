import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, ShoppingBag, MapPin, MoreHorizontal, Pin, VolumeX, Volume2, Calendar, Sprout } from 'lucide-react';
import { useLikePostMutation, useUnlikePostMutation, useSavePostMutation, useUnsavePostMutation } from '../api/socialApi';
import { useAppSelector } from '@/app/hooks';

interface FeedCardProps {
  post: any;
  onCommentClick: (postId: number) => void;
  onBuyNowClick: (product: any) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, onCommentClick, onBuyNowClick }) => {
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  const currentMedia = post.media && post.media.length > 0 ? post.media[currentMediaIndex] : null;
  const isVideo = currentMedia?.type === 'video';

  // Play/pause video automatically when it comes into view (Intersection Observer)
  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {}); // catch autoplay restrictions
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
        setLikesCount(p => p - 1);
        await unlikePost(post.id).unwrap();
      } else {
        setIsLiked(true);
        setLikesCount(p => p + 1);
        await likePost(post.id).unwrap();
      }
    } catch (err) {
      // Revert on error
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
    } catch (err) {
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            {post.farmer?.first_name?.[0] || post.farmer?.username?.[0] || 'F'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
              {post.farmer?.first_name} {post.farmer?.last_name}
              {post.is_pinned && <Pin size={14} className="text-emerald-500 rotate-45" />}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              {post.location && <><MapPin size={12} /> {post.location} • </>}
              {formattedDate}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media Area */}
      {currentMedia && (
        <div className="relative aspect-[4/5] sm:aspect-square w-full bg-black group" onClick={handleMediaClick}>
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
              {/* Desktop Hover Navigation Arrows */}
              <AnimatePresence>
                {currentMediaIndex > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(p => p - 1); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </motion.button>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {currentMediaIndex < post.media.length - 1 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(p => p + 1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </motion.button>
                )}
              </AnimatePresence>
              
              {/* Mobile Swipe Overlay (Invisible overlay to capture swipes on mobile if desired, but arrows work fine) */}
              
              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {post.media.map((_: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentMediaIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} 
                  />
                ))}
              </div>

              {/* Counter */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full z-20 pointer-events-none">
                {currentMediaIndex + 1}/{post.media.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`flex items-center space-x-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-300 hover:text-red-500'}`}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'drop-shadow-sm' : ''} />
              <span className="font-medium text-sm">{likesCount}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => onCommentClick(post.id)}
              className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition-colors"
            >
              <MessageCircle size={24} />
              <span className="font-medium text-sm">{post.comments_count}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
            >
              <Share2 size={24} />
            </motion.button>
          </div>
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleSave}
            className={`transition-colors ${isSaved ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-500'}`}
          >
            <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Caption & Details */}
        <div className="space-y-2">
          {post.title && <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{post.title}</h4>}
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {post.description}
          </p>
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.hashtags.map((tag: string, i: number) => (
                <span key={i} className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Commerce Section (Pinned Product) */}
          {post.product && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl">
              
              {/* Product Info & Buy/Pre-book Button */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {post.product.name}
                    {post.product.is_prebookable && (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">
                        Pre-book
                      </span>
                    )}
                  </p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{post.product.price}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.product.market_state === 'READY_FOR_PREBOOKING' ? 'Pre-booking open' : `${post.product.stock_quantity} available`}
                  </p>
                </div>
                {user?.user_type === 'buyer' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onBuyNowClick(post.product)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-colors whitespace-nowrap"
                  >
                    {post.product.is_prebookable ? (
                      <><Calendar size={18} /> Pre-book Now</>
                    ) : (
                      <><ShoppingBag size={18} /> Buy Now</>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Upcoming Harvest Progress (If Applicable) */}
              {post.product.crop_stage && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/50 shadow-sm mt-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sprout size={14} /> {post.product.crop_stage.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                      <Calendar size={12} className="text-gray-400" /> {post.product.harvest_countdown} days to harvest
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                      style={{ width: `${post.product.progress_percentage || 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
