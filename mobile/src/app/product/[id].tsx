import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppText,
  AppButton,
  AppEmptyState,
  FarmketTrustBadges,
  FarmketQuantitySelector,
} from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import {
  fetchProductDetail,
  followProduct,
  unfollowProduct,
  Product,
} from '../../api/products';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';
import { ReservationModal } from '../../components/crops/ReservationModal';
import { useRequireAuth } from '../../components/auth/AuthGateModal';
import { FarmerAvatarSvg } from '../../components/illustrations/FarmerAvatarSvg';
import {
  TomatoesIllustration,
  SpinachIllustration,
  CarrotsIllustration,
} from '../../components/illustrations/ProduceIllustrations';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Leaf,
  ShoppingCart,
} from 'lucide-react-native';
import { Image } from 'expo-image';

// Fallback sample product for offline / direct demo testing
const SAMPLE_TOMATOES: Product = {
  id: 1,
  name: 'Organic Tomatoes',
  slug: 'organic-tomatoes',
  farmer: 1,
  farmer_name: 'Ramesh Farm',
  category: 1,
  description:
    'Fresh, juicy and organically grown tomatoes straight from our farm. No chemicals, no shortcuts. Just pure goodness.',
  price: 40,
  unit: 'kg',
  stock_quantity: 120,
  is_organic: true,
  is_available: true,
  in_stock: true,
  market_state: 'AVAILABLE_NOW',
  images: [],
  reviews: [],
  average_rating: 4.8,
  reviews_count: 124,
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { requireAuth, AuthGateModalComponent } = useRequireAuth();

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: rawProduct, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const data = await fetchProductDetail(id as string);
        setIsFollowing(!!data.is_following);
        return data;
      } catch (err) {
        // Fallback for demo ID or offline mode
        if (id === '1' || id === 'organic-tomatoes') {
          return SAMPLE_TOMATOES;
        }
        throw err;
      }
    },
    enabled: !!id,
  });

  const product = rawProduct || (id === '1' || id === 'organic-tomatoes' ? SAMPLE_TOMATOES : null);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!requireAuth('Add to Cart', 'Sign in to add fresh produce to your cart and complete your order.')) {
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      Alert.alert(
        'Added to Cart! 🛒',
        `${quantity} ${product.unit} of ${product.name} added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/cart') },
        ]
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!product) return;
    if (!requireAuth('Follow Producer', 'Sign in to follow farmers and get real-time harvest updates.')) {
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
    } catch {
      // Toggle locally
      setIsFollowing(!isFollowing);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out fresh ${product.name} directly from ${farmerName} on Farmket!`,
      });
    } catch {
      // User cancelled
    }
  };

  const handleNavigateToFarmer = () => {
    const farmerId =
      typeof product?.farmer === 'number'
        ? product.farmer
        : (product?.farmer as { id: number })?.id || 1;
    router.push(`/farmer/${farmerId}` as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (isError && !product) {
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

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images.map((i) => i.image) : [];
  const primaryImage = images[0] || null;

  const farmerObj =
    typeof product.farmer === 'object' && product.farmer
      ? (product.farmer as { first_name?: string; last_name?: string; farm_name?: string })
      : null;
  const farmerName =
    product.farmer_name ||
    farmerObj?.farm_name ||
    (farmerObj ? `${farmerObj.first_name || ''} ${farmerObj.last_name || ''}`.trim() : 'Ramesh Farm');

  const normalizedName = (product.name || '').toLowerCase();

  const renderProduceVisual = () => {
    if (primaryImage) {
      return (
        <Image
          source={{ uri: primaryImage }}
          style={styles.heroImage}
          contentFit="contain"
          transition={200}
        />
      );
    }
    if (normalizedName.includes('tomato')) {
      return <TomatoesIllustration size={200} />;
    }
    if (normalizedName.includes('spinach') || normalizedName.includes('palak') || normalizedName.includes('leaf')) {
      return <SpinachIllustration size={200} />;
    }
    if (normalizedName.includes('carrot')) {
      return <CarrotsIllustration size={200} />;
    }
    return (
      <View style={styles.placeholderVisual}>
        <Leaf size={64} color={colors.brand.primary} />
        <AppText color={colors.text.muted} style={{ marginTop: 8 }}>
          Fresh Farm Produce
        </AppText>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 1. TOP NAVIGATION - Exact match for Screen 3 */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.topNavRight}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={handleFollowToggle}
            activeOpacity={0.75}
          >
            <Heart
              size={20}
              color={isFollowing ? '#EF4444' : colors.text.primary}
              fill={isFollowing ? '#EF4444' : 'none'}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <Share2 size={20} color={colors.text.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* 2. LARGE PRODUCT VISUAL - Exact match for Screen 3 */}
        <View style={styles.heroVisualCard}>
          {renderProduceVisual()}
        </View>

        {/* 3. PRODUCT INFO SECTION */}
        <View style={styles.infoSection}>
          {/* Title and Organic Badge */}
          <View style={styles.titleRow}>
            <AppText variant="h1" weight="bold" color={colors.text.primary} style={styles.title}>
              {product.name}
            </AppText>

            {product.is_organic && (
              <View style={styles.organicPill}>
                <Leaf size={12} color="#15803D" strokeWidth={2.4} />
                <AppText variant="label" weight="bold" color="#15803D" style={{ marginLeft: 4 }}>
                  Organic
                </AppText>
              </View>
            )}
          </View>

          {/* Farmer Card Row (Clicking navigates to Screen 4) */}
          <TouchableOpacity
            style={styles.farmerRow}
            activeOpacity={0.8}
            onPress={handleNavigateToFarmer}
          >
            <View style={styles.farmerAvatarWrap}>
              <FarmerAvatarSvg size={44} />
            </View>

            <View style={styles.farmerTextCol}>
              <AppText variant="body" weight="bold" color={colors.text.primary}>
                {farmerName}
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Pune, Maharashtra
              </AppText>
            </View>

            <TouchableOpacity
              style={[styles.followOutlineBtn, isFollowing && styles.followingBtn]}
              onPress={handleFollowToggle}
              activeOpacity={0.8}
            >
              <AppText
                variant="caption"
                weight="bold"
                color={isFollowing ? '#FFFFFF' : colors.brand.primary}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </AppText>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Star size={14} color="#EAB308" fill="#EAB308" />
            <AppText variant="bodySmall" weight="bold" color={colors.text.primary} style={{ marginLeft: 4 }}>
              {product.average_rating ? Number(product.average_rating).toFixed(1) : '4.8'}
            </AppText>
            <AppText variant="caption" color={colors.text.muted} style={{ marginLeft: 4 }}>
              ({product.reviews_count || product.reviews?.length || 124} reviews)
            </AppText>
          </View>

          {/* Price Header */}
          <View style={styles.priceRow}>
            <AppText variant="display" weight="bold" color={colors.text.primary} style={styles.priceText}>
              {formatCurrency(product.price)}
            </AppText>
            <AppText variant="h3" color={colors.text.muted} style={styles.unitText}>
              /{product.unit || 'kg'}
            </AppText>
          </View>

          {/* Description */}
          <AppText variant="body" color={colors.text.secondary} style={styles.description}>
            {product.description ||
              'Fresh, juicy and organically grown straight from our farm. No chemicals, no shortcuts. Just pure goodness.'}
          </AppText>

          {/* 4. TRUST BADGES ROW (100% Organic, Farm Fresh, Traceable) */}
          <FarmketTrustBadges isOrganic={product.is_organic} style={styles.trustBadges} />

          {/* 5. SELECT QUANTITY */}
          <FarmketQuantitySelector
            quantity={quantity}
            unit={product.unit || 'kg'}
            min={1}
            max={Math.min(99, product.stock_quantity || 99)}
            onChange={setQuantity}
          />
        </View>
      </ScrollView>

      {/* 6. STICKY BOTTOM ADD TO CART CTA - Exact match for Screen 3 */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton
          title={`Add to Cart • ${formatCurrency(Number(product.price) * quantity)}`}
          variant="forest"
          size="lg"
          shape="pill"
          fullWidth
          leftIcon={<ShoppingCart size={18} color="#FFFFFF" strokeWidth={2.4} />}
          onPress={handleAddToCart}
          loading={addingToCart}
          style={styles.addToCartBtn}
        />
      </View>

      {/* Reservation Modal if applicable */}
      {isReservationOpen && product && (
        <ReservationModal
          visible={isReservationOpen}
          onClose={() => setIsReservationOpen(false)}
          product={product}
        />
      )}

      {/* Authentication Gate Modal */}
      {AuthGateModalComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9F5',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAECE7',
    ...shadows.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  // Large Product Visual
  heroVisualCard: {
    width: '100%',
    height: 240,
    backgroundColor: '#F8F9F5',
    borderRadius: radii.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#EAECE7',
    overflow: 'hidden',
  },
  heroImage: {
    width: '85%',
    height: '85%',
  },
  placeholderVisual: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Product Info
  infoSection: {
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    flex: 1,
    marginRight: spacing.sm,
  },
  organicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  // Farmer Row
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9F5',
    borderRadius: radii.xl,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#EAECE7',
  },
  farmerAvatarWrap: {
    marginRight: spacing.md,
  },
  farmerTextCol: {
    flex: 1,
  },
  followOutlineBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
    backgroundColor: '#FFFFFF',
  },
  followingBtn: {
    backgroundColor: colors.brand.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: spacing.xs,
  },
  priceText: {
    fontSize: 32,
    lineHeight: 38,
  },
  unitText: {
    fontSize: 16,
    marginLeft: 4,
  },
  description: {
    lineHeight: 22,
    marginVertical: spacing.sm,
  },
  trustBadges: {
    marginVertical: spacing.md,
  },
  // Sticky Bottom CTA
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EAECE7',
    ...shadows.lg,
  },
  addToCartBtn: {
    backgroundColor: colors.brand.forest,
  },
});
