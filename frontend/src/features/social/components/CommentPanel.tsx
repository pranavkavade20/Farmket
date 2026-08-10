import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { useGetCommentsQuery, useAddCommentMutation } from '../api/socialApi';

interface CommentPanelProps {
  postId: number | null;
  isOpen: boolean;
  onClose: () => void;
  isInline?: boolean;
}

interface CommentType {
  id: number | string;
  user?: {
    first_name?: string;
    username?: string;
  };
  created_at: string;
  content: string;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({ postId, isOpen, onClose, isInline = false }) => {
  const { data: comments, isLoading } = useGetCommentsQuery(postId as number, {
    skip: !isOpen || postId === null,
  });
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [commentText, setCommentText] = useState('');

  // Lock body scroll when drawer is open (only if not inline on desktop)
  useEffect(() => {
    if (isOpen) {
      // On mobile we always want to lock scroll. 
      // A simple way is to always lock if not inline, or if screen is small.
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
    if (!commentText.trim() || postId === null) return;
    
    try {
      await addComment({ post: postId, content: commentText }).unwrap();
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const renderComment = (comment: CommentType) => (
    <div key={comment.id} className="flex gap-3 mb-6">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-inner">
        {comment.user?.first_name?.[0] || comment.user?.username?.[0] || 'U'}
      </div>
      <div className="flex-1">
        <div className="bg-surface-elevated rounded-2xl p-3 shadow-sm border border-border-subtle">
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-semibold text-sm text-foreground">
              {comment.user?.first_name || comment.user?.username}
            </span>
            <span className="text-xs text-muted">
              {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <p className="text-sm text-foreground-secondary whitespace-pre-wrap">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-2 ml-1">
          <button className="text-xs font-medium text-muted hover:text-orange-500 transition-colors">Like</button>
          <button className="text-xs font-medium text-muted hover:text-orange-500 transition-colors">Reply</button>
        </div>
      </div>
    </div>
  );

  const panelClasses = isInline
    ? "fixed inset-x-0 bottom-0 z-[70] h-[85vh] rounded-t-3xl md:relative md:inset-auto md:h-full md:w-full md:rounded-3xl md:z-10 bg-surface shadow-2xl md:shadow-sm border-t md:border border-border-subtle overflow-hidden flex flex-col"
    : "fixed inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[420px] lg:w-[480px] h-[85vh] md:h-full bg-surface shadow-2xl z-[70] flex flex-col md:rounded-l-2xl rounded-t-3xl md:rounded-tr-none overflow-hidden border-l border-border-subtle";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (hidden on desktop if inline) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] ${isInline ? 'md:hidden' : ''}`}
          />

          {/* Drawer / Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 1, x: 0 }}
            animate={{ y: 0, opacity: 1, x: 0 }}
            exit={{ y: '100%', opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={panelClasses}
          >
            {/* Mobile handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1 w-full" onClick={onClose}>
              <div className="w-12 h-1.5 bg-border-strong rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle sticky top-0 bg-surface/80 backdrop-blur-md z-10">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <MessageCircle className="text-orange-500" size={20} />
                Comments
              </h3>
              <button
                className="p-2 text-muted hover:text-foreground hover:bg-surface-elevated rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-orange-500" size={28} />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="flex flex-col">
                  {comments.map(renderComment)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
                  <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-2">
                    <MessageCircle size={28} className="text-muted" />
                  </div>
                  <p className="font-medium text-foreground-secondary">No comments yet</p>
                  <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border-subtle bg-surface sticky bottom-0 z-10">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-surface-elevated border-none rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm text-foreground placeholder-muted"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isAdding}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 disabled:opacity-50 disabled:hover:text-orange-500 transition-colors"
                  >
                    {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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
