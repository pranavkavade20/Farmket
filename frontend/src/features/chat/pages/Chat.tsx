import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { chatService, type Conversation, type ChatMessage, type ChatUser } from '@/features/chat';
import { useAuth } from '@/features/auth';
import { MessageSquare, MoreVertical, Phone, Video, Info, ArrowLeft, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import { WS_BASE_URL } from '@/config/env';

import { ChatSidebar } from '../components/ChatSidebar';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { ChatAvatar } from '../components/ChatAvatar';
import { NewChatModal } from '../components/NewChatModal';

const Chat = () => {
  useSEO({ title: 'Messages | Farmket', description: 'Chat with farmers and buyers on Farmket.' });

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
  const selectedRef = useRef<number | null>(null);

  useEffect(() => { selectedRef.current = selected?.id ?? null; }, [selected]);

  // ── Fetch Conversations ───────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      setOnlineUsers(prev => {
        const next = new Set(prev);
        data.forEach(c => {
          c.participants_details.forEach(p => {
            if (p.is_online) next.add(p.id);
          });
        });
        return next;
      });
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConv(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const initRef = useRef<number | null>(null);

  // ── Handle incoming chat request from other pages ──────────────────────────
  useEffect(() => {
    const targetUserId = location.state?.userId;
    if (targetUserId && initRef.current !== targetUserId) {
      initRef.current = targetUserId;
      chatService.getOrCreateConversation(targetUserId)
        .then(conv => {
          setConversations(prev => {
            if (prev.some(c => c.id === conv.id)) return prev;
            return [conv, ...prev];
          });
          setSelected(conv);
          // clear state
          navigate(location.pathname, { replace: true, state: {} });
        })
        .catch(() => {
          initRef.current = null;
          toast.error('Failed to open chat');
        });
    }
  }, [location.state, location.pathname, navigate]);

  // ── WebSocket Logic ────────────────────────────────────────────────────────
  const handleWsEvent = useCallback((data: any) => {
    switch (data.type) {
      case 'chat_message':
        if (selectedRef.current === data.conversation_id) {
          setMessages(prev => {
            if (prev.some(m => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
        setConversations(prev => prev.map(c => 
          c.id === data.conversation_id ? { ...c, last_message: data.message, unread_count: selectedRef.current === c.id ? c.unread_count : c.unread_count + 1 } : c
        ));
        break;
      
      case 'typing_status':
        if (data.user_id !== user?.id && data.conversation_id === selectedRef.current) {
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
        if (data.conversation_id === selectedRef.current) {
          setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, is_read: true } : m));
        }
        break;

      case 'message_reaction':
        if (data.conversation_id === selectedRef.current) {
          setMessages(prev => prev.map(m => {
            if (m.id !== data.message_id) return m;
            const filtered = m.reactions.filter(r => r.user !== data.user_id);
            return {
              ...m,
              reactions: [...filtered, { id: Date.now(), message: m.id, user: data.user_id, reaction: data.reaction }]
            };
          }));
        }
        break;

      case 'message_deleted':
        if (data.conversation_id === selectedRef.current) {
          setMessages(prev => prev.map(m => 
            m.id === data.message_id ? { ...m, is_deleted: true, deleted_for_everyone: data.delete_for_everyone } : m
          ));
        }
        break;

      case 'message_edited':
        if (data.conversation_id === selectedRef.current) {
          setMessages(prev => prev.map(m => 
            m.id === data.message_id ? { ...m, content: data.content, is_edited: true } : m
          ));
        }
        break;
    }
  }, [user?.id]);

  const setupWebSocket = useCallback(() => {
    if (wsRef.current) wsRef.current.close();

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const wsUrl = `${WS_BASE_URL}/ws/chat/global/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      handleWsEvent(data);
    };

    ws.onclose = () => {
      console.log('WS Disconnected');
    };
  }, [handleWsEvent]);

  useEffect(() => {
    setupWebSocket();
    return () => wsRef.current?.close();
  }, [setupWebSocket]);

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

    chatService.markAsRead(selected.id).then(() => {
      setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, unread_count: 0 } : c));
    });
  }, [selected]);

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
          conversation_id: selected.id,
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
      wsRef.current.send(JSON.stringify({ type: 'message_reaction', conversation_id: selected?.id, message_id: msgId, reaction: emoji }));
    } else {
      chatService.reactToMessage(msgId, emoji);
    }
  };

  const handleDelete = (msgId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'delete_message', conversation_id: selected?.id, message_id: msgId, delete_for_everyone: true }));
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
    <div className="h-[calc(100vh-140px)] w-full max-w-[1400px] mx-auto pb-6">
      <div className="bg-white dark:bg-[#111] h-full rounded-[3rem] shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden flex relative">
        
        {/* Sidebar */}
        <div className={cn("w-full md:w-[380px] flex-shrink-0 border-r border-gray-100 dark:border-gray-800 md:block bg-[#F8F9FA] dark:bg-gray-900/30", selected ? "hidden" : "block")}>
          <ChatSidebar
            loading={loadingConv}
            conversations={filteredConversations}
            selectedId={selected?.id}
            onSelect={setSelected}
            search={sidebarSearch}
            onSearchChange={setSidebarSearch}
            onStartNewChat={() => setIsNewChatOpen(true)}
            currentUserId={user?.id}
            onlineUsers={onlineUsers}
          />
        </div>

        {/* Chat Area */}
        <div className={cn("flex-1 flex flex-col min-w-0 bg-[#f0f2f5] dark:bg-[#0A0A0A] relative md:flex", !selected ? "hidden" : "flex")}>
          {selected ? (
            <>
              {/* Top Bar */}
              <div className="h-20 flex-shrink-0 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelected(null)} className="md:hidden p-3 -ml-2 text-gray-500 bg-gray-100 rounded-full dark:bg-gray-800">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  {(() => {
                    const other = selected.participants_details.find(p => p.id !== user?.id);
                    const name = selected.is_group ? selected.group_name : (other?.full_name || other?.username || 'Unknown');
                    const icon = selected.is_group ? selected.group_icon_url : other?.profile_picture;
                    const isOnline = other ? onlineUsers.has(other.id) : false;
                    
                    return (
                      <>
                        <ChatAvatar name={name} src={icon} size={48} online={isOnline} />
                        <div className="min-w-0">
                          <h3 className="font-black text-gray-900 dark:text-white truncate text-base">{name}</h3>
                          <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mt-0.5">
                            {typingUser ? <span className="text-green-500">{typingUser.name} is typing...</span> : (isOnline ? <span className="text-green-500">Online</span> : 'Offline')}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-12 w-12 flex items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"><Video className="h-5 w-5" /></button>
                  <button className="h-12 w-12 flex items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"><Phone className="h-5 w-5" /></button>
                  <button className="h-12 w-12 flex items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"><Info className="h-5 w-5" /></button>
                </div>
              </div>

              {/* Messages List */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative"
              >
                {loadingMsgs ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                  </div>
                ) : groupedMessages.map(group => (
                  <div key={group.date} className="space-y-6">
                    <div className="flex justify-center my-6">
                      <span className="px-4 py-1.5 bg-black/5 dark:bg-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {group.date === new Date().toDateString() ? 'Today' : group.date}
                      </span>
                    </div>
                    {group.msgs.map((msg: ChatMessage, idx: number) => {
                      const prevMsg = group.msgs[idx - 1];
                      const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;
                      return (
                         // Inside Chat component the message bubbles should be loaded correctly by the MessageBubble component.
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
              <div className="flex-shrink-0 bg-white dark:bg-[#111] p-4 border-t border-gray-100 dark:border-gray-800">
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#111]">
              <div className="w-32 h-32 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <MessageSquare className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Your Messages</h2>
              <p className="text-sm font-bold text-gray-400 max-w-sm mx-auto leading-relaxed">
                Connect directly with farmers and buyers. Select a conversation to start messaging.
              </p>
              <button 
                onClick={() => setIsNewChatOpen(true)}
                className="mt-10 px-8 h-14 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
              >
                Start New Chat
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
