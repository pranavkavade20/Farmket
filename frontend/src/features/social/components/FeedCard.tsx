import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, ShoppingBag, MapPin, MoreHorizontal, Pin, VolumeX, Volume2 } from 'lucide-react';
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  // Play/pause video automatically when it comes into view (Intersection Observer)
  useEffect(() => {
    if (!videoRef.current) return;
    
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
  }, [post.media]);

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

  const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
  const isVideo = firstMedia?.type === 'video';

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
      {firstMedia && (
        <div className="relative aspect-[4/5] sm:aspect-square w-full bg-black group cursor-pointer" onClick={handleMediaClick}>
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={firstMedia.file}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </div>
            </>
          ) : (
            <img 
              src={firstMedia.file} 
              alt={post.title} 
              className={`w-full h-full object-cover transition-transform duration-500 ${isImageExpanded ? 'scale-105' : ''}`}
            />
          )}
          
          {post.media.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full">
              1/{post.media.length}
            </div>
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
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{post.product.name}</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{post.product.price}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {post.product.stock_quantity} available
                </p>
              </div>
              {user?.user_type === 'buyer' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onBuyNowClick(post.product)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-colors"
                >
                  <ShoppingBag size={18} />
                  Buy Now
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
