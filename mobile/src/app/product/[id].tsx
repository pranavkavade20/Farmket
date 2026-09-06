import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, AppButton, AppCard, AppBadge, AppEmptyState } from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductDetail, followProduct, unfollowProduct, createProductReview, Product } from '../../api/products';
import { getOrCreateConversation } from '../../api/chat';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { ReservationModal } from '../../components/crops/ReservationModal';
import { useRequireAuth } from '../../components/auth/AuthGateModal';
import { 
  ChevronLeft, Star, Heart, CheckCircle2, ShieldCheck, 
  Leaf, MessageSquare, Truck, Clock, Calendar, Sprout, Plus, Minus 
} from 'lucide-react-native';
import { Image } from 'expo-image';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { requireAuth, AuthGateModalComponent } = useRequireAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const data = await fetchProductDetail(id as string);
      setIsFollowing(!!data.is_following);
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    if (!requireAuth('Add to Cart', 'Sign in to add fresh produce to your cart and complete your order.')) {
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      Alert.alert('Added to Cart! 🛒', `${quantity} ${product.unit} of ${product.name} added to your cart.`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/cart') }
      ]);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!product) return;
    if (!requireAuth('Follow Crop', 'Sign in to follow crops and get real-time harvest updates.')) {
      return;
    }

    try {
      if (isFollowing) {
        await unfollowProduct(product.slug);
        setIsFollowing(false);
      } else {
        await followProduct(product.slug);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Failed to toggle follow', err);
    }
  };

  const handleChatWithFarmer = async () => {
    if (!product) return;
    if (!requireAuth('Chat with Producer', 'Sign in to send direct messages to the farmer.')) {
      return;
    }

    const farmerId = typeof product.farmer === 'number' 
      ? product.farmer 
      : (product.farmer as { id: number }).id;

    try {
      const conv = await getOrCreateConversation(farmerId);
      router.push(`/chat/${conv.id}` as any);
    } catch (err) {
      Alert.alert('Error', 'Could not start conversation with farmer.');
    }
  };

  const handleSubmitReview = async () => {
    if (!product || !reviewComment.trim()) return;
    if (!requireAuth('Write a Review', 'Sign in to share your review for this produce.')) {
      return;
    }

    setSubmittingReview(true);
    try {
      await createProductReview(product.slug, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      setReviewRating(5);
      Alert.alert('Thank you!', 'Your review has been submitted.');
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit review. You may have already reviewed this product.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppEmptyState 
          title="Product Not Found"
          description="We couldn't load this produce details."
          actionTitle="Back to Marketplace"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images.map(i => i.image) 
    : [];
  const primaryImage = images[activeImageIndex] || null;

  const isPrebooking = product.market_state === 'READY_FOR_PREBOOKING' || product.market_state === 'READY_TO_HARVEST';
  const isSoldOut = product.market_state === 'SOLD_OUT' || (!product.is_available && product.stock_quantity === 0);
  
  const farmerObj = typeof product.farmer === 'object' && product.farmer ? (product.farmer as { first_name?: string; last_name?: string }) : null;
  const farmerName = product.farmer_name || (farmerObj ? `${farmerObj.first_name || ''} ${farmerObj.last_name || ''}`.trim() : 'Verified Grower');

  const renderCTA = () => {
    if (isPrebooking) {
      return (
        <AppButton
          title="Pre-Book Harvest 🌱"
          fullWidth
          size="lg"
          shape="pill"
          onPress={() => {
            if (!requireAuth('Reserve Harvest', 'Sign in to pre-book upcoming crops directly from the producer.')) {
              return;
            }
            setIsReservationOpen(true);
          }}
        />
      );
    }

    if (isSoldOut) {
      return (
        <AppButton
          title="Currently Sold Out"
          fullWidth
          size="lg"
          shape="pill"
          disabled
          variant="secondary"
        />
      );
    }

    return (
      <AppButton
        title={`Add to Cart • ${formatCurrency(Number(product.price) * quantity)}`}
        fullWidth
        size="lg"
        shape="pill"
        onPress={handleAddToCart}
        loading={addingToCart}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Image Gallery Hero */}
        <View style={styles.imageContainer}>
          {primaryImage ? (
            <Image 
              source={{ uri: primaryImage }} 
              style={styles.image} 
              contentFit="cover" 
              transition={200}
            />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <Leaf size={48} color={colors.brand.primary} />
              <AppText color={colors.text.muted} style={{ marginTop: 8 }}>Pure Fresh Farm Produce</AppText>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.floatingBackBtn, { top: insets.top + spacing.sm }]} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color={colors.text.primary} strokeWidth={2.4} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.floatingWishlistBtn, { top: insets.top + spacing.sm }]}
            onPress={handleFollowToggle}
            activeOpacity={0.8}
          >
            <Heart 
              size={20} 
              color={isFollowing ? colors.status.danger : colors.text.primary} 
              fill={isFollowing ? colors.status.danger : 'none'} 
            />
          </TouchableOpacity>
        </View>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailStrip}>
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.thumbBtn, activeImageIndex === idx && styles.thumbBtnActive]}
                onPress={() => setActiveImageIndex(idx)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} contentFit="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          {/* Status & Organic Badges */}
          <View style={styles.tagsRow}>
            {product.market_state && (
              <AppBadge marketState={product.market_state} size="sm" label="" />
            )}
            {product.is_organic && (
              <AppBadge label="100% Certified Organic" variant="organic" size="sm" />
            )}
          </View>

          <AppText variant="display" weight="bold" color={colors.text.primary} style={styles.title}>
            {product.name}
          </AppText>
          
          {/* Ratings & Producer Info */}
          <View style={styles.metaHeader}>
            <View style={styles.ratingBadge}>
              <Star size={14} color={colors.accent.amber} fill={colors.accent.amber} />
              <AppText variant="caption" weight="bold" style={{ marginLeft: 4 }}>
                {product.average_rating ? Number(product.average_rating).toFixed(1) : '4.9'}
              </AppText>
              <AppText variant="caption" color={colors.text.muted} style={{ marginLeft: 4 }}>
                ({product.reviews?.length || product.reviews_count || 12} reviews)
              </AppText>
            </View>

            <AppText variant="caption" color={colors.text.secondary}>
              Cultivated by <AppText variant="caption" weight="bold" color={colors.text.primary}>{farmerName}</AppText>
            </AppText>
          </View>

          {/* Price Header */}
          <View style={styles.priceRow}>
            <AppText variant="display" weight="bold" color={colors.brand.primary} style={styles.priceText}>
              {formatCurrency(product.price)}
            </AppText>
            <AppText variant="h3" color={colors.text.muted} style={{ marginLeft: 4 }}>
              / {product.unit}
            </AppText>
          </View>

          {/* Description */}
          <AppText variant="body" color={colors.text.secondary} style={styles.description}>
            {product.description || 'Grown with organic farming principles and harvested fresh to ensure maximum nutrient density and exceptional flavor.'}
          </AppText>

          {/* Live Crop Harvest Lifecycle (if connected to active crop) */}
          {product.active_crop_growth_id && (
            <AppCard variant="tinted" padding="lg" borderRadius={radii.xl} style={styles.harvestCard}>
              <View style={styles.harvestHeader}>
                <View>
                  <AppText variant="h3" weight="bold" color={colors.brand.forest}>
                    Active Crop Growth
                  </AppText>
                  <AppText variant="caption" color={colors.text.secondary}>
                    Live tracking directly from grower&apos;s field
                  </AppText>
                </View>
                {product.crop_stage && (
                  <AppBadge stage={product.crop_stage} size="xs" label="" />
                )}
              </View>

              {/* Progress bar */}
              <View style={styles.cropProgressSection}>
                <View style={styles.cropProgressLabelRow}>
                  <AppText variant="caption" weight="medium" color={colors.text.secondary}>Growth Progress</AppText>
                  <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                    {product.progress_percentage || 60}% Complete
                  </AppText>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${product.progress_percentage || 60}%` }]} />
                </View>
              </View>

              {/* Harvest Metrics */}
              <View style={styles.harvestMetricsGrid}>
                <View style={styles.harvestMetricBox}>
                  <Clock size={16} color={colors.accent.amber} />
                  <AppText variant="label" color={colors.text.muted} style={{ marginTop: 4 }}>DAYS TO HARVEST</AppText>
                  <AppText variant="bodySmall" weight="bold">
                    {product.harvest_countdown ? `${product.harvest_countdown} days` : 'Est. 12 days'}
                  </AppText>
                </View>
                <View style={styles.harvestMetricBox}>
                  <Sprout size={16} color={colors.brand.primary} />
                  <AppText variant="label" color={colors.text.muted} style={{ marginTop: 4 }}>RESERVE QUOTA</AppText>
                  <AppText variant="bodySmall" weight="bold">
                    {product.available_quantity || product.stock_quantity} {product.unit} left
                  </AppText>
                </View>
              </View>
            </AppCard>
          )}

          {/* Farmer Card with Chat CTA */}
          <AppCard variant="elevated" padding="md" borderRadius={radii.xl} style={styles.farmerCard}>
            <View style={styles.farmerAvatar}>
              <AppText variant="h3" weight="bold" color={colors.brand.primary}>
                {farmerName.charAt(0).toUpperCase()}
              </AppText>
            </View>
            <View style={styles.farmerInfo}>
              <AppText variant="bodySmall" weight="bold" color={colors.text.primary}>{farmerName}</AppText>
              <AppText variant="caption" color={colors.text.muted}>Verified Farm Producer • Karnataka</AppText>
            </View>
            <TouchableOpacity style={styles.chatButton} onPress={handleChatWithFarmer} activeOpacity={0.75}>
              <MessageSquare size={15} color={colors.brand.primary} />
              <AppText variant="caption" weight="bold" color={colors.brand.primary} style={{ marginLeft: 4 }}>
                Message
              </AppText>
            </TouchableOpacity>
          </AppCard>

          {/* Quality Guarantees */}
          <View style={styles.guaranteesRow}>
            <View style={styles.guaranteeItem}>
              <Truck size={16} color={colors.status.info} />
              <AppText variant="caption" weight="semibold" style={{ marginLeft: 6 }}>Fast Direct Dispatch</AppText>
            </View>
            <View style={styles.guaranteeItem}>
              <ShieldCheck size={16} color={colors.status.success} />
              <AppText variant="caption" weight="semibold" style={{ marginLeft: 6 }}>Verified Quality</AppText>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <AppText variant="h2" weight="bold" style={styles.sectionTitle}>
              Customer Reviews ({product.reviews?.length || 0})
            </AppText>

            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <AppCard key={rev.id} variant="elevated" padding="md" borderRadius={radii.lg} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <AppText variant="bodySmall" weight="bold">{rev.buyer_name}</AppText>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} color={colors.accent.amber} fill={s <= rev.rating ? colors.accent.amber : 'none'} />
                      ))}
                    </View>
                  </View>
                  <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 4, lineHeight: 18 }}>
                    {rev.comment}
                  </AppText>
                  <AppText variant="label" color={colors.text.muted} style={{ marginTop: 6 }}>
                    {formatDate(rev.created_at)}
                  </AppText>
                </AppCard>
              ))
            ) : (
              <AppText variant="caption" color={colors.text.muted} style={{ marginBottom: spacing.md }}>
                No reviews yet. Be the first to share your experience with this harvest!
              </AppText>
            )}

            {/* Write Review Input */}
            {user && (
              <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.writeReviewCard}>
                <AppText variant="bodySmall" weight="bold" style={{ marginBottom: spacing.xs }}>
                  Rate this Produce
                </AppText>
                <View style={styles.starsSelectRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setReviewRating(s)} style={{ padding: 4 }}>
                      <Star size={24} color={colors.accent.amber} fill={s <= reviewRating ? colors.accent.amber : 'none'} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  placeholder="Share details about the freshness, flavor, or delivery..."
                  placeholderTextColor={colors.text.muted}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  style={styles.reviewInput}
                  multiline
                  numberOfLines={3}
                />
                <AppButton
                  title="Submit Review"
                  size="sm"
                  shape="pill"
                  onPress={handleSubmitReview}
                  loading={submittingReview}
                  disabled={!reviewComment.trim() || submittingReview}
                  style={{ alignSelf: 'flex-end', marginTop: spacing.sm }}
                />
              </AppCard>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {!isPrebooking && !isSoldOut && (
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
              activeOpacity={0.7}
            >
              <Minus size={16} color={colors.text.primary} strokeWidth={2.4} />
            </TouchableOpacity>
            <AppText variant="bodySmall" weight="bold" style={{ marginHorizontal: spacing.md }}>
              {quantity}
            </AppText>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(q => Math.min(product.stock_quantity || 99, q + 1))}
              activeOpacity={0.7}
            >
              <Plus size={16} color={colors.text.primary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={{ flex: 1 }}>
          {renderCTA()}
        </View>
      </View>

      {/* Pre-booking Reservation Modal */}
      <ReservationModal
        visible={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        product={product}
        onSuccess={() => refetch()}
      />

      {/* Authentication Required Modal */}
      {AuthGateModalComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 330,
    position: 'relative',
    backgroundColor: colors.background.surface,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.tint,
  },
  floatingBackBtn: {
    position: 'absolute',
    left: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  floatingWishlistBtn: {
    position: 'absolute',
    right: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  thumbnailStrip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background.surface,
  },
  thumbBtn: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbBtnActive: {
    borderColor: colors.brand.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: spacing.lg,
    backgroundColor: colors.background.main,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 24,
    marginBottom: spacing.xxs,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  priceText: {
    fontSize: 28,
  },
  description: {
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  harvestCard: {
    marginBottom: spacing.xl,
  },
  harvestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cropProgressSection: {
    marginBottom: spacing.md,
  },
  cropProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background.elevated,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  harvestMetricsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  harvestMetricBox: {
    flex: 1,
    backgroundColor: colors.background.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  farmerInfo: {
    flex: 1,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.tint,
  },
  guaranteesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.xl,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  writeReviewCard: {
    marginTop: spacing.md,
  },
  starsSelectRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  reviewInput: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 74,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.surface,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    ...shadows.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
