import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { AppHeader, AppChatBubble, AppInput, AppButton } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { fetchMessages, sendMessage, markAsRead, ChatMessage } from '../../api/chat';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import { Send } from 'lucide-react-native';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = Number(id);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  const handleWsEvent = useCallback((event: any) => {
    if (event.type === 'chat_message' && event.conversation_id === conversationId) {
      setMessages(prev => {
        if (prev.some(m => m.id === event.message.id)) return prev;
        return [event.message, ...prev]; // Prepend for inverted FlatList
      });
      markAsRead(conversationId);
    }
  }, [conversationId]);

  const { sendWsMessage } = useChatWebSocket({ onEvent: handleWsEvent });

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await fetchMessages(conversationId);
        // data usually ordered by created_at. Since FlatList is inverted, we want newest first.
        // Assuming fetchMessages returns oldest first or newest first, let's reverse if needed.
        // The API sorts by ordering=created_at (oldest first). So we reverse it.
        setMessages([...data].reverse());
        await markAsRead(conversationId);
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [conversationId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    setSending(true);
    try {
      // Optimistically sending via WebSocket if possible, but for simplicity, we use REST
      // and let WebSocket echo it back, OR we can just use REST and push to state immediately.
      const sentMsg = await sendMessage(conversationId, inputText);
      setInputText('');
      setMessages(prev => [sentMsg, ...prev]);
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender === user?.id;
    return <AppChatBubble message={item} isMe={isMe} />;
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Chat" showBack />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.inputContainer}>
        <AppInput
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <AppButton 
          title=""
          rightIcon={<Send size={20} color={colors.text.inverse} />}
          onPress={handleSend}
          loading={sending}
          style={styles.sendBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
  sendBtn: {
    marginLeft: spacing.sm,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  }
});
