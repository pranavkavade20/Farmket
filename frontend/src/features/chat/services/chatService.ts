import api from '@/lib/api';
import { MEDIA_BASE_URL } from '@/config/env';

// ── Base URL for media ─────────────────────────────────────────────────────────
const MEDIA_BASE = MEDIA_BASE_URL;

export function resolveMedia(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
}

// ── Types aligned with Django chat models ─────────────────────────────────────
export interface ChatUser {
  id: number;
  username: string;
  full_name: string;
  profile_picture: string | null;
  user_type?: string;
  is_online?: boolean;
}

export interface MessageReaction {
  id: number;
  message: number;
  user: number;
  reaction: string;
}

export interface ReplyDetails {
  id: number;
  content: string;
  sender_name: string;
  message_type: string;
}

export interface ChatMessage {
  id: number;
  conversation: number;
  sender: number;
  sender_details: ChatUser;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'product';
  content: string;
  is_read: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  deleted_for_everyone: boolean;
  reply_to: number | null;
  reply_to_details: ReplyDetails | null;
  reactions: MessageReaction[];
  created_at: string;
  updated_at: string;
  file_url: string | null;
  file_name: string | null;
  // Location
  latitude?: number;
  longitude?: number;
  location_name?: string;
}

export interface Conversation {
  id: number;
  participants: number[];
  participants_details: ChatUser[];
  created_at: string;
  updated_at: string;
  is_group: boolean;
  group_name: string;
  group_icon: string | null;
  group_icon_url: string | null;
  last_message: ChatMessage | null;
  unread_count: number;
}

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const res = await api.get<{ results: Conversation[] }>('/chat/conversations/');
    return res.data.results ?? (res.data as unknown as Conversation[]);
  },

  getOrCreateConversation: async (userId: number): Promise<Conversation> => {
    const res = await api.post<Conversation>('/chat/conversations/', {
      participants: [userId],
    });
    return res.data;
  },

  getMessages: async (conversationId: number, page = 1): Promise<ChatMessage[]> => {
    const res = await api.get<{ results: ChatMessage[] }>(
      `/chat/messages/?conversation=${conversationId}&ordering=created_at&page=${page}`
    );
    return res.data.results ?? (res.data as unknown as ChatMessage[]);
  },

  sendMessage: async (
    conversationId: number,
    content: string,
    replyToId?: number | null
  ): Promise<ChatMessage> => {
    const res = await api.post<ChatMessage>('/chat/messages/', {
      conversation: conversationId,
      content,
      message_type: 'text',
      ...(replyToId ? { reply_to: replyToId } : {}),
    });
    return res.data;
  },

  sendMedia: async (
    conversationId: number,
    file: File,
    messageType: 'image' | 'video' | 'audio' | 'document',
    content = ''
  ): Promise<ChatMessage> => {
    const form = new FormData();
    form.append('conversation', String(conversationId));
    form.append('message_type', messageType);
    form.append('file', file);
    form.append('content', content);
    const res = await api.post<ChatMessage>('/chat/messages/upload_media/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  markAsRead: async (conversationId: number): Promise<void> => {
    await api.post(`/chat/conversations/${conversationId}/mark_read/`);
  },

  searchUsers: async (q: string): Promise<ChatUser[]> => {
    const res = await api.get<ChatUser[]>(`/chat/conversations/search_users/?q=${encodeURIComponent(q)}`);
    return res.data;
  },

  reactToMessage: async (messageId: number, reaction: string): Promise<void> => {
    await api.post(`/chat/messages/${messageId}/react/`, { reaction });
  },

  removeReaction: async (messageId: number): Promise<void> => {
    await api.delete(`/chat/messages/${messageId}/unreact/`);
  },

  deleteMessage: async (messageId: number): Promise<void> => {
    await api.patch(`/chat/messages/${messageId}/`, { is_deleted: true, deleted_for_everyone: true });
  },

  editMessage: async (messageId: number, content: string): Promise<ChatMessage> => {
    const res = await api.patch<ChatMessage>(`/chat/messages/${messageId}/`, {
      content,
      is_edited: true,
    });
    return res.data;
  },
};
