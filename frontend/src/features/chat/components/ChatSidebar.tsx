import React from 'react';
import { Search, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ChatAvatar } from './ChatAvatar';
import { lastMsgPreview } from './MessageBubbleContent';
import type { Conversation, ChatUser } from '@/features/chat';

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
  if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

export const ChatSidebar: React.FC<Props> = ({
  conversations, selectedId, onSelect, loading, search, onSearchChange, onStartNewChat, currentUserId, onlineUsers
}) => {
  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="p-6 border-b border-gray-100/50 dark:border-gray-800/50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Chats</h2>
        <button
          onClick={onStartNewChat}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600 transition-colors"
          title="New Chat"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center p-4">
            <MessageSquare className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-sm text-gray-400">No conversations found</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = conv.participants_details.find((p) => p.id !== currentUserId);
            const isActive = selectedId === conv.id;
            const name = conv.is_group ? conv.group_name : (other?.full_name || other?.username || 'Unknown');
            const icon = conv.is_group ? conv.group_icon_url : other?.profile_picture;
            const isOnline = other && onlineUsers ? onlineUsers.has(other.id) : false;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 dark:border-gray-800/50',
                  isActive ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <ChatAvatar name={name} src={icon} size={48} online={isOnline} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={cn("text-sm font-semibold truncate", isActive ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white")}>
                      {name}
                    </p>
                    {conv.last_message && (
                      <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
                        {fmtDate(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate pr-2">
                      {lastMsgPreview(conv.last_message)}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="h-5 min-w-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse">
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
