import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { chatService, type Conversation, type ChatMessage, type ChatUser } from '@/services/chatService';
import { useAuth } from '@/store/AuthContext';
import { MessageSquare, MoreVertical, Phone, Video, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatAvatar } from '@/components/chat/ChatAvatar';
import { NewChatModal } from '@/components/chat/NewChatModal';

const Chat = () => {
  useSEO({ title: 'Messages | Farmket', description: 'Chat with farmers and buyers on Farmket.' });

  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [typingUser, setTypingUser] = useState<{ id: number; name: string } | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch Conversations ───────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConv(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── WebSocket Logic ────────────────────────────────────────────────────────
  const setupWebSocket = useCallback((convId: number) => {
    if (wsRef.current) wsRef.current.close();

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${convId}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      handleWsEvent(data);
    };

    ws.onclose = () => {
      console.log('WS Disconnected');
    };
  }, []);

  const handleWsEvent = (data: any) => {
    switch (data.type) {
      case 'chat_message':
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        // Update sidebar last message
        setConversations(prev => prev.map(c => 
          c.id === data.message.conversation ? { ...c, last_message: data.message } : c
        ));
        break;
      
      case 'typing_status':
        if (data.user_id !== user?.id) {
          setTypingUser(data.is_typing ? { id: data.user_id, name: data.username } : null);
        }
        break;

      case 'user_status':
        setOnlineUsers(prev => {
          const next = new Set(prev);
          if (data.status === 'online') next.add(data.user_id);
          else next.delete(data.user_id);
          return next;
        });
        break;

      case 'message_read':
        setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, is_read: true } : m));
        break;

      case 'message_reaction':
        setMessages(prev => prev.map(m => {
          if (m.id !== data.message_id) return m;
          const filtered = m.reactions.filter(r => r.user !== data.user_id);
          return {
            ...m,
            reactions: [...filtered, { id: Date.now(), message: m.id, user: data.user_id, reaction: data.reaction }]
          };
        }));
        break;

      case 'message_deleted':
        setMessages(prev => prev.map(m => 
          m.id === data.message_id ? { ...m, is_deleted: true, deleted_for_everyone: data.delete_for_everyone } : m
        ));
        break;

      case 'message_edited':
        setMessages(prev => prev.map(m => 
          m.id === data.message_id ? { ...m, content: data.content, is_edited: true } : m
        ));
        break;
    }
  };

  // ── Load Messages on Select ────────────────────────────────────────────────
  useEffect(() => {
    if (!selected) return;

    setMessages([]);
    setLoadingMsgs(true);
    setReplyingTo(null);

    chatService.getMessages(selected.id)
      .then(setMessages)
      .catch(() => toast.error('Error loading messages'))
      .finally(() => setLoadingMsgs(false));

    setupWebSocket(selected.id);
    chatService.markAsRead(selected.id).then(() => {
      setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, unread_count: 0 } : c));
    });

    return () => wsRef.current?.close();
  }, [selected, setupWebSocket]);

  // ── Scroll to Bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleSendMessage = async (content: string) => {
    if (!selected) return;
    setSending(true);
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          message: content,
          reply_to: replyingTo?.id
        }));
      } else {
        const msg = await chatService.sendMessage(selected.id, content, replyingTo?.id);
        setMessages(prev => [...prev, msg]);
      }
      setReplyingTo(null);
    } catch (err) {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleSendFile = async (file: File, type: any) => {
    if (!selected) return;
    setSending(true);
    try {
      const msg = await chatService.sendMedia(selected.id, file, type);
      setMessages(prev => [...prev, msg]);
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setSending(false);
    }
  };

  const handleReact = (msgId: number, emoji: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message_reaction', message_id: msgId, reaction: emoji }));
    } else {
      chatService.reactToMessage(msgId, emoji);
    }
  };

  const handleDelete = (msgId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'delete_message', message_id: msgId, delete_for_everyone: true }));
    } else {
      chatService.deleteMessage(msgId);
    }
  };

  const handleStartNewChat = async (targetUser: ChatUser) => {
    setIsNewChatOpen(false);
    try {
      const conv = await chatService.getOrCreateConversation(targetUser.id);
      setConversations(prev => {
        if (prev.some(c => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      setSelected(conv);
    } catch (err) {
      toast.error('Failed to start chat');
    }
  };

  const filteredConversations = conversations.filter(c => {
    const other = c.participants_details.find(p => p.id !== user?.id);
    const name = c.is_group ? c.group_name : (other?.full_name || other?.username || '');
    return name.toLowerCase().includes(sidebarSearch.toLowerCase());
  });

  const groupedMessages = messages.reduce((acc: any[], msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!acc.length || acc[acc.length - 1].date !== date) {
      acc.push({ date, msgs: [msg] });
    } else {
      acc[acc.length - 1].msgs.push(msg);
    }
    return acc;
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white dark:bg-gray-900 h-full rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex">
        
        {/* Sidebar */}
        <div className={cn("w-full md:w-[350px] flex-shrink-0 border-r border-gray-100 dark:border-gray-800 md:block", selected ? "hidden" : "block")}>
          <ChatSidebar
            loading={loadingConv}
            conversations={filteredConversations}
            selectedId={selected?.id}
            onSelect={setSelected}
            search={sidebarSearch}
            onSearchChange={setSidebarSearch}
            onStartNewChat={() => setIsNewChatOpen(true)}
            currentUserId={user?.id}
          />
        </div>

        {/* Chat Area */}
        <div className={cn("flex-1 flex flex-col min-w-0 bg-[#f0f2f5] dark:bg-[#0b141a] relative md:flex", !selected ? "hidden" : "flex")}>
          {selected ? (
            <>
              {/* Top Bar */}
              <div className="h-16 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected(null)} className="md:hidden p-2 -ml-2 text-gray-500">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  {(() => {
                    const other = selected.participants_details.find(p => p.id !== user?.id);
                    const name = selected.is_group ? selected.group_name : (other?.full_name || other?.username || 'Unknown');
                    const icon = selected.is_group ? selected.group_icon_url : other?.profile_picture;
                    const isOnline = other ? onlineUsers.has(other.id) : false;
                    
                    return (
                      <>
                        <ChatAvatar name={name} src={icon} size={40} online={isOnline} />
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{name}</h3>
                          <p className="text-[11px] text-green-500 font-medium">
                            {typingUser ? `${typingUser.name} is typing...` : (isOnline ? 'Online' : 'Last seen recently')}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><Video className="h-5 w-5" /></button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><Phone className="h-5 w-5" /></button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><Info className="h-5 w-5" /></button>
                </div>
              </div>

              {/* Messages List */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
                style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay' }}
              >
                {loadingMsgs ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                    <p className="text-gray-500 text-sm">Loading messages...</p>
                  </div>
                ) : groupedMessages.map(group => (
                  <div key={group.date} className="space-y-4">
                    <div className="flex justify-center">
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-gray-500 shadow-sm uppercase tracking-wider border border-gray-100 dark:border-gray-700">
                        {group.date === new Date().toDateString() ? 'Today' : group.date}
                      </span>
                    </div>
                    {group.msgs.map((msg: ChatMessage, idx: number) => {
                      const prevMsg = group.msgs[idx - 1];
                      const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;
                      return (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          isMe={msg.sender === user?.id}
                          showAvatar={showAvatar}
                          onReply={setReplyingTo}
                          onReact={handleReact}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </div>
                ))}
                {typingUser && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 italic ml-10">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex-shrink-0">
                <ChatInput
                  sending={sending}
                  onSend={handleSendMessage}
                  onSendFile={handleSendFile}
                  replyTo={replyingTo ? { id: replyingTo.id, content: replyingTo.content, sender_name: replyingTo.sender_details.full_name } : null}
                  onCancelReply={() => setReplyingTo(null)}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Farmket Chat</h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                Connect directly with farmers and buyers. Select a conversation to start messaging.
              </p>
              <button 
                onClick={() => setIsNewChatOpen(true)}
                className="mt-8 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/20 active:scale-95"
              >
                Start New Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleStartNewChat}
      />
    </div>
  );
};

export default Chat;
