import { apiClient } from './client';

export interface ChatUser {
  id: number;
  username: string;
  full_name: string;
  profile_picture: string | null;
  user_type?: string;
  is_online?: boolean;
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
  created_at: string;
  updated_at: string;
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

export const fetchConversations = async (): Promise<Conversation[]> => {
  const res = await apiClient.get<{ results: Conversation[] }>('chat/conversations/');
  return res.data.results ?? (res.data as unknown as Conversation[]);
};

export const fetchMessages = async (conversationId: number, page = 1): Promise<ChatMessage[]> => {
  const res = await apiClient.get<{ results: ChatMessage[] }>(
    `chat/messages/?conversation=${conversationId}&ordering=created_at&page=${page}`
  );
  return res.data.results ?? (res.data as unknown as ChatMessage[]);
};

export const sendMessage = async (
  conversationId: number,
  content: string,
): Promise<ChatMessage> => {
  const res = await apiClient.post<ChatMessage>('chat/messages/', {
    conversation: conversationId,
    content,
    message_type: 'text',
  });
  return res.data;
};

export const markAsRead = async (conversationId: number): Promise<void> => {
  await apiClient.post(`chat/conversations/${conversationId}/mark_read/`);
};
