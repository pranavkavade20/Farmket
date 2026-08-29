import { useEffect, useRef, useCallback } from 'react';
import { storage } from '../utils/storage';
import { ChatMessage } from '../api/chat';
import { getWsUrl } from '../api/config';

type WsEvent = 
  | { type: 'chat_message'; conversation_id: number; message: ChatMessage }
  | { type: 'typing_status'; conversation_id: number; user_id: number; username: string; is_typing: boolean }
  | { type: 'user_status'; user_id: number; status: 'online' | 'offline' }
  | { type: 'message_read'; conversation_id: number; message_id: number }
  | { type: 'message_reaction'; conversation_id: number; message_id: number; user_id: number; reaction: string }
  | { type: 'message_deleted'; conversation_id: number; message_id: number; delete_for_everyone: boolean }
  | { type: 'message_edited'; conversation_id: number; message_id: number; content: string };

interface UseChatWebSocketProps {
  onEvent: (event: WsEvent) => void;
  enabled?: boolean;
}

export function useChatWebSocket({ onEvent, enabled = true }: UseChatWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const connect = useCallback(async () => {
    if (!isMountedRef.current || !enabled) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const token = await storage.getToken();
    if (!token) return;

    const wsUrl = getWsUrl(token);
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        retryCountRef.current = 0;
        console.log('[WebSocket] Connected to chat gateway');
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as WsEvent;
          onEvent(data);
        } catch (err) {
          console.log('[WebSocket] Parse notice:', err);
        }
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        console.log('[WebSocket] Connection closed');

        // Exponential backoff reconnect: 1s, 2s, 4s, 8s, up to max 15s
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 15000);
        retryCountRef.current += 1;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
      
      ws.onerror = (e) => {
        console.log('[WebSocket] Connection notice:', (e as any)?.message || 'Socket state update');
      };
    } catch (err) {
      console.log('[WebSocket] Initialization notice:', err);
    }
  }, [onEvent, enabled]);

  useEffect(() => {
    isMountedRef.current = true;
    if (enabled) {
      connect();
    }
    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, enabled]);

  const sendWsMessage = useCallback((payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { sendWsMessage, connect };
}
