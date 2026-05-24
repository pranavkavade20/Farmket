import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, MoreVertical, Trash2, Edit2, Reply, SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ChatMessage } from '@/features/chat';
import { MessageBubbleContent } from './MessageBubbleContent';
import { ChatAvatar } from './ChatAvatar';

const REACTIONS = ['👍','❤️','😂','😮','😢','🙏'];

interface Props {
  msg: ChatMessage;
  isMe: boolean;
  showAvatar?: boolean;
  onReply: (msg: ChatMessage) => void;
  onReact: (msgId: number, emoji: string) => void;
  onEdit?: (msg: ChatMessage) => void;
  onDelete?: (msgId: number) => void;
}

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

export const MessageBubble: React.FC<Props> = ({
  msg, isMe, showAvatar, onReply, onReact, onEdit, onDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactPicker, setShowReactPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupedReactions = msg.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] ?? 0) + 1;
    return acc;
  }, {});

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setShowActions(true), 200);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => { setShowActions(false); setShowReactPicker(false); }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-end gap-2 group', isMe ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar */}
      {!isMe && showAvatar && (
        <ChatAvatar name={msg.sender_details?.full_name || 'User'} src={msg.sender_details?.profile_picture} size={28} />
      )}
      {!isMe && !showAvatar && <div style={{ width: 28 }} />}

      <div className={cn('flex flex-col max-w-xs lg:max-w-sm xl:max-w-md', isMe ? 'items-end' : 'items-start')}>
        {/* Reply preview */}
        {msg.reply_to_details && (
          <div className={cn(
            'text-xs rounded-t-xl px-3 py-1.5 mb-0.5 border-l-4 border-green-400 w-full',
            isMe ? 'bg-green-700/60 text-green-100' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          )}>
            <span className="font-semibold block">{msg.reply_to_details.sender_name}</span>
            <span className="truncate block">{msg.reply_to_details.content}</span>
          </div>
        )}

        {/* Bubble */}
        <div className={cn(
          'relative rounded-2xl px-3.5 py-2.5 shadow-sm',
          isMe
            ? 'bg-green-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700',
          msg.reply_to_details ? 'rounded-t-none' : ''
        )}>
          <MessageBubbleContent msg={msg} isMe={isMe} />

          {/* Time + status */}
          <div className={cn('flex items-center gap-1 mt-1 justify-end', isMe ? 'text-green-200' : 'text-gray-400')}>
            {msg.is_edited && <span className="text-[9px] opacity-70">edited</span>}
            <span className="text-[10px]">{fmtTime(msg.created_at)}</span>
            {isMe && (
              msg.is_read
                ? <CheckCheck className="h-3 w-3 text-blue-300" />
                : <Check className="h-3 w-3 opacity-60" />
            )}
          </div>
        </div>

        {/* Reactions display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex gap-0.5 mt-0.5 flex-wrap">
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(msg.id, emoji)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-1.5 py-0.5 text-xs shadow-sm hover:scale-110 transition-transform"
              >
                {emoji} {count > 1 ? count : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons — appear on hover */}
      <AnimatePresence>
        {showActions && !msg.is_deleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              'flex items-center gap-0.5 self-center',
              isMe ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Emoji react */}
            <div className="relative">
              <button
                onClick={() => setShowReactPicker(v => !v)}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-gray-500 hover:text-yellow-500 transition-colors"
                title="React"
              >
                <SmilePlus className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {showReactPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'absolute bottom-8 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-2 flex gap-1',
                      isMe ? 'right-0' : 'left-0'
                    )}
                  >
                    {REACTIONS.map(e => (
                      <button
                        key={e}
                        onClick={() => { onReact(msg.id, e); setShowReactPicker(false); setShowActions(false); }}
                        className="text-lg hover:scale-125 transition-transform p-1"
                      >
                        {e}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reply */}
            <button
              onClick={() => { onReply(msg); setShowActions(false); }}
              className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-gray-500 hover:text-green-500 transition-colors"
              title="Reply"
            >
              <Reply className="h-3.5 w-3.5" />
            </button>

            {/* Edit (own text messages only) */}
            {isMe && msg.message_type === 'text' && onEdit && (
              <button
                onClick={() => { onEdit(msg); setShowActions(false); }}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-gray-500 hover:text-blue-500 transition-colors"
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Delete */}
            {isMe && onDelete && (
              <button
                onClick={() => { onDelete(msg.id); setShowActions(false); }}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-gray-500 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
