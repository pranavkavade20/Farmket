import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, AppChatBubble, AppInput } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { fetchMessages, sendMessage, markAsRead, ChatMessage } from '../../api/chat';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import { Send, ChevronLeft, Phone, Video } from 'lucide-react-native';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = Number(id);
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

  // Safe area handling for Android KeyboardAvoidingView
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <AppText variant="heading" weight="bold">Farmer</AppText>
          <AppText variant="small" color={colors.status.success}>Online</AppText>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Phone size={20} color={colors.brand.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Video size={20} color={colors.brand.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
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
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.inputWrapper}>
            <AppInput
              placeholder="Message..."
              value={inputText}
              onChangeText={setInputText}
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              multiline
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={[
                styles.sendBtn, 
                (!inputText.trim() || sending) && styles.sendBtnDisabled
              ]} 
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Send size={18} color={colors.text.inverse} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerActionBtn: {
    padding: spacing.xs,
  },
  keyboardView: {
    flex: 1,
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
    backgroundColor: colors.background.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 120,
    minHeight: 48,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs, // aligns with bottom of input
  },
  sendBtnDisabled: {
    backgroundColor: colors.brand.muted,
  }
});
