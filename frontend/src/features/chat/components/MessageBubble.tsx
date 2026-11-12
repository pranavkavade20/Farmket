import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, Trash2, Edit2, Reply, SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ChatMessage } from '@/features/chat';
import { MessageBubbleContent } from './MessageBubbleContent';
import { ChatAvatar } from './ChatAvatar';

const QUICK_REACTIONS = ['👍', '❤️', '🌾', '🥦', '👏', '🔥'];

interface Props {
  msg: ChatMessage;
  isMe: boolean;
  showAvatar?: boolean;
  currentUserId?: number;
  onReply: (msg: ChatMessage) => void;
  onReact: (msgId: number, emoji: string) => void;
  onEdit?: (msg: ChatMessage) => void;
  onDelete?: (msgId: number) => void;
}

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

export const MessageBubble: React.FC<Props> = ({
  msg,
  isMe,
  showAvatar,
  currentUserId,
  onReply,
  onReact,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactPicker, setShowReactPicker] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupedReactions = (msg.reactions || []).reduce<
    Record<string, { count: number; reactedByMe: boolean }>
  >((acc, r) => {
    if (!acc[r.reaction]) {
      acc[r.reaction] = { count: 0, reactedByMe: false };
    }
    acc[r.reaction].count += 1;
    if (r.user === currentUserId) {
      acc[r.reaction].reactedByMe = true;
    }
    return acc;
  }, {});

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setShowActions(true), 150);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => {
      setShowActions(false);
      setShowReactPicker(false);
    }, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'flex items-end gap-2.5 group relative',
        isMe ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Sender Avatar */}
      {!isMe && showAvatar && (
        <ChatAvatar
          name={msg.sender_details?.full_name || 'Farmer'}
          src={msg.sender_details?.profile_picture}
          size={32}
        />
      )}
      {!isMe && !showAvatar && <div style={{ width: 32 }} className="flex-shrink-0" />}

      {/* Message Column */}
      <div className={cn('flex flex-col max-w-[82%] sm:max-w-md lg:max-w-lg', isMe ? 'items-end' : 'items-start')}>
        {/* Reply Quote Block */}
        {msg.reply_to_details && (
          <div
            className={cn(
              'text-xs rounded-t-xl px-3 py-1.5 mb-0.5 border-l-3 w-full backdrop-blur-xs select-none',
              isMe
                ? 'bg-brand-hover/40 border-on-brand text-on-brand/90'
                : 'bg-surface-elevated border-brand text-foreground-secondary'
            )}
          >
            <span className="font-bold block text-[11px] truncate">
              {msg.reply_to_details.sender_name}
            </span>
            <span className="truncate block text-[11px] opacity-85">
              {msg.reply_to_details.content}
            </span>
          </div>
        )}

        {/* Message Bubble Card */}
        <div
          className={cn(
            'relative px-4 py-2.5 shadow-xs transition-shadow duration-200',
            isMe
              ? 'bg-brand text-on-brand rounded-2xl rounded-br-xs'
              : 'bg-surface text-foreground rounded-2xl rounded-bl-xs border border-border-subtle',
            msg.reply_to_details ? 'rounded-t-none' : ''
          )}
        >
          <MessageBubbleContent msg={msg} isMe={isMe} />

          {/* Time & Read Receipts */}
          <div
            className={cn(
              'flex items-center gap-1.5 mt-1 justify-end select-none text-[10px] font-medium tracking-tight',
              isMe ? 'text-on-brand/80' : 'text-muted'
            )}
          >
            {msg.is_edited && <span className="opacity-75 italic text-[9px]">edited</span>}
            <span>{fmtTime(msg.created_at)}</span>
            {isMe && (
              <span>
                {msg.is_read ? (
                  <CheckCheck className="h-3.5 w-3.5 text-on-brand drop-shadow-xs" />
                ) : (
                  <Check className="h-3.5 w-3.5 opacity-70" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Chips */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap items-center">
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(msg.id, emoji)}
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold flex items-center gap-1 transition-all duration-150 border',
                  data.reactedByMe
                    ? 'bg-brand-muted/40 border-brand text-brand ring-1 ring-brand/30'
                    : 'bg-surface border-border-subtle text-foreground hover:bg-surface-elevated'
                )}
                title={`Reacted ${data.count} time(s)`}
              >
                <span>{emoji}</span>
                {data.count > 1 && <span className="text-[10px] font-bold">{data.count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Bar on Hover */}
      <AnimatePresence>
        {showActions && !msg.is_deleted && !msg.deleted_for_everyone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'flex items-center gap-0.5 self-center bg-surface border border-border-subtle rounded-full shadow-md p-1 z-10',
              isMe ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Quick Emoji React Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowReactPicker((v) => !v)}
                className="p-1.5 rounded-full hover:bg-surface-elevated text-muted hover:text-amber-500 transition-colors"
                title="Add reaction"
                aria-label="Add reaction"
              >
                <SmilePlus className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {showReactPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                      'absolute bottom-full mb-1.5 z-50 bg-surface border border-border-subtle rounded-2xl shadow-xl p-1.5 flex gap-1 items-center',
                      isMe ? 'right-0' : 'left-0'
                    )}
                  >
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onReact(msg.id, emoji);
                          setShowReactPicker(false);
                          setShowActions(false);
                        }}
                        className="text-base hover:scale-125 transition-transform p-1 rounded-lg hover:bg-surface-elevated"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reply */}
            <button
              type="button"
              onClick={() => {
                onReply(msg);
                setShowActions(false);
              }}
              className="p-1.5 rounded-full hover:bg-surface-elevated text-muted hover:text-brand transition-colors"
              title="Reply"
              aria-label="Reply to message"
            >
              <Reply className="h-4 w-4" />
            </button>

            {/* Edit (Own text messages only) */}
            {isMe && msg.message_type === 'text' && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(msg);
                  setShowActions(false);
                }}
                className="p-1.5 rounded-full hover:bg-surface-elevated text-muted hover:text-blue-500 transition-colors"
                title="Edit message"
                aria-label="Edit message"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}

            {/* Delete (Own messages only) */}
            {isMe && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(msg.id);
                  setShowActions(false);
                }}
                className="p-1.5 rounded-full hover:bg-surface-elevated text-muted hover:text-danger transition-colors"
                title="Delete message"
                aria-label="Delete message"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
