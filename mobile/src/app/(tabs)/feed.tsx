import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppEmptyState } from '../../components/ui';
import { TopBarActions } from '../../components/navigation/TopBarActions';
import { colors, spacing, radii, shadows } from '../../theme';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFeed, likePost, Post } from '../../api/social';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { formatDate } from '../../utils/format';
import { CommentsModal } from '../../components/social/CommentsModal';
import { PostComposerModal } from '../../components/social/PostComposerModal';
import { Heart, MessageSquare, Share2, Plus, ShoppingBag, Sparkles, Sprout, ShieldCheck } from 'lucide-react-native';
import { Image } from 'expo-image';

export default function SocialFeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<number | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<number, { isLiked: boolean; count: number }>>({});

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isError,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => fetchFeed(pageParam as string),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: 'posts/feed/',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLike = async (post: Post) => {
    const current = likedMap[post.id] || { isLiked: post.is_liked, count: post.likes_count };
    const nextLiked = !current.isLiked;
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);

    setLikedMap((prev) => ({
      ...prev,
      [post.id]: { isLiked: nextLiked, count: nextCount },
    }));

    try {
      await likePost(post.id);
    } catch {
      // Revert on failure
      setLikedMap((prev) => ({
        ...prev,
        [post.id]: current,
      }));
    }
  };

  const posts: Post[] = feedData?.pages.flatMap((page) => page.results) || [];

  const renderPost = ({ item }: { item: Post }) => {
    const likeState = likedMap[item.id] || { isLiked: item.is_liked, count: item.likes_count };
    const mediaImage = item.media?.[0]?.file || null;
    const authorName = item.farmer?.first_name 
      ? `${item.farmer.first_name} ${item.farmer.last_name || ''}`
      : (item.farmer?.username || 'Farm Producer');

    return (
      <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.postCard}>
        {/* Author Header */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <AppText variant="h3" weight="bold" color={colors.brand.primary}>
              {authorName.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.authorInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="bodySmall" weight="bold" color={colors.text.primary}>
                {authorName}
              </AppText>
              <View style={styles.farmerBadge}>
                <ShieldCheck size={10} color={colors.brand.primary} />
                <AppText variant="label" weight="bold" color={colors.brand.primary} style={{ marginLeft: 2, fontSize: 9 }}>
                  PRODUCER
                </AppText>
              </View>
            </View>
            <AppText variant="caption" color={colors.text.muted}>
              {item.location || 'Karnataka'} • {formatDate(item.created_at)}
            </AppText>
          </View>
        </View>

        {/* Post Description */}
        <AppText variant="body" color={colors.text.primary} style={styles.postDescription}>
          {item.description}
        </AppText>

        {/* Media Image */}
        {mediaImage && (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: mediaImage }} style={styles.mediaImage} contentFit="cover" transition={200} />
          </View>
        )}

        {/* Linked Harvest Produce Banner */}
        {item.product && (
          <TouchableOpacity
            style={styles.linkedProductBanner}
            onPress={() => router.push(`/product/${item.product!.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={styles.productIconWrapper}>
              <ShoppingBag size={16} color={colors.brand.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                Harvest Available: {item.product.name}
              </AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                ₹{item.product.price} / {item.product.unit}
              </AppText>
            </View>
            <AppButton title="Shop" size="xs" shape="pill" variant="primary" />
          </TouchableOpacity>
        )}

        {/* Engagement Action Bar */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(item)}
            activeOpacity={0.7}
          >
            <Heart
              size={18}
              color={likeState.isLiked ? colors.status.danger : colors.text.muted}
              fill={likeState.isLiked ? colors.status.danger : 'none'}
            />
            <AppText
              variant="caption"
              weight={likeState.isLiked ? 'bold' : 'medium'}
              color={likeState.isLiked ? colors.status.danger : colors.text.secondary}
              style={{ marginLeft: 6 }}
            >
              {likeState.count}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setActiveCommentsPostId(item.id)}
            activeOpacity={0.7}
          >
            <MessageSquare size={18} color={colors.text.muted} />
            <AppText variant="caption" color={colors.text.secondary} style={{ marginLeft: 6 }}>
              {item.comments_count || 0}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Share2 size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      </AppCard>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title="Field Feed" 
        rightActions={<TopBarActions showCart={true} showNotifications={true} />}
      />

      {isLoading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <AppEmptyState
            title="Failed to Load Feed"
            description="We could not retrieve field updates. Please try again."
            actionTitle="Retry"
            onAction={refetch}
          />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centerContent}>
          <AppEmptyState
            title="No Field Updates Yet"
            description="Follow producers and discover fresh harvest updates from local farms."
            icon={<Sparkles size={44} color={colors.brand.muted} />}
          />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={colors.brand.primary} style={{ padding: spacing.md }} />
            ) : null
          }
        />
      )}

      {/* Floating Action Button for Producers */}
      {user?.user_type === 'farmer' && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
          onPress={() => setIsComposerOpen(true)}
          activeOpacity={0.85}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      )}

      {/* Comments Modal */}
      {activeCommentsPostId && (
        <CommentsModal
          visible={!!activeCommentsPostId}
          onClose={() => setActiveCommentsPostId(null)}
          postId={activeCommentsPostId}
        />
      )}

      {/* Farmer Post Composer Modal */}
      <PostComposerModal
        visible={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSuccess={() => refetch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge + 40,
    gap: spacing.sm,
  },
  postCard: {
    backgroundColor: colors.background.surface,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  authorInfo: {
    flex: 1,
  },
  farmerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    marginLeft: 6,
  },
  postDescription: {
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  mediaContainer: {
    width: '100%',
    height: 240,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.background.elevated,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  linkedProductBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.tint,
    borderColor: colors.brand.muted,
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  productIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.sm,
    gap: spacing.xl,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
});
