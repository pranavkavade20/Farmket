import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, AppButton, AppCard, AppBadge, AppEmptyState } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
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
  Leaf, MessageSquare, Truck, Clock, Calendar, Sprout 
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
          description="We couldn't load this product's details."
          actionTitle="Go Back"
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
  const farmerName = product.farmer_name || (farmerObj ? `${farmerObj.first_name || ''} ${farmerObj.last_name || ''}`.trim() : 'Verified Farmer');

  const renderCTA = () => {
    if (isPrebooking) {
      return (
        <AppButton
          title="Reserve Harvest 🌱"
          fullWidth
          size="lg"
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
          title="Sold Out"
          fullWidth
          size="lg"
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
        onPress={handleAddToCart}
        loading={addingToCart}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {primaryImage ? (
            <Image 
              source={{ uri: primaryImage }} 
              style={styles.image} 
              contentFit="cover" 
            />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <AppText color={colors.text.muted}>No Image Available</AppText>
            </View>
          )}
          
          <TouchableOpacity style={[styles.floatingBackBtn, { top: insets.top + spacing.sm }]} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.floatingWishlistBtn, { top: insets.top + spacing.sm }]}
            onPress={handleFollowToggle}
          >
            <Heart size={20} color={isFollowing ? colors.status.danger : colors.text.primary} fill={isFollowing ? colors.status.danger : 'none'} />
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
              <AppBadge marketState={product.market_state} size="md" label="" />
            )}
            {product.is_organic && (
              <AppBadge label="100% Organic" variant="success" size="md" icon={<Leaf size={12} color={colors.status.success} />} />
            )}
          </View>

          <AppText variant="headingLg" weight="bold" style={styles.title}>{product.name}</AppText>
          
          {/* Ratings & Farmer Name */}
          <View style={styles.metaHeader}>
            <View style={styles.ratingBadge}>
              <Star size={14} color={colors.accent.yellow} fill={colors.accent.yellow} />
              <AppText variant="small" weight="bold" style={{ marginLeft: 4 }}>
                {product.average_rating ? Number(product.average_rating).toFixed(1) : '4.8'}
              </AppText>
              <AppText variant="small" color={colors.text.secondary} style={{ marginLeft: 4 }}>
                ({product.reviews?.length || product.reviews_count || 12} reviews)
              </AppText>
            </View>

            <AppText variant="small" color={colors.text.secondary}>
              by <AppText variant="small" weight="bold" color={colors.text.primary}>{farmerName}</AppText>
            </AppText>
          </View>

          {/* Price Header */}
          <View style={styles.priceRow}>
            <AppText variant="display" weight="bold" color={colors.text.primary} style={styles.priceText}>
              {formatCurrency(product.price)}
            </AppText>
            <AppText variant="subheading" color={colors.text.secondary} style={{ marginLeft: 4, marginBottom: 4 }}>
              / {product.unit}
            </AppText>
          </View>

          {/* Description */}
          <AppText color={colors.text.secondary} style={styles.description}>
            {product.description || 'Freshly harvested produce delivered directly from the farm to your table with 100% quality guarantee.'}
          </AppText>

          {/* Live Crop Harvest Info Card (if crop growth exists) */}
          {product.active_crop_growth_id && (
            <AppCard elevated padding="lg" style={styles.harvestCard}>
              <View style={styles.harvestHeader}>
                <View>
                  <AppText variant="subheading" weight="bold">Live Harvest Progress</AppText>
                  <AppText variant="small" color={colors.text.secondary}>Direct from farm cultivation</AppText>
                </View>
                {product.crop_stage && (
                  <AppBadge stage={product.crop_stage} size="sm" label="" />
                )}
              </View>

              {/* Progress bar */}
              <View style={styles.cropProgressSection}>
                <View style={styles.cropProgressLabelRow}>
                  <AppText variant="small" weight="semibold" color={colors.text.secondary}>Lifecycle Stage</AppText>
                  <AppText variant="small" weight="bold" color={colors.brand.primary}>
                    {product.progress_percentage || 50}%
                  </AppText>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${product.progress_percentage || 50}%` }]} />
                </View>
              </View>

              {/* Harvest Metrics */}
              <View style={styles.harvestMetricsGrid}>
                <View style={styles.harvestMetricBox}>
                  <Clock size={16} color={colors.accent.orange} />
                  <AppText variant="small" color={colors.text.muted} style={{ marginTop: 4 }}>Days to Harvest</AppText>
                  <AppText weight="bold">{product.harvest_countdown ? `${product.harvest_countdown} days` : 'Soon'}</AppText>
                </View>
                <View style={styles.harvestMetricBox}>
                  <Sprout size={16} color={colors.brand.primary} />
                  <AppText variant="small" color={colors.text.muted} style={{ marginTop: 4 }}>Available Yield</AppText>
                  <AppText weight="bold">{product.available_quantity || product.stock_quantity} {product.unit}</AppText>
                </View>
              </View>
            </AppCard>
          )}

          {/* Farmer Card with Chat CTA */}
          <AppCard elevated padding="md" style={styles.farmerCard}>
            <View style={styles.farmerAvatar}>
              <AppText variant="heading" weight="bold" color={colors.brand.primary}>
                {farmerName.charAt(0).toUpperCase()}
              </AppText>
            </View>
            <View style={styles.farmerInfo}>
              <AppText weight="bold">{farmerName}</AppText>
              <AppText variant="small" color={colors.text.muted}>Verified Farm Producer</AppText>
            </View>
            <TouchableOpacity style={styles.chatButton} onPress={handleChatWithFarmer}>
              <MessageSquare size={16} color={colors.brand.primary} />
              <AppText variant="small" weight="bold" color={colors.brand.primary} style={{ marginLeft: 4 }}>
                Chat
              </AppText>
            </TouchableOpacity>
          </AppCard>

          {/* Guarantees */}
          <View style={styles.guaranteesRow}>
            <View style={styles.guaranteeItem}>
              <Truck size={18} color={colors.status.info} />
              <AppText variant="small" weight="semibold" style={{ marginLeft: 6 }}>Fast Delivery</AppText>
            </View>
            <View style={styles.guaranteeItem}>
              <ShieldCheck size={18} color={colors.status.success} />
              <AppText variant="small" weight="semibold" style={{ marginLeft: 6 }}>Quality Assured</AppText>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <AppText variant="heading" weight="bold" style={styles.sectionTitle}>
              Customer Reviews ({product.reviews?.length || 0})
            </AppText>

            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <AppCard key={rev.id} elevated padding="md" style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <AppText weight="bold">{rev.buyer_name}</AppText>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} color={colors.accent.yellow} fill={s <= rev.rating ? colors.accent.yellow : 'none'} />
                      ))}
                    </View>
                  </View>
                  <AppText variant="small" color={colors.text.secondary} style={{ marginTop: 4 }}>
                    {rev.comment}
                  </AppText>
                  <AppText variant="small" color={colors.text.muted} style={{ marginTop: 6, fontSize: 10 }}>
                    {formatDate(rev.created_at)}
                  </AppText>
                </AppCard>
              ))
            ) : (
              <AppText variant="small" color={colors.text.muted} style={{ marginBottom: spacing.md }}>
                No reviews yet. Be the first to review this farm produce!
              </AppText>
            )}

            {/* Write Review Input */}
            {user && (
              <AppCard elevated padding="md" style={styles.writeReviewCard}>
                <AppText weight="bold" style={{ marginBottom: spacing.xs }}>Leave a Review</AppText>
                <View style={styles.starsSelectRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setReviewRating(s)} style={{ padding: 4 }}>
                      <Star size={22} color={colors.accent.yellow} fill={s <= reviewRating ? colors.accent.yellow : 'none'} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  placeholder="Share your experience with this harvest..."
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
            >
              <AppText weight="bold" style={{ fontSize: 18 }}>-</AppText>
            </TouchableOpacity>
            <AppText weight="bold" style={{ marginHorizontal: spacing.md, fontSize: 16 }}>{quantity}</AppText>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(q => Math.min(product.stock_quantity || 99, q + 1))}
            >
              <AppText weight="bold" style={{ fontSize: 18 }}>+</AppText>
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
    height: 320,
    position: 'relative',
    backgroundColor: colors.background.surface,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.elevated,
  },
  floatingBackBtn: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingWishlistBtn: {
    position: 'absolute',
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailStrip: {
    paddingHorizontal: spacing.xl,
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
    padding: spacing.xl,
    backgroundColor: colors.background.main,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
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
    backgroundColor: colors.brand.muted + '30',
    borderColor: colors.brand.primary + '30',
    borderWidth: 1,
    marginBottom: spacing.xl,
    borderRadius: radii.xl,
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
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.elevated,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
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
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
  },
  farmerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.muted,
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
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.brand.muted,
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
    marginTop: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  reviewCard: {
    marginBottom: spacing.md,
    borderRadius: radii.lg,
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
    borderRadius: radii.lg,
  },
  starsSelectRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  reviewInput: {
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.surface,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
