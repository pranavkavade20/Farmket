import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  AppText,
  AppProductCard,
  AppCropCard,
  CategoryCard,
  ProductCardSkeleton,
  NotificationsModal,
} from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { fetchProducts, fetchCategories, Product } from '../../api/products';
import { fetchUpcomingHarvests } from '../../api/crops';
import { fetchNotifications } from '../../api/notifications';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useRequireAuth } from '../../components/auth/AuthGateModal';
import { FarmketLogo } from '../../components/illustrations/FarmketLogo';
import { FarmBannerSvg } from '../../components/illustrations/FarmBannerSvg';
import { FarmerAvatarSvg } from '../../components/illustrations/FarmerAvatarSvg';
import { Image } from 'expo-image';
import {
  Search,
  Bell,
  ArrowRight,
  Leaf,
  Calendar,
  MessageSquare,
  BarChart2,
  Sprout,
  Store,
  Package,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fallback curated products matching the reference image if backend is empty or offline
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Organic Tomatoes',
    slug: 'organic-tomatoes',
    farmer: 1,
    farmer_name: 'Ramesh Farm',
    category: 1,
    description: 'Fresh, juicy and organically grown tomatoes straight from our farm. No chemicals, no shortcuts. Just pure goodness.',
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
  },
  {
    id: 2,
    name: 'Fresh Spinach',
    slug: 'fresh-spinach',
    farmer: 2,
    farmer_name: 'Green Valley Farm',
    category: 1,
    description: 'Crisp, tender and vibrant spinach harvested early morning.',
    price: 30,
    unit: 'bunch',
    stock_quantity: 80,
    is_organic: true,
    is_available: true,
    in_stock: true,
    market_state: 'AVAILABLE_NOW',
    images: [],
    reviews: [],
    average_rating: 4.7,
    reviews_count: 98,
  },
  {
    id: 3,
    name: 'Sweet Carrots',
    slug: 'sweet-carrots',
    farmer: 1,
    farmer_name: 'Ramesh Farm',
    category: 1,
    description: 'Sweet, crunchy organic carrots freshly pulled from organic soil.',
    price: 35,
    unit: 'kg',
    stock_quantity: 90,
    is_organic: true,
    is_available: true,
    in_stock: true,
    market_state: 'AVAILABLE_NOW',
    images: [],
    reviews: [],
    average_rating: 4.9,
    reviews_count: 85,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { requireAuth, AuthGateModalComponent } = useRequireAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const isFarmer = user?.user_type === 'farmer';
  const displayName = user?.first_name 
    ? `${user.first_name}` 
    : (user?.username || '');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Categories from backend
  const { data: categories = [], isLoading: loadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Featured Products
  const { data: productsData, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ limit: 8 }),
  });

  // Upcoming Harvests
  const { data: upcomingHarvests = [], refetch: refetchHarvests } = useQuery({
    queryKey: ['upcoming-harvests'],
    queryFn: fetchUpcomingHarvests,
  });

  // Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: Boolean(user),
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchProducts(), refetchHarvests()]);
    setRefreshing(false);
  }, [refetchCategories, refetchProducts, refetchHarvests]);

  const handleAddToCart = async (product: Product) => {
    if (isFarmer) {
      return;
    }
    if (!requireAuth('Add to Cart', 'Sign in to add fresh produce to your cart and place direct farm orders.')) {
      return;
    }
    await addToCart(product.id, 1);
  };

  // Products to render (real backend products with fallback to curated items)
  const displayProducts =
    productsData?.results && productsData.results.length > 0
      ? productsData.results
      : DEFAULT_PRODUCTS;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 1. TOP HEADER - Reference Image Screen 2 */}
      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)')}>
          <FarmketLogo size={28} wordmarkSize="md" />
        </TouchableOpacity>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.75}
          >
            <Search size={20} color={colors.text.primary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setNotificationsVisible(true)}
            activeOpacity={0.75}
          >
            <Bell size={20} color={colors.text.primary} strokeWidth={2} />
            {unreadCount > 0 && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
            accessibilityLabel="View Profile"
          >
            {user?.profile_picture ? (
              <View style={styles.userAvatarWrap}>
                <Image
                  source={{ uri: user.profile_picture }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
                {isFarmer && (
                  <View style={styles.avatarRoleDot}>
                    <Sprout size={9} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>
            ) : user ? (
              <View style={styles.userAvatarWrap}>
                <View
                  style={[
                    styles.avatarInitialWrap,
                    isFarmer ? styles.farmerInitialWrap : styles.buyerInitialWrap,
                  ]}
                >
                  <AppText variant="caption" weight="bold" color="#FFFFFF" style={{ fontSize: 13 }}>
                    {(displayName || user.username || 'U').charAt(0).toUpperCase()}
                  </AppText>
                </View>
                {isFarmer && (
                  <View style={styles.avatarRoleDot}>
                    <Sprout size={9} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>
            ) : (
              <FarmerAvatarSvg size={36} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
      >
        {/* 2. HERO BANNER - Exact match for Screen 2 */}
        <View style={styles.heroCard}>
          <View style={styles.heroSvgBackground}>
            <FarmBannerSvg width={SCREEN_WIDTH - spacing.lg * 2} height={148} variant="homeHero" />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroTextCol}>
              <View style={styles.heroGreetingRow}>
                <AppText variant="caption" weight="semibold" color="rgba(255,255,255,0.92)">
                  {getGreeting()}{displayName ? `, ${displayName}` : ''}
                </AppText>
                {user && (
                  <View
                    style={[
                      styles.heroRoleBadge,
                      isFarmer ? styles.heroRoleFarmer : styles.heroRoleBuyer,
                    ]}
                  >
                    <AppText variant="label" weight="bold" color="#FFFFFF" style={{ fontSize: 9 }}>
                      {isFarmer ? 'FARMER' : 'BUYER'}
                    </AppText>
                  </View>
                )}
              </View>

              <AppText variant="h2" weight="bold" color="#FFFFFF" style={styles.heroHeadline}>
                Fresh produce{'\n'}straight from{'\n'}local farms
              </AppText>

              {isFarmer && user?.farm_name ? (
                <AppText variant="label" color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>
                  🌾 {user.farm_name}
                </AppText>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.heroArrowBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <ArrowRight size={18} color={colors.brand.forest} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. QUICK ACTIONS ROW - Role-tailored */}
        <View style={styles.quickActionsRow}>
          {isFarmer ? (
            <>
              {/* Farmer Action 1: My Crops */}
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.8}
                onPress={() => router.push('/farmer-crops' as any)}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Sprout size={19} color="#15803D" strokeWidth={2.4} />
                </View>
                <AppText variant="caption" weight="medium" color={colors.text.primary} align="center" style={styles.quickActionLabel}>
                  Crops{'\n'}Tracking
                </AppText>
              </TouchableOpacity>

              {/* Farmer Action 2: Public Storefront */}
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <Store size={19} color="#D97706" strokeWidth={2.4} />
                </View>
                <AppText variant="caption" weight="medium" color={colors.text.primary} align="center" style={styles.quickActionLabel}>
                  Farm{'\n'}Storefront
                </AppText>
              </TouchableOpacity>

              {/* Farmer Action 3: Messages */}
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/chat')}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#F0F9FF' }]}>
                  <MessageSquare size={19} color="#2563EB" strokeWidth={2.4} />
                </View>
                <AppText variant="caption" weight="medium" color={colors.text.primary} align="center" style={styles.quickActionLabel}>
                  Farmer{'\n'}Chat
                </AppText>
              </TouchableOpacity>

              {/* Farmer Action 4: Incoming Orders */}
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/orders')}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#FAF5FF' }]}>
                  <Package size={19} color="#7C3AED" strokeWidth={2.4} />
                </View>
                <AppText variant="caption" weight="medium" color={colors.text.primary} align="center" style={styles.quickActionLabel}>
                  Farm{'\n'}Orders
                </AppText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Buyer Action 1: Browse Products */}
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/search')}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Leaf size={18} color="#15803D" strokeWidth={2.4} />
                </View>
                <AppText variant="caption" weight="medium" color={colors.text.primary} align="center" style={styles.quickActionLabel}>
                  Browse{'\n'}Products
                </AppText>
              </TouchableOpacity>

              {/* Buyer Action 2: Pre-Book Harvests */}
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/search')}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <Calendar size={18} color="#D97706" strokeWidth={2.4} />
                </View>
                <AppText variant="caption" weight="medium" color={colors.text.primary} align="center" style={styles.quickActionLabel}>
                  Pre-Book{'\n'}Harvests
                </AppText>
              </TouchableOpacity>

              {/* Buyer Action 3: Chat with Farmers */}
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/chat')}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#F0F9FF' }]}>
                  <MessageSquare size={18} color="#2563EB" strokeWidth={2.4} />
                </View>
                <AppText variant="caption" weight="medium" color={colors.text.primary} align="center" style={styles.quickActionLabel}>
                  Chat{'\n'}with Farmers
                </AppText>
              </TouchableOpacity>

              {/* Buyer Action 4: Track Orders */}
              <TouchableOpacity
                style={styles.quickActionItem}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/orders')}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#FAF5FF' }]}>
                  <BarChart2 size={18} color="#7C3AED" strokeWidth={2.4} />
                </View>
                <AppText variant="caption" weight="medium" color={colors.text.primary} align="center" style={styles.quickActionLabel}>
                  Track{'\n'}Orders
                </AppText>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 4. FEATURED PRODUCTS CAROUSEL - Exact match for Screen 2 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3" weight="bold" color={colors.text.primary}>
              Featured Products
            </AppText>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.7}
            >
              <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                View All
              </AppText>
              <ArrowRight size={13} color={colors.brand.primary} strokeWidth={2.4} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          {loadingProducts && !refreshing ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {[1, 2].map((i) => (
                <View key={i} style={{ marginRight: spacing.md }}>
                  <ProductCardSkeleton layout="vertical" />
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {displayProducts.map((product) => (
                <View key={product.id} style={{ marginRight: spacing.md }}>
                  <AppProductCard
                    product={product}
                    layout="vertical"
                    onPress={() => router.push(`/product/${product.id}` as any)}
                    onQuickAdd={!isFarmer ? () => handleAddToCart(product) : undefined}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 5. POPULAR CATEGORIES - Live from Backend */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3" weight="bold" color={colors.text.primary}>
              Popular Categories
            </AppText>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.7}
            >
              <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                View All
              </AppText>
              <ArrowRight size={13} color={colors.brand.primary} strokeWidth={2.4} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          {loadingCategories && categories.length === 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.categorySkeleton} />
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {(categories.length > 0
                ? categories
                : [
                    { id: 1, name: 'Vegetables', slug: 'vegetables' },
                    { id: 2, name: 'Fruits', slug: 'fruits' },
                    { id: 3, name: 'Grains', slug: 'grains' },
                    { id: 5, name: 'Dairy', slug: 'dairy-animal-products' },
                  ]
              ).map((cat) => (
                <View key={cat.id} style={{ marginRight: spacing.sm }}>
                  <CategoryCard
                    name={cat.name}
                    slug={cat.slug}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/search',
                        params: { category: cat.slug },
                      } as any)
                    }
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 6. UPCOMING HARVESTS (Crop Lifecycle Preservation) */}
        {upcomingHarvests.length > 0 && (
          <View style={[styles.sectionContainer, { marginTop: spacing.md }]}>
            <View style={styles.sectionHeader}>
              <AppText variant="h3" weight="bold" color={colors.text.primary}>
                Pre-Book Harvests
              </AppText>
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/(tabs)/search')}
                activeOpacity={0.7}
              >
                <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                  View All
                </AppText>
                <ArrowRight size={13} color={colors.brand.primary} strokeWidth={2.4} style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.cropsList}>
              {upcomingHarvests.slice(0, 2).map((crop) => (
                <AppCropCard
                  key={crop.id}
                  crop={crop}
                  onPress={() => {
                    if (crop.product) {
                      router.push(`/product/${crop.product}` as any);
                    }
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />

      {/* Authentication Gate Modal */}
      {AuthGateModalComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: '#F8F9F5',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAECE7',
    position: 'relative',
    ...shadows.xs,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarBtn: {
    marginLeft: 2,
  },
  userAvatarWrap: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  avatarInitialWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    ...shadows.xs,
  },
  farmerInitialWrap: {
    backgroundColor: '#15803D',
  },
  buyerInitialWrap: {
    backgroundColor: '#0284C7',
  },
  avatarRoleDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  // Hero Section
  heroGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroRoleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radii.pill,
  },
  heroRoleFarmer: {
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
  },
  heroRoleBuyer: {
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    borderRadius: radii.xxxl,
    overflow: 'hidden',
    height: 148,
    position: 'relative',
    backgroundColor: colors.brand.forest,
    ...shadows.sm,
  },
  heroSvgBackground: {
    ...StyleSheet.absoluteFill,
  },
  heroContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    zIndex: 2,
  },
  heroTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroHeadline: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 4,
  },
  heroArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  // Quick Actions Row
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  quickActionIconBox: {
    width: 52,
    height: 52,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...shadows.xs,
  },
  quickActionLabel: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  // Sections
  sectionContainer: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalScroll: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingBottom: spacing.xs,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  categoriesScroll: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingBottom: spacing.xs,
  },
  categorySkeleton: {
    width: 86,
    height: 94,
    borderRadius: radii.xl,
    backgroundColor: '#EAECE7',
    marginRight: spacing.sm,
    opacity: 0.6,
  },
  cropsList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
});
