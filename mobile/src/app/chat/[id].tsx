import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, AppChatBubble } from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { fetchMessages, sendMessage, markAsRead, ChatMessage } from '../../api/chat';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import { Send, ChevronLeft, ShieldCheck } from 'lucide-react-native';

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
      const sentMsg = await sendMessage(conversationId, inputText.trim());
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.avatar}>
          <AppText variant="bodySmall" weight="bold" color={colors.brand.primary}>
            F
          </AppText>
        </View>

        <View style={styles.headerTitleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText variant="bodySmall" weight="bold" color={colors.text.primary}>
              Direct Conversation
            </AppText>
            <ShieldCheck size={14} color={colors.brand.primary} style={{ marginLeft: 4 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
            <View style={styles.onlineIndicator} />
            <AppText variant="label" color={colors.status.success} style={{ marginLeft: 4 }}>
              Active on Farmket
            </AppText>
          </View>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

        {/* Input Bar */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Type your harvest query or message..."
              value={inputText}
              onChangeText={setInputText}
              style={styles.input}
              placeholderTextColor={colors.text.muted}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[
                styles.sendBtn, 
                (!inputText.trim() || sending) && styles.sendBtnDisabled
              ]} 
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Send size={18} color={colors.text.inverse} />
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
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    ...shadows.xs,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  onlineIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.status.success,
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
    ...shadows.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.pill,
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border.subtle,
  }
});
