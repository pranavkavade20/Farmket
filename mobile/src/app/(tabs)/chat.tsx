import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppEmptyState, AppText } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { MessageSquare, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchConversations, Conversation } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const other = item.participants_details.find(p => p.id !== user?.id);
    const name = item.is_group ? item.group_name : (other?.full_name || other?.username || 'Unknown User');
    const lastMessage = item.last_message?.content || 'No messages yet.';
    
    // Formatting date
    const dateObj = item.last_message ? new Date(item.last_message.created_at) : new Date();
    const timeString = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity 
        style={styles.convItem} 
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <View style={styles.avatar}>
          <AppText variant="heading" weight="bold" color={colors.brand.primary}>
            {name.charAt(0).toUpperCase()}
          </AppText>
        </View>
        <View style={styles.convInfo}>
          <View style={styles.convHeader}>
            <AppText weight="bold" style={{ flex: 1 }} numberOfLines={1}>{name}</AppText>
            <AppText variant="small" color={item.unread_count > 0 ? colors.brand.primary : colors.text.muted}>
              {timeString}
            </AppText>
          </View>
          <View style={styles.convPreviewRow}>
            <AppText 
              variant="small" 
              color={item.unread_count > 0 ? colors.text.primary : colors.text.secondary} 
              weight={item.unread_count > 0 ? 'semibold' : 'normal'}
              numberOfLines={1} 
              style={{ flex: 1 }}
            >
              {lastMessage}
            </AppText>
            {item.unread_count > 0 && (
              <View style={styles.badge}>
                <AppText variant="small" weight="bold" color={colors.text.inverse} style={styles.badgeText}>
                  {item.unread_count}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Messages" />
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="Authentication Required" 
            description="Please log in to view your messages."
            actionTitle="Log In"
            onAction={() => router.push('/(auth)/login')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Messages" />
      
      {/* Fake Search Bar for UI polish */}
      <View style={styles.searchContainer}>
        <View style={styles.fakeSearchInput}>
          <Search size={20} color={colors.text.muted} />
          <AppText color={colors.text.muted} style={{ marginLeft: spacing.sm }}>
            Search messages...
          </AppText>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="No Messages Yet" 
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
          }
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
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  fakeSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.main,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  list: {
    paddingTop: spacing.xs,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  convInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.brand.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  badgeText: {
    fontSize: 10,
  }
});
