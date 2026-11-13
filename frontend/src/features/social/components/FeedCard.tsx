import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ShoppingBag,
  MapPin,
  Pin,
  VolumeX,
  Volume2,
  Calendar,
  Sprout,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
} from '../api/socialApi';
import { useAppSelector } from '@/app/hooks';
import type { Post, Product } from '@/types';
import { Badge, Button } from '@/components/ui';
import { MEDIA_BASE_URL } from '@/config/env';
import { toast } from 'sonner';

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
  handleShare: () => void;
}

const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE_URL}${url}`;
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isDesktop = false,
  isLiked,
  likesCount,
  handleLike,
  onCommentClick,
  post,
  handleSave,
  isSaved,
  handleShare,
}) => (
  <>
    {/* Like Button */}
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleLike}
      className={`flex ${
        isDesktop ? 'flex-col' : ''
      } items-center justify-center gap-1.5 transition-colors ${
        isLiked ? 'text-danger' : 'text-muted hover:text-danger'
      }`}
      title="Like update"
      aria-label="Like update"
    >
      <div
        className={`p-2 rounded-2xl ${
          isDesktop
            ? isLiked
              ? 'bg-danger/10 text-danger'
              : 'bg-surface hover:bg-surface-elevated text-muted'
            : ''
        }`}
      >
        <Heart
          size={isDesktop ? 20 : 22}
          fill={isLiked ? 'currentColor' : 'none'}
          className={isLiked ? 'drop-shadow-xs' : ''}
        />
      </div>
      <span className="font-bold text-xs select-none">{likesCount}</span>
    </motion.button>

    {/* Comment Button */}
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onCommentClick(post.id)}
      className={`flex ${
        isDesktop ? 'flex-col' : ''
      } items-center justify-center gap-1.5 text-muted hover:text-brand transition-colors`}
      title="View comments"
      aria-label="View comments"
    >
      <div
        className={`p-2 rounded-2xl ${
          isDesktop ? 'bg-surface hover:bg-surface-elevated text-muted' : ''
        }`}
      >
        <MessageCircle size={isDesktop ? 20 : 22} />
      </div>
      <span className="font-bold text-xs select-none">{post.comments_count}</span>
    </motion.button>

    {/* Share Button */}
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleShare}
      className={`flex ${
        isDesktop ? 'flex-col' : ''
      } items-center justify-center gap-1.5 text-muted hover:text-blue-500 transition-colors`}
      title="Share update"
      aria-label="Share update"
    >
      <div
        className={`p-2 rounded-2xl ${
          isDesktop ? 'bg-surface hover:bg-surface-elevated text-muted' : ''
        }`}
      >
        <Share2 size={isDesktop ? 20 : 22} />
      </div>
      {isDesktop && <span className="font-bold text-[11px] select-none">Share</span>}
    </motion.button>

    {/* Bookmark Button */}
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleSave}
      className={`flex ${
        isDesktop ? 'flex-col' : ''
      } items-center justify-center gap-1.5 transition-colors ${
        isSaved ? 'text-brand' : 'text-muted hover:text-brand'
      }`}
      title="Bookmark post"
      aria-label="Bookmark post"
    >
      <div
        className={`p-2 rounded-2xl ${
          isDesktop
            ? isSaved
              ? 'bg-brand/10 text-brand'
              : 'bg-surface hover:bg-surface-elevated text-muted'
            : ''
        }`}
      >
        <Bookmark size={isDesktop ? 20 : 22} fill={isSaved ? 'currentColor' : 'none'} />
      </div>
      {isDesktop && <span className="font-bold text-[11px] select-none">Save</span>}
    </motion.button>
  </>
);

export const FeedCard: React.FC<FeedCardProps> = ({
  post,
  onCommentClick,
  onBuyNowClick,
  isActive = false,
}) => {
  const navigate = useNavigate();
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();

  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isSaved, setIsSaved] = useState(post.is_saved);
  const [isMuted, setIsMuted] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  const currentMedia =
    post.media && post.media.length > 0 ? post.media[currentMediaIndex] : null;
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
        setLikesCount((p) => Math.max(0, p - 1));
        await unlikePost(post.id).unwrap();
      } else {
        setIsLiked(true);
        setLikesCount((p) => p + 1);
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
        toast.info('Post removed from saved collection');
      } else {
        setIsSaved(true);
        await savePost(post.id).unwrap();
        toast.success('Post saved to bookmarks');
      }
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/feed#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Farmket Farmer Story',
          text: post.description || 'Check out this fresh farm update on Farmket',
          url: postUrl,
        });
        return;
      } catch {
        // Fall back to clipboard
      }
    }
    navigator.clipboard.writeText(postUrl);
    toast.success('Post link copied to clipboard!');
  };

  const handleMediaClick = () => {
    if (isVideo) {
      setIsMuted(!isMuted);
    }
  };

  const farmerName =
    post.farmer?.first_name || post.farmer?.username
      ? `${post.farmer?.first_name || ''} ${post.farmer?.last_name || ''}`.trim()
      : 'Local Producer';
  const farmerInitials = (farmerName || 'F').charAt(0).toUpperCase();

  const captionText = post.description || '';
  const isLongCaption = captionText.length > 140;
  const displayCaption =
    isLongCaption && !isCaptionExpanded ? `${captionText.slice(0, 140)}...` : captionText;

  const navigateToFarmerProfile = () => {
    if (post.farmer?.id) {
      navigate(`/farmers/${post.farmer.id}`);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-surface rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 border border-border-subtle overflow-hidden mb-6 ${
        isActive ? 'ring-2 ring-brand/30' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Main Feed Content Column */}
        <div className="flex-1 min-w-0">
          {/* Farmer Header Strip */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border-subtle/50">
            <div
              className="flex items-center space-x-3 cursor-pointer group/author"
              onClick={navigateToFarmerProfile}
            >
              {/* Farmer Avatar */}
              <div className="h-11 w-11 rounded-full bg-brand text-on-brand flex items-center justify-center font-bold text-base shadow-xs ring-2 ring-background transition-transform group-hover/author:scale-105">
                {post.farmer?.profile_picture ? (
                  <img
                    src={resolveMediaUrl(post.farmer.profile_picture)}
                    alt={farmerName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{farmerInitials}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-foreground group-hover/author:text-brand transition-colors text-sm sm:text-base flex items-center gap-1.5">
                    {farmerName}
                  </h3>
                  <Badge variant="success" size="sm" icon={<ShieldCheck className="h-3 w-3 stroke-[2.2]" />} className="py-0 px-1.5 text-[10px]">
                    <span className="hidden sm:inline">Verified Producer</span>
                  </Badge>
                  {post.is_pinned && (
                    <span title="Pinned Announcement">
                      <Pin size={13} className="text-brand rotate-45" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  {post.location && (
                    <>
                      <MapPin size={12} className="text-muted flex-shrink-0" />
                      <span className="truncate max-w-[130px] sm:max-w-[180px]">
                        {post.location}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatTimeAgo(post.created_at)}</span>
                </p>
              </div>
            </div>

            {/* Visit Storefront Quick Action */}
            {post.farmer?.id && (
              <button
                type="button"
                onClick={navigateToFarmerProfile}
                className="text-xs font-bold text-brand hover:underline hidden sm:block"
              >
                View Farm
              </button>
            )}
          </div>

          {/* Caption & Post Body */}
          <div className="px-4 sm:px-5 py-4 space-y-2">
            {post.title && (
              <h4 className="font-extrabold text-foreground text-base sm:text-lg tracking-tight">
                {post.title}
              </h4>
            )}

            <div className="text-foreground-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {displayCaption}
              {isLongCaption && (
                <button
                  type="button"
                  onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                  className="ml-1.5 text-brand hover:text-brand-hover font-bold text-xs focus:outline-none"
                >
                  {isCaptionExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Hashtag chips */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {post.hashtags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs text-brand bg-brand-muted/20 px-2.5 py-0.5 rounded-full font-bold border border-brand/20 hover:bg-brand-muted/40 transition-colors cursor-pointer select-none"
                  >
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media Showcase Area */}
          {currentMedia && (
            <div
              className="relative w-full bg-surface-elevated overflow-hidden group select-none aspect-[4/3] sm:aspect-[16/10]"
              onClick={handleMediaClick}
            >
              {isVideo ? (
                <>
                  <video
                    key={currentMedia.id}
                    ref={videoRef}
                    src={resolveMediaUrl(currentMedia.file)}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg transition-transform active:scale-90 z-20"
                    title={isMuted ? 'Unmute audio' : 'Mute audio'}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </>
              ) : (
                <img
                  key={currentMedia.id}
                  src={resolveMediaUrl(currentMedia.file)}
                  alt={post.title || 'Produce update'}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              )}

              {/* Multi-Media Navigation Arrows */}
              {post.media.length > 1 && (
                <>
                  <AnimatePresence>
                    {currentMediaIndex > 0 && (
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentMediaIndex((p) => p - 1);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-md transition-all z-20 shadow-md"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {currentMediaIndex < post.media.length - 1 && (
                      <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentMediaIndex((p) => p + 1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-md transition-all z-20 shadow-md"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Pagination Dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {post.media.map((_, idx: number) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 shadow-xs ${
                          idx === currentMediaIndex ? 'bg-white w-5' : 'bg-white/50 w-1.5'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Counter Badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white font-bold text-[11px] px-2.5 py-1 rounded-full z-20 pointer-events-none">
                    {currentMediaIndex + 1} / {post.media.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Commerce Section: Pinned Harvest Product */}
          {post.product && (
            <div className="m-4 sm:m-5 bg-surface-elevated/70 border border-border-subtle p-4 rounded-2xl shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-foreground truncate">
                      {post.product.name}
                    </p>
                    {post.product.is_prebookable && (
                      <Badge variant="submitted" size="sm" className="font-extrabold uppercase">
                        <span>Pre-book</span>
                      </Badge>
                    )}
                  </div>

                  <p className="text-lg font-black text-brand mt-0.5">
                    ₹{post.product.price}
                    <span className="text-xs font-medium text-muted ml-1">
                      / {post.product.unit || 'kg'}
                    </span>
                  </p>

                  <p className="text-xs text-muted font-medium mt-0.5">
                    {post.product.market_state === 'READY_FOR_PREBOOKING'
                      ? 'Harvest pre-booking currently open'
                      : `${post.product.stock_quantity ?? 0} in stock ready for dispatch`}
                  </p>
                </div>

                {user?.user_type === 'buyer' && (
                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => onBuyNowClick(post.product!)}
                    leftIcon={
                      post.product.is_prebookable ? (
                        <Calendar size={16} />
                      ) : (
                        <ShoppingBag size={16} />
                      )
                    }
                    className="w-full sm:w-auto"
                  >
                    {post.product.is_prebookable ? 'Pre-Book Harvest' : 'Buy Fresh'}
                  </Button>
                )}
              </div>

              {/* Crop Stage & Harvest Countdown Progress */}
              {post.product.crop_stage && (
                <div className="bg-surface p-3 rounded-xl border border-border-subtle mt-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-brand flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Sprout size={14} /> {post.product.crop_stage.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted flex items-center gap-1 font-semibold text-[11px]">
                      <Calendar size={12} />
                      {post.product.harvest_countdown ?? 0} days to harvest
                    </span>
                  </div>

                  <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden border border-border-subtle/50">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, post.product.progress_percentage || 0)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Action Bar (Horizontal at the bottom) */}
          <div className="md:hidden flex items-center justify-between p-3.5 px-5 border-t border-border-subtle bg-surface">
            <div className="flex items-center justify-between w-full">
              <ActionButtons
                isDesktop={false}
                isLiked={isLiked}
                likesCount={likesCount}
                handleLike={handleLike}
                onCommentClick={onCommentClick}
                post={post}
                handleSave={handleSave}
                isSaved={isSaved}
                handleShare={handleShare}
              />
            </div>
          </div>
        </div>

        {/* Desktop Vertical Action Column (on the right) */}
        <div className="hidden md:flex flex-col items-center justify-center p-4 border-l border-border-subtle w-20 bg-surface-elevated/40 gap-6">
          <ActionButtons
            isDesktop={true}
            isLiked={isLiked}
            likesCount={likesCount}
            handleLike={handleLike}
            onCommentClick={onCommentClick}
            post={post}
            handleSave={handleSave}
            isSaved={isSaved}
            handleShare={handleShare}
          />
        </div>
      </div>
    </motion.article>
  );
};
