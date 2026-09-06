import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppEmptyState, AppText, AppButton, AppCard } from '../../components/ui';
import { TopBarActions } from '../../components/navigation/TopBarActions';
import { colors, spacing, radii, shadows } from '../../theme';
import { MessageSquare, Search, ChevronRight, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchConversations, Conversation } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to refresh conversations', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    fetchConversations()
      .then((data) => {
        if (!isCancelled) {
          setConversations(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load conversations', error);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const filteredConversations = conversations.filter((item) => {
    if (!searchQuery.trim()) return true;
    const other = item.participants_details?.find((p) => p.id !== user?.id);
    const name = item.is_group ? item.group_name : (other?.full_name || other?.username || '');
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderItem = ({ item }: { item: Conversation }) => {
    const other = item.participants_details?.find((p) => p.id !== user?.id);
    const name = item.is_group ? item.group_name : (other?.full_name || other?.username || 'Producer / Customer');
    const lastMessage = item.last_message?.content || 'Started conversation';
    const isUnread = item.unread_count > 0;
    
    // Formatting timestamp
    const dateObj = item.last_message ? new Date(item.last_message.created_at) : new Date();
    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity 
        style={styles.convItem} 
        activeOpacity={0.75}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <AppText variant="body" weight="bold" color={colors.brand.primary}>
              {name.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.convInfo}>
          <View style={styles.convHeader}>
            <AppText variant="bodySmall" weight={isUnread ? 'bold' : 'semibold'} style={{ flex: 1 }} numberOfLines={1}>
              {name}
            </AppText>
            <AppText variant="label" color={isUnread ? colors.brand.primary : colors.text.muted}>
              {timeString}
            </AppText>
          </View>

          <View style={styles.convPreviewRow}>
            <AppText 
              variant="caption" 
              color={isUnread ? colors.text.primary : colors.text.muted} 
              weight={isUnread ? 'bold' : 'normal'}
              numberOfLines={1} 
              style={{ flex: 1, marginRight: spacing.sm }}
            >
              {lastMessage}
            </AppText>
            {isUnread && (
              <View style={styles.badge}>
                <AppText variant="label" weight="bold" color={colors.text.inverse} style={styles.badgeText}>
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
        <AppHeader title="Direct Messages" />
        <View style={styles.centerContent}>
          <AppCard variant="tinted" padding="xl" borderRadius={radii.xxl} style={{ alignItems: 'center', maxWidth: 340, width: '100%' }}>
            <View style={styles.guestIconBg}>
              <MessageSquare size={36} color={colors.brand.primary} />
            </View>
            <AppText variant="h2" weight="bold" align="center" style={{ marginTop: spacing.md }}>
              Farmer & Buyer Chat
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary} align="center" style={{ lineHeight: 20, marginTop: spacing.xs, marginBottom: spacing.xl }}>
              Sign in to chat directly with farmers, discuss custom harvest batch requests, and ask produce questions.
            </AppText>
            <View style={{ width: '100%' }}>
              <AppButton
                title="Sign In"
                shape="pill"
                onPress={() => router.push('/(auth)/login')}
                fullWidth
                style={{ marginBottom: spacing.sm }}
              />
              <AppButton
                title="Create Account"
                shape="pill"
                variant="outline"
                onPress={() => router.push('/(auth)/register')}
                fullWidth
              />
            </View>
          </AppCard>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title="Direct Messages" 
        rightActions={<TopBarActions showCart={true} showNotifications={true} />}
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <Search size={18} color={colors.text.muted} />
          <TextInput
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor={colors.text.muted}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={colors.text.muted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title={searchQuery ? "No Matches Found" : "No Conversations Yet"} 
            description={searchQuery ? "No conversations match your query." : "When you reach out to producers or customers, chats will appear here."}
            icon={<MessageSquare size={44} color={colors.brand.muted} strokeWidth={1.5} />}
            actionTitle={searchQuery ? "Clear Search" : "Explore Marketplace"}
            onAction={searchQuery ? () => setSearchQuery('') : () => router.push('/(tabs)/search')}
          />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 13,
    color: colors.text.primary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  guestIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.huge,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.success,
    borderWidth: 1.5,
    borderColor: colors.background.surface,
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
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
  }
});
