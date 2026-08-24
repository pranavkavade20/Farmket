import { useEffect, useRef, useCallback } from 'react';
import { storage } from '../utils/storage';
import { ChatMessage } from '../api/chat';

// Derive WS URL from API URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/';
const WS_BASE_URL = API_URL.replace('http', 'ws').replace('/api/', '');

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

  const connect = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const token = await storage.getToken();
    if (!token) return;

    const wsUrl = `${WS_BASE_URL}/ws/chat/global/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as WsEvent;
        onEvent(data);
      } catch (err) {
        console.error('WS Parse Error', err);
      }
    };

    ws.onclose = () => {
      console.log('WS Disconnected');
    };
    
    ws.onerror = (e) => {
      console.log('WS Error', e);
    };
  }, [onEvent]);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
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
