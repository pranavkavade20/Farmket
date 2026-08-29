import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppEmptyState } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFeed, likePost, savePost, Post } from '../../api/social';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { formatDate } from '../../utils/format';
import { CommentsModal } from '../../components/social/CommentsModal';
import { PostComposerModal } from '../../components/social/PostComposerModal';
import { Heart, MessageSquare, Share2, Plus, ShoppingBag, Leaf, Sparkles } from 'lucide-react-native';
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
      <AppCard elevated padding="md" style={styles.postCard}>
        {/* Author Header */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <AppText weight="bold" color={colors.brand.primary}>
              {authorName.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.authorInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText weight="bold">{authorName}</AppText>
              <View style={styles.farmerBadge}>
                <AppText variant="small" weight="bold" color={colors.brand.primary} style={{ fontSize: 10 }}>
                  FARMER
                </AppText>
              </View>
            </View>
            <AppText variant="small" color={colors.text.muted}>
              {item.location || 'Local Farm'} • {formatDate(item.created_at)}
            </AppText>
          </View>
        </View>

        {/* Post Description */}
        <AppText color={colors.text.primary} style={styles.postDescription}>
          {item.description}
        </AppText>

        {/* Media Image */}
        {mediaImage && (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: mediaImage }} style={styles.mediaImage} contentFit="cover" />
          </View>
        )}

        {/* Linked Product Banner */}
        {item.product && (
          <TouchableOpacity
            style={styles.linkedProductBanner}
            onPress={() => router.push(`/product/${item.product!.id}` as any)}
            activeOpacity={0.8}
          >
            <ShoppingBag size={16} color={colors.brand.primary} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppText variant="small" weight="bold" color={colors.brand.primary}>
                Harvest Available: {item.product.name}
              </AppText>
              <AppText variant="small" color={colors.text.secondary}>
                ₹{item.product.price} / {item.product.unit}
              </AppText>
            </View>
            <AppButton title="Shop" size="sm" variant="primary" />
          </TouchableOpacity>
        )}

        {/* Action Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(item)}
            activeOpacity={0.7}
          >
            <Heart
              size={20}
              color={likeState.isLiked ? colors.status.danger : colors.text.secondary}
              fill={likeState.isLiked ? colors.status.danger : 'none'}
            />
            <AppText
              variant="small"
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
            <MessageSquare size={20} color={colors.text.secondary} />
            <AppText variant="small" color={colors.text.secondary} style={{ marginLeft: 6 }}>
              {item.comments_count || 0}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Share2 size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </AppCard>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Community Feed" />

      {isLoading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <AppEmptyState
            title="Failed to Load Feed"
            description="We could not retrieve community posts. Please try again."
            actionTitle="Retry"
            onAction={refetch}
          />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centerContent}>
          <AppEmptyState
            title="No Posts Yet"
            description="Follow farmers and explore community updates from local farms."
            icon={<Sparkles size={48} color={colors.brand.muted} strokeWidth={1.5} />}
          />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
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

      {/* Floating Action Button for Farmers */}
      {user?.user_type === 'farmer' && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
          onPress={() => setIsComposerOpen(true)}
          activeOpacity={0.85}
        >
          <Plus size={24} color="#FFFFFF" />
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
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 40,
  },
  postCard: {
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
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
    backgroundColor: colors.brand.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  authorInfo: {
    flex: 1,
  },
  farmerBadge: {
    backgroundColor: colors.brand.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginLeft: 6,
  },
  postDescription: {
    fontSize: 15,
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
    backgroundColor: colors.brand.muted + '40',
    borderColor: colors.brand.primary + '30',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
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
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
});
