import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppEmptyState, AppText } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchConversations, Conversation } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchConversations();
        setConversations(data);
      } catch (error) {
        console.error('Failed to load conversations', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadData();
    }
  }, [user]);

  const renderItem = ({ item }: { item: Conversation }) => {
    const other = item.participants_details.find(p => p.id !== user?.id);
    const name = item.is_group ? item.group_name : (other?.full_name || other?.username || 'Unknown User');
    const lastMessage = item.last_message?.content || 'No messages yet.';

    return (
      <TouchableOpacity 
        style={styles.convItem} 
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <View style={styles.avatar}>
          <AppText weight="bold" color={colors.brand.primary}>
            {name.charAt(0).toUpperCase()}
          </AppText>
        </View>
        <View style={styles.convInfo}>
          <AppText weight="bold">{name}</AppText>
          <AppText variant="small" color={colors.text.secondary} numberOfLines={1}>
            {lastMessage}
          </AppText>
        </View>
        {item.unread_count > 0 && (
          <View style={styles.badge}>
            <AppText variant="small" weight="bold" color={colors.text.inverse}>
              {item.unread_count}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Messages" />
        <View style={styles.content}>
          <AppText>Please log in to view your messages.</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Messages" />
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.content}>
          <AppEmptyState 
            title="No Messages" 
            description="When you contact farmers or buyers, your conversations will appear here."
            icon={<MessageSquare size={48} color={colors.brand.muted} strokeWidth={1.5} />}
          />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  list: {
    padding: spacing.md,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  convInfo: {
    flex: 1,
  },
  badge: {
    backgroundColor: colors.brand.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
