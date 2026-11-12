/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { chatService, type Conversation, type ChatMessage, type ChatUser } from '@/features/chat';
import { useAuth } from '@/features/auth';
import {
  MessageSquare,
  Phone,
  Info,
  ArrowLeft,
  ChevronDown,
  Sprout,
  ShieldCheck,
  ExternalLink,
  WifiOff,
  FileText,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { WS_BASE_URL } from '@/config/env';
import { cn } from '@/lib/utils/cn';

interface WsEventData {
  type: string;
  conversation_id?: number;
  message?: ChatMessage;
  user_id?: number;
  username?: string;
  is_typing?: boolean;
  status?: string;
  message_id?: number;
  reaction?: string;
  delete_for_everyone?: boolean;
  content?: string;
}

import { ChatSidebar } from '../components/ChatSidebar';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { ChatAvatar } from '../components/ChatAvatar';
import { NewChatModal } from '../components/NewChatModal';
import { Badge, Skeleton } from '@/components/ui';

export const Chat: React.FC = () => {
  useSEO({
    title: 'Direct Messages | Farmket',
    description: 'Chat directly with local farmers and buyers on Farmket.',
  });

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
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [typingUser, setTypingUser] = useState<{ id: number; name: string } | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef<number | null>(null);

  useEffect(() => {
    selectedRef.current = selected?.id ?? null;
  }, [selected]);

  // ── Fetch Conversations ───────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data || []);
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        (data || []).forEach((c) => {
          c.participants_details?.forEach((p) => {
            if (p.is_online) next.add(p.id);
          });
        });
        return next;
      });
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConv(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const initRef = useRef<number | null>(null);

  // ── Handle incoming chat request from other pages ──────────────────────────
  useEffect(() => {
    const targetUserId = location.state?.userId;
    if (targetUserId && initRef.current !== targetUserId) {
      initRef.current = targetUserId;
      chatService
        .getOrCreateConversation(targetUserId)
        .then((conv) => {
          setConversations((prev) => {
            if (prev.some((c) => c.id === conv.id)) return prev;
            return [conv, ...prev];
          });
          setSelected(conv);
          // clear navigation state
          navigate(location.pathname, { replace: true, state: {} });
        })
        .catch(() => {
          initRef.current = null;
          toast.error('Failed to open chat');
        });
    }
  }, [location.state, location.pathname, navigate]);

  // ── WebSocket Event Dispatcher ─────────────────────────────────────────────
  const handleWsEvent = useCallback(
    (data: WsEventData) => {
      switch (data.type) {
        case 'chat_message':
          if (data.message && selectedRef.current === data.conversation_id) {
            const incomingMsg = data.message;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incomingMsg.id)) return prev;
              return [...prev, incomingMsg];
            });
            // Mark read if active
            if (data.conversation_id) {
              chatService.markAsRead(data.conversation_id);
            }
          }
          if (data.message) {
            const incomingMsg = data.message;
            setConversations((prev) =>
              prev.map((c) =>
                c.id === data.conversation_id
                  ? {
                      ...c,
                      last_message: incomingMsg,
                      unread_count:
                        selectedRef.current === c.id ? 0 : (c.unread_count || 0) + 1,
                    }
                  : c
              )
            );
          }
          break;

        case 'typing_status':
          if (data.user_id !== user?.id && data.conversation_id === selectedRef.current) {
            setTypingUser(
              data.is_typing && data.user_id && data.username
                ? { id: data.user_id, name: data.username }
                : null
            );
          }
          break;

        case 'user_status':
          if (data.user_id) {
            const targetId = data.user_id;
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              if (data.status === 'online') next.add(targetId);
              else next.delete(targetId);
              return next;
            });
          }
          break;

        case 'message_read':
          if (data.conversation_id === selectedRef.current) {
            setMessages((prev) =>
              prev.map((m) => (m.id === data.message_id ? { ...m, is_read: true } : m))
            );
          }
          break;

        case 'message_reaction':
          if (data.conversation_id === selectedRef.current && data.user_id && data.reaction) {
            const reactionUserId = data.user_id;
            const reactionEmoji = data.reaction;
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== data.message_id) return m;
                const existing = m.reactions || [];
                const filtered = existing.filter((r) => r.user !== reactionUserId);
                return {
                  ...m,
                  reactions: [
                    ...filtered,
                    {
                      id: Date.now(),
                      message: m.id,
                      user: reactionUserId,
                      reaction: reactionEmoji,
                    },
                  ],
                };
              })
            );
          }
          break;

        case 'message_deleted':
          if (data.conversation_id === selectedRef.current) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === data.message_id
                  ? {
                      ...m,
                      is_deleted: true,
                      deleted_for_everyone: Boolean(data.delete_for_everyone),
                    }
                  : m
              )
            );
          }
          break;

        case 'message_edited':
          if (data.conversation_id === selectedRef.current && data.content) {
            const editedContent = data.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === data.message_id ? { ...m, content: editedContent, is_edited: true } : m
              )
            );
          }
          break;
      }
    },
    [user?.id]
  );

  // ── Setup WebSocket Connection ─────────────────────────────────────────────
  const isUnmountedRef = useRef(false);
  const handleWsEventRef = useRef<(data: WsEventData) => void>(handleWsEvent);
  const setupWebSocketRef = useRef<() => void>(() => {});

  useEffect(() => {
    handleWsEventRef.current = handleWsEvent;
  }, [handleWsEvent]);

  // Safely closes a WebSocket without triggering Chrome's "closed before established" error
  const safelyCloseWs = useCallback((ws: WebSocket | null) => {
    if (!ws) return;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;

    if (ws.readyState === WebSocket.CONNECTING) {
      // Defer closing until after the handshake finishes so the browser does not log an error
      ws.onopen = () => {
        try {
          ws.close(1000, 'Component unmounted during handshake');
        } catch {
          // ignore
        }
      };
    } else if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.close(1000, 'Normal clean closure');
      } catch {
        // ignore
      }
    }
  }, []);

  const setupWebSocket = useCallback(() => {
    if (isUnmountedRef.current) return;

    // Do not reconnect if already open or in the middle of connecting
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Safely clear any previous socket
    if (wsRef.current) {
      safelyCloseWs(wsRef.current);
      wsRef.current = null;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/ws/chat/global/?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmountedRef.current) {
          safelyCloseWs(ws);
          return;
        }
        setIsWsConnected(true);
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          handleWsEventRef.current(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message', err);
        }
      };

      ws.onclose = (event) => {
        setIsWsConnected(false);
        wsRef.current = null;

        // Do not attempt reconnect if component unmounted or clean exit
        if (isUnmountedRef.current || event.code === 1000) {
          return;
        }

        // Attempt reconnection after 3 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            setupWebSocketRef.current();
          }
        }, 3000);
      };

      ws.onerror = () => {
        setIsWsConnected(false);
      };
    } catch (e) {
      console.error('WebSocket initialisation error:', e);
      setIsWsConnected(false);
    }
  }, [safelyCloseWs]);

  useEffect(() => {
    setupWebSocketRef.current = setupWebSocket;
  }, [setupWebSocket]);

  useEffect(() => {
    isUnmountedRef.current = false;
    setupWebSocket();

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      safelyCloseWs(wsRef.current);
      wsRef.current = null;
    };
  }, [setupWebSocket, safelyCloseWs]);

  // ── Load Messages on Conversation Selection ────────────────────────────────
  useEffect(() => {
    if (!selected) return;

    setMessages([]);
    setLoadingMsgs(true);
    setReplyingTo(null);
    setEditingMessage(null);
    setShowInfoDrawer(false);

    chatService
      .getMessages(selected.id)
      .then((data) => setMessages(data || []))
      .catch(() => toast.error('Error loading messages'))
      .finally(() => setLoadingMsgs(false));

    chatService.markAsRead(selected.id).then(() => {
      setConversations((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, unread_count: 0 } : c))
      );
    });
  }, [selected]);

  // ── Scroll to Bottom Handling ──────────────────────────────────────────────
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
      setIsScrolledUp(false);
    }
  };

  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom('auto');
    }
  }, [messages, typingUser, isScrolledUp]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      setIsScrolledUp(distanceFromBottom > 150);
    }
  };

  // ── Send Message ───────────────────────────────────────────────────────────
  const handleSendMessage = async (content: string) => {
    if (!selected) return;

    // Handle Edit Mode
    if (editingMessage) {
      try {
        const updated = await chatService.editMessage(editingMessage.id, content);
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'edit_message',
              conversation_id: selected.id,
              message_id: editingMessage.id,
              content,
            })
          );
        }
        setEditingMessage(null);
      } catch {
        toast.error('Failed to update message');
      }
      return;
    }

    setSending(true);
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'chat_message',
            conversation_id: selected.id,
            message: content,
            reply_to: replyingTo?.id,
          })
        );
      } else {
        const msg = await chatService.sendMessage(selected.id, content, replyingTo?.id);
        setMessages((prev) => [...prev, msg]);
      }
      setReplyingTo(null);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ── Send File Attachment ───────────────────────────────────────────────────
  const handleSendFile = async (
    file: File,
    type: 'image' | 'video' | 'audio' | 'document'
  ) => {
    if (!selected) return;
    setSending(true);
    try {
      const msg = await chatService.sendMedia(selected.id, file, type);
      setMessages((prev) => [...prev, msg]);
      toast.success('Media shared successfully');
    } catch {
      toast.error('Media upload failed');
    } finally {
      setSending(false);
    }
  };

  // ── Reactions & Actions ────────────────────────────────────────────────────
  const handleReact = (msgId: number, emoji: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'message_reaction',
          conversation_id: selected?.id,
          message_id: msgId,
          reaction: emoji,
        })
      );
    } else {
      chatService.reactToMessage(msgId, emoji);
    }

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const existing = m.reactions || [];
        const hasReacted = existing.some((r) => r.user === user?.id && r.reaction === emoji);
        const filtered = existing.filter((r) => !(r.user === user?.id && r.reaction === emoji));
        if (hasReacted) return { ...m, reactions: filtered };
        return {
          ...m,
          reactions: [
            ...filtered,
            { id: Date.now(), message: m.id, user: user?.id || 0, reaction: emoji },
          ],
        };
      })
    );
  };

  const handleDelete = (msgId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'delete_message',
          conversation_id: selected?.id,
          message_id: msgId,
          delete_for_everyone: true,
        })
      );
    } else {
      chatService.deleteMessage(msgId);
    }
    // Optimistic delete
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, is_deleted: true, deleted_for_everyone: true } : m
      )
    );
  };

  const handleStartNewChat = async (targetUser: ChatUser) => {
    setIsNewChatOpen(false);
    try {
      const conv = await chatService.getOrCreateConversation(targetUser.id);
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      setSelected(conv);
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  const handleTypingEmission = (isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && selected) {
      wsRef.current.send(
        JSON.stringify({
          type: 'typing_status',
          conversation_id: selected.id,
          is_typing: isTyping,
        })
      );
    }
  };

  // ── Filtered Conversations ─────────────────────────────────────────────────
  const filteredConversations = conversations.filter((c) => {
    const other = c.participants_details?.find((p) => p.id !== user?.id);
    const name = c.is_group ? c.group_name : other?.full_name || other?.username || '';
    return name.toLowerCase().includes(sidebarSearch.toLowerCase());
  });

  // ── Group Messages by Date ─────────────────────────────────────────────────
  const groupedMessages = messages.reduce<
    { date: string; displayDate: string; msgs: ChatMessage[] }[]
  >((acc, msg) => {
    const dateObj = new Date(msg.created_at);
    const dateKey = dateObj.toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let displayDate = dateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    if (dateKey === today) displayDate = 'Today';
    else if (dateKey === yesterday.toDateString()) displayDate = 'Yesterday';

    if (!acc.length || acc[acc.length - 1].date !== dateKey) {
      acc.push({ date: dateKey, displayDate, msgs: [msg] });
    } else {
      acc[acc.length - 1].msgs.push(msg);
    }
    return acc;
  }, []);

  const otherParticipant = selected?.participants_details?.find((p) => p.id !== user?.id);
  const participantName = selected?.is_group
    ? selected.group_name
    : otherParticipant?.full_name || otherParticipant?.username || 'Farmket User';
  const participantAvatar = selected?.is_group
    ? selected.group_icon_url
    : otherParticipant?.profile_picture;
  const isParticipantOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false;
  const isParticipantFarmer = otherParticipant?.user_type === 'farmer';

  // Shared media files in this conversation
  const sharedMediaMessages = messages.filter((m) =>
    ['image', 'document', 'video'].includes(m.message_type) && m.file_url
  );

  return (
    <div className="h-full w-full flex relative overflow-hidden bg-background">
      {/* Offline / Reconnecting Banner */}
      {!isWsConnected && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-amber-500/90 text-white text-xs font-semibold py-1 px-4 flex items-center justify-center gap-2 backdrop-blur-xs shadow-xs">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Real-time link reconnecting. Messages will sync automatically.</span>
        </div>
      )}

      <div className="w-full flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div
          className={cn(
            'w-full md:w-[360px] lg:w-[380px] flex-shrink-0 border-r border-border-subtle bg-surface/30 transition-all duration-200 z-10',
            selected ? 'hidden md:block' : 'block'
          )}
        >
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

        {/* Right Chat Thread Area */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 bg-background relative',
            !selected ? 'hidden md:flex' : 'flex'
          )}
        >
          {selected ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="h-20 flex-shrink-0 bg-surface/80 backdrop-blur-md border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between z-10 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="md:hidden p-2 -ml-1 text-muted hover:text-foreground hover:bg-surface-elevated rounded-xl transition-colors"
                    title="Back to conversations"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <ChatAvatar
                    name={participantName}
                    src={participantAvatar}
                    size={46}
                    online={isParticipantOnline}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-foreground truncate text-base">
                        {participantName}
                      </h3>
                      {otherParticipant?.user_type && (
                        <Badge
                          variant={isParticipantFarmer ? 'brand' : 'default'}
                          size="sm"
                          className="capitalize hidden sm:inline-flex"
                        >
                          {isParticipantFarmer ? 'Verified Farmer' : otherParticipant.user_type}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-muted flex items-center gap-1.5 mt-0.5">
                      {typingUser ? (
                        <span className="text-brand font-bold animate-pulse">
                          {typingUser.name} is typing...
                        </span>
                      ) : isParticipantOnline ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                          <span className="text-success font-medium">Active now</span>
                        </>
                      ) : (
                        <span>Offline</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right Top Header Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.info(`Calling ${participantName} directly...`);
                    }}
                    className="p-2.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                    title="Direct call"
                    aria-label="Call user"
                  >
                    <Phone className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInfoDrawer((v) => !v)}
                    className={cn(
                      'p-2.5 rounded-xl transition-colors',
                      showInfoDrawer
                        ? 'bg-brand text-on-brand'
                        : 'text-muted hover:text-foreground hover:bg-surface-elevated'
                    )}
                    title="Conversation info"
                    aria-label="Conversation info"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages Scrollable Viewport */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar relative bg-surface/20"
              >
                {loadingMsgs ? (
                  <div className="space-y-4 py-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-end gap-2',
                          i % 2 === 0 ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                        <Skeleton
                          className={cn(
                            'rounded-2xl h-14',
                            i % 2 === 0 ? 'w-48 bg-brand-muted/30' : 'w-64'
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-3">
                    <div className="p-4 rounded-full bg-brand-muted/20 text-brand">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <p className="text-base font-bold text-foreground">
                      Start your discussion with {participantName}
                    </p>
                    <p className="text-xs text-muted max-w-sm">
                      Send a message, ask about crop harvest timelines, check organic certifications,
                      or agree on delivery logistics.
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.date} className="space-y-4">
                      {/* Date Separator */}
                      <div className="flex justify-center my-3 select-none">
                        <span className="px-3.5 py-1 bg-surface-elevated border border-border-subtle rounded-full text-[11px] font-bold text-muted shadow-2xs">
                          {group.displayDate}
                        </span>
                      </div>

                      {/* Messages within this date */}
                      {group.msgs.map((msg: ChatMessage, idx: number) => {
                        const prevMsg = group.msgs[idx - 1];
                        const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;
                        return (
                          <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isMe={msg.sender === user?.id}
                            showAvatar={showAvatar}
                            currentUserId={user?.id}
                            onReply={setReplyingTo}
                            onReact={handleReact}
                            onEdit={(m) => setEditingMessage(m)}
                            onDelete={handleDelete}
                          />
                        );
                      })}
                    </div>
                  ))
                )}

                {/* Live Typing Indicator */}
                {typingUser && (
                  <div className="flex items-center gap-2 text-xs text-muted ml-10 py-1">
                    <div className="flex gap-1 items-center bg-surface-elevated px-3 py-1.5 rounded-full border border-border-subtle shadow-xs">
                      <span
                        className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                      <span className="text-[11px] font-semibold text-foreground ml-1">
                        {typingUser.name} is typing
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scroll to Bottom Button */}
              <AnimatePresence>
                {isScrolledUp && (
                  <motion.button
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    onClick={() => scrollToBottom('smooth')}
                    className="absolute bottom-24 right-6 z-20 p-2.5 rounded-full bg-surface border border-border-subtle shadow-lg text-foreground hover:bg-surface-elevated transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                    aria-label="Scroll to bottom"
                  >
                    <ChevronDown className="h-4 w-4 text-brand" />
                    <span className="hidden sm:inline">Latest</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="flex-shrink-0 bg-surface p-3 sm:p-4 border-t border-border-subtle transition-colors">
                <ChatInput
                  sending={sending}
                  onSend={handleSendMessage}
                  onSendFile={handleSendFile}
                  replyTo={
                    replyingTo
                      ? {
                          id: replyingTo.id,
                          content: replyingTo.content,
                          sender_name: replyingTo.sender_details?.full_name || 'User',
                        }
                      : null
                  }
                  editingMessage={
                    editingMessage
                      ? { id: editingMessage.id, content: editingMessage.content }
                      : null
                  }
                  onCancelReply={() => setReplyingTo(null)}
                  onCancelEdit={() => setEditingMessage(null)}
                  onTyping={handleTypingEmission}
                />
              </div>
            </>
          ) : (
            /* Empty State: No conversation selected (Desktop) */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface/20">
              <div className="w-24 h-24 bg-brand-muted/30 rounded-3xl flex items-center justify-center mb-6 shadow-xs border border-brand/20">
                <Sprout className="h-12 w-12 text-brand" />
              </div>

              <h2 className="text-2xl font-display font-extrabold text-foreground mb-2 tracking-tight">
                Fresh Harvest Direct Messages
              </h2>

              <p className="text-sm text-foreground-secondary max-w-md mx-auto leading-relaxed mb-8">
                Connect directly with certified farmers and verified buyers. Negotiate harvest
                schedules, pre-booking reservations, or discuss organic produce specs.
              </p>

              <button
                type="button"
                onClick={() => setIsNewChatOpen(true)}
                className="px-6 py-3 bg-brand text-on-brand rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-all active:scale-95"
              >
                Start a New Conversation
              </button>
            </div>
          )}

          {/* Slide-over Profile Info Drawer */}
          <AnimatePresence>
            {showInfoDrawer && selected && otherParticipant && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-surface border-l border-border-subtle shadow-2xl z-20 flex flex-col overflow-y-auto custom-scrollbar"
              >
                {/* Drawer Header */}
                <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                  <h4 className="font-extrabold text-foreground text-sm">Conversation Details</h4>
                  <button
                    type="button"
                    onClick={() => setShowInfoDrawer(false)}
                    className="p-1.5 rounded-full hover:bg-surface-elevated text-muted hover:text-foreground"
                    aria-label="Close details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Profile Card */}
                <div className="p-6 text-center border-b border-border-subtle space-y-3">
                  <div className="flex justify-center">
                    <ChatAvatar
                      name={participantName}
                      src={participantAvatar}
                      size={72}
                      online={isParticipantOnline}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{participantName}</h3>
                    <p className="text-xs text-muted">@{otherParticipant.username}</p>
                  </div>

                  <div className="flex justify-center gap-2 pt-1">
                    <Badge variant={isParticipantFarmer ? 'brand' : 'default'} size="sm">
                      {isParticipantFarmer ? 'Verified Farmer' : otherParticipant.user_type || 'Buyer'}
                    </Badge>
                    <Badge variant="outline" size="sm" className="gap-1">
                      <ShieldCheck className="h-3 w-3 text-brand" />
                      <span>Farmket Verified</span>
                    </Badge>
                  </div>

                  {isParticipantFarmer && (
                    <button
                      type="button"
                      onClick={() => navigate(`/farmer/profile/${otherParticipant.id}`)}
                      className="w-full mt-3 py-2 px-3 rounded-xl bg-brand-muted/20 hover:bg-brand-muted/30 text-brand text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Visit Farmer Storefront</span>
                    </button>
                  )}
                </div>

                {/* Shared Media Section */}
                <div className="p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Shared Media & Documents ({sharedMediaMessages.length})
                  </h5>

                  {sharedMediaMessages.length === 0 ? (
                    <p className="text-xs text-muted italic">No media shared in this chat yet.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {sharedMediaMessages.map((m) => (
                        <div
                          key={m.id}
                          className="aspect-square rounded-xl bg-surface-elevated overflow-hidden border border-border-subtle relative group cursor-pointer"
                          onClick={() => window.open(m.file_url!, '_blank')}
                        >
                          {m.message_type === 'image' ? (
                            <img
                              src={m.file_url!}
                              alt="media"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <FileText className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleStartNewChat}
      />
    </div>
  );
};

export default Chat;
