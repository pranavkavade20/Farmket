import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageCircle, Heart, CornerDownRight } from 'lucide-react';
import { useGetCommentsQuery, useAddCommentMutation } from '../api/socialApi';
import { useAppSelector } from '@/app/hooks';
import { MEDIA_BASE_URL } from '@/config/env';
import { toast } from 'sonner';

interface CommentPanelProps {
  postId: number | null;
  isOpen: boolean;
  onClose: () => void;
  isInline?: boolean;
}

interface CommentType {
  id: number | string;
  user?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_picture?: string;
  };
  created_at: string;
  content: string;
}

const resolveProfilePic = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE_URL}${url}`;
};

export const CommentPanel: React.FC<CommentPanelProps> = ({
  postId,
  isOpen,
  onClose,
  isInline = false,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { data: comments, isLoading } = useGetCommentsQuery(postId as number, {
    skip: !isOpen || postId === null,
  });
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [commentText, setCommentText] = useState('');
  const [likedComments, setLikedComments] = useState<Set<number | string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const isMobile = window.innerWidth < 768;
      if (!isInline || isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isInline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || postId === null || isAdding) return;

    try {
      await addComment({ post: postId, content: trimmed }).unwrap();
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to post comment. Please try again.');
    }
  };

  const toggleCommentLike = (commentId: number | string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const renderComment = (comment: CommentType) => {
    const isLiked = likedComments.has(comment.id);
    const authorName =
      comment.user?.first_name || comment.user?.username || 'Community Member';
    const initials = authorName.charAt(0).toUpperCase();
    const profilePic = resolveProfilePic(comment.user?.profile_picture);

    return (
      <div key={comment.id} className="flex gap-3 mb-5 group">
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-brand-muted/30 border border-brand/20 flex-shrink-0 flex items-center justify-center text-brand font-bold text-xs shadow-xs overflow-hidden">
          {profilePic ? (
            <img src={profilePic} alt={authorName} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Bubble */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface-elevated rounded-2xl p-3.5 shadow-xs border border-border-subtle">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                {authorName}
              </span>
              <span className="text-[10px] text-muted flex-shrink-0">
                {new Date(comment.created_at).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* Comment micro-actions */}
          <div className="flex items-center gap-4 mt-1.5 ml-2 text-[11px] font-semibold text-muted">
            <button
              type="button"
              onClick={() => toggleCommentLike(comment.id)}
              className={`flex items-center gap-1 hover:text-danger transition-colors ${
                isLiked ? 'text-danger' : ''
              }`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCommentText(`@${comment.user?.username || ''} `);
                inputRef.current?.focus();
              }}
              className="flex items-center gap-1 hover:text-brand transition-colors"
            >
              <CornerDownRight className="h-3 w-3" />
              <span>Reply</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const panelClasses = isInline
    ? 'fixed inset-x-0 bottom-0 z-[70] h-[85vh] rounded-t-3xl md:relative md:inset-auto md:h-full md:w-full md:rounded-3xl md:z-10 bg-surface shadow-2xl md:shadow-xs border-t md:border border-border-subtle overflow-hidden flex flex-col'
    : 'fixed inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[420px] lg:w-[460px] h-[85vh] md:h-full bg-surface shadow-2xl z-[70] flex flex-col md:rounded-l-3xl rounded-t-3xl md:rounded-tr-none overflow-hidden border-l border-border-subtle';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] ${
              isInline ? 'md:hidden' : ''
            }`}
          />

          {/* Drawer / Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 1, x: 0 }}
            animate={{ y: 0, opacity: 1, x: 0 }}
            exit={{ y: '100%', opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={panelClasses}
          >
            {/* Mobile Drag Pill */}
            <div
              className="md:hidden flex justify-center pt-3 pb-1 w-full cursor-pointer"
              onClick={onClose}
            >
              <div className="w-12 h-1 bg-border-strong rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border-subtle sticky top-0 bg-surface/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-muted/30 text-brand">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Comments</h3>
                  <span className="text-xs text-muted">
                    {comments?.length ?? 0} {comments?.length === 1 ? 'thought' : 'thoughts'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-muted hover:text-foreground hover:bg-surface-elevated rounded-xl transition-colors"
                title="Close comments"
                aria-label="Close comments"
              >
                <X size={18} />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Loader2 className="animate-spin text-brand" size={28} />
                  <p className="text-xs text-muted">Loading comments...</p>
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="flex flex-col">{comments.map(renderComment)}</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted space-y-3">
                  <div className="w-14 h-14 bg-surface-elevated rounded-2xl flex items-center justify-center border border-border-subtle">
                    <MessageCircle size={24} className="text-muted" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">No comments yet</p>
                    <p className="text-xs text-muted max-w-[220px] mt-0.5">
                      Be the first to share your thoughts or ask the farmer about this harvest!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Comment Input Form */}
            <div className="p-3 sm:p-4 border-t border-border-subtle bg-surface sticky bottom-0 z-10 shadow-xs">
              <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
                {currentUser && (
                  <div className="h-8 w-8 rounded-full bg-brand-muted/30 text-brand flex items-center justify-center text-xs font-bold border border-brand/20 flex-shrink-0">
                    {(currentUser.first_name || currentUser.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-surface-elevated border border-border-subtle rounded-2xl py-2.5 pl-4 pr-11 text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isAdding}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-brand text-on-brand hover:bg-brand-hover disabled:opacity-40 disabled:pointer-events-none transition-all"
                    title="Send comment"
                    aria-label="Send comment"
                  >
                    {isAdding ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
