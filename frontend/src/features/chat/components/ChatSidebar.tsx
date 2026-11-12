import React from 'react';
import { Search, MessageSquare, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ChatAvatar } from './ChatAvatar';
import { lastMsgPreview } from './MessageBubbleContent';
import type { Conversation } from '@/features/chat';
import { Skeleton } from '@/components/ui';

interface Props {
  conversations: Conversation[];
  selectedId?: number;
  onSelect: (conv: Conversation) => void;
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onStartNewChat: () => void;
  currentUserId?: number;
  onlineUsers?: Set<number>;
}

const fmtDate = (s: string) => {
  const d = new Date(s);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

export const ChatSidebar: React.FC<Props> = ({
  conversations,
  selectedId,
  onSelect,
  loading,
  search,
  onSearchChange,
  onStartNewChat,
  currentUserId,
  onlineUsers,
}) => {
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  return (
    <div className="flex flex-col h-full bg-surface/50 border-r border-border-subtle transition-colors duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-display font-extrabold text-foreground tracking-tight">
            Messages
          </h2>
          {totalUnread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand text-on-brand text-xs font-bold animate-pulse">
              {totalUnread} new
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onStartNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-on-brand hover:bg-brand-hover text-xs font-bold shadow-xs transition-all active:scale-95"
          title="Start new conversation"
          aria-label="Start new conversation"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 sm:px-4 sm:py-3 border-b border-border-subtle/50">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl bg-surface-elevated pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand border border-border-subtle transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-foreground rounded-full"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/40 custom-scrollbar">
        {loading ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-10 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-center p-6 space-y-3">
            <div className="p-3 rounded-full bg-brand-muted/20 text-brand">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {search ? 'No conversations found' : 'No messages yet'}
              </p>
              <p className="text-xs text-muted max-w-[220px] mt-1">
                {search
                  ? `No chat matches "${search}".`
                  : 'Connect directly with local farmers or buyers to discuss fresh produce.'}
              </p>
            </div>
            {!search && (
              <button
                type="button"
                onClick={onStartNewChat}
                className="mt-2 text-xs font-bold text-brand hover:underline"
              >
                + Start a conversation
              </button>
            )}
          </div>
        ) : (
          conversations.map((conv) => {
            const other = conv.participants_details?.find((p) => p.id !== currentUserId);
            const isActive = selectedId === conv.id;
            const name = conv.is_group
              ? conv.group_name
              : other?.full_name || other?.username || 'Unknown';
            const icon = conv.is_group ? conv.group_icon_url : other?.profile_picture;
            const isOnline = other && onlineUsers ? onlineUsers.has(other.id) : false;

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv)}
                className={cn(
                  'w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-all relative border-l-4',
                  isActive
                    ? 'bg-brand-muted/20 border-brand'
                    : 'border-transparent hover:bg-surface-elevated/70'
                )}
              >
                <ChatAvatar name={name} src={icon} size={46} online={isOnline} />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p
                      className={cn(
                        'text-sm font-bold truncate transition-colors',
                        isActive ? 'text-brand' : 'text-foreground'
                      )}
                    >
                      {name}
                    </p>
                    {conv.last_message && (
                      <span className="text-[11px] text-muted ml-2 flex-shrink-0 font-medium">
                        {fmtDate(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <p className="text-xs text-foreground-secondary truncate pr-1 leading-snug">
                      {lastMsgPreview(conv.last_message)}
                    </p>

                    {conv.unread_count > 0 && (
                      <span className="h-5 min-w-5 rounded-full bg-brand text-on-brand text-[10px] font-extrabold flex items-center justify-center px-1.5 shadow-xs flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
