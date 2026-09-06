import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  AppText, 
  AppCard, 
  AppButton, 
  AppProductCard, 
  AppCropCard, 
  SectionHeader, 
  ProductCardSkeleton, 
  CropCardSkeleton, 
  AppEmptyState 
} from '../../components/ui';
import { TopBarActions } from '../../components/navigation/TopBarActions';
import { colors, spacing, radii, shadows } from '../../theme';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories } from '../../api/products';
import { fetchUpcomingHarvests } from '../../api/crops';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useRequireAuth } from '../../components/auth/AuthGateModal';
import { 
  MapPin, 
  Search, 
  PackageOpen, 
  Sprout, 
  Tag, 
  ShieldCheck, 
  Leaf, 
  Truck, 
  ChevronDown, 
  Sparkles,
  ArrowRight
} from 'lucide-react-native';
import { Image } from 'expo-image';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { requireAuth, AuthGateModalComponent } = useRequireAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Categories from backend
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Featured Products
  const { data: productsData, isLoading: loadingProducts, isError: isProductsError, refetch: refetchProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ limit: 8 }), 
  });

  // Upcoming Harvests
  const { data: upcomingHarvests = [], isLoading: loadingHarvests, isError: isHarvestsError, refetch: refetchHarvests } = useQuery({
    queryKey: ['upcoming-harvests'],
    queryFn: fetchUpcomingHarvests,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchProducts(), refetchHarvests()]);
    setRefreshing(false);
  }, [refetchCategories, refetchProducts, refetchHarvests]);

  const handleAddToCart = async (productId: number) => {
    if (!requireAuth('Add to Cart', 'Sign in to add fresh produce to your cart and place direct farm orders.')) {
      return;
    }
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar with Location & Unified TopBarActions */}
      <View style={styles.topBar}>
        <View style={styles.locationContainer}>
          <AppText variant="label" color={colors.text.muted}>
            DELIVER TO
          </AppText>
          <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
            <MapPin size={15} color={colors.brand.primary} />
            <AppText variant="bodySmall" weight="bold" color={colors.text.primary} numberOfLines={1} style={{ marginLeft: 4 }}>
              Bengaluru, Karnataka
            </AppText>
            <ChevronDown size={14} color={colors.text.muted} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        <TopBarActions showCart={true} showNotifications={true} />
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
        {/* Search Bar Banner */}
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.searchBar} 
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Search size={18} color={colors.brand.primary} />
            <AppText variant="bodySmall" color={colors.text.muted} style={{ marginLeft: spacing.sm, flex: 1 }}>
              Search organic veggies, fruits, crops...
            </AppText>
            <View style={styles.searchTag}>
              <AppText variant="label" weight="semibold" color={colors.brand.primary}>
                Explore
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroContainer}>
          <View style={styles.heroBanner}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1595856342625-63451e03bce6?auto=format&fit=crop&q=80&w=800' }} 
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.heroPill}>
                <Sparkles size={11} color="#FFFFFF" />
                <AppText variant="label" color="#FFFFFF" weight="bold" style={{ marginLeft: 4 }}>
                  DIRECT HARVEST
                </AppText>
              </View>
              <AppText variant="h1" weight="bold" color="#FFFFFF" style={styles.heroHeading}>
                Pure Farm-to-Table
              </AppText>
              <AppText variant="bodySmall" color="rgba(255,255,255,0.9)" style={styles.heroSubtitle}>
                Taste produce picked hours before delivery, directly supporting local growers.
              </AppText>
              <AppButton 
                title="Shop Marketplace" 
                size="sm" 
                shape="pill"
                variant="accent"
                rightIcon={<ArrowRight size={14} color="#FFFFFF" strokeWidth={2.4} />}
                style={styles.heroButton} 
                onPress={() => router.push('/(tabs)/search')} 
              />
            </View>
          </View>
        </View>

        {/* Value Proposition Strip */}
        <View style={styles.valueStrip}>
          <View style={styles.valueItem}>
            <View style={[styles.valueIconWrapper, { backgroundColor: '#ECFDF5' }]}>
              <Leaf size={14} color={colors.status.success} />
            </View>
            <AppText variant="label" weight="bold" color={colors.text.primary}>100% Organic</AppText>
          </View>

          <View style={styles.valueItem}>
            <View style={[styles.valueIconWrapper, { backgroundColor: '#F0FDFA' }]}>
              <Sprout size={14} color={colors.brand.primary} />
            </View>
            <AppText variant="label" weight="bold" color={colors.text.primary}>Pre-Book Crops</AppText>
          </View>

          <View style={styles.valueItem}>
            <View style={[styles.valueIconWrapper, { backgroundColor: '#EFF6FF' }]}>
              <ShieldCheck size={14} color={colors.status.info} />
            </View>
            <AppText variant="label" weight="bold" color={colors.text.primary}>Direct Pricing</AppText>
          </View>
        </View>

        {/* Categories Rail */}
        {categories.length > 0 && (
          <View style={styles.sectionWrapper}>
            <SectionHeader 
              title="Shop by Category" 
              actionTitle="View all" 
              onAction={() => router.push('/(tabs)/search')} 
              style={styles.sectionHeader}
            />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.categoryItem} 
                  activeOpacity={0.75} 
                  onPress={() => router.push({
                    pathname: '/(tabs)/search',
                    params: { category: cat.slug }
                  } as any)}
                >
                  <View style={styles.categoryIconCircle}>
                    {cat.image ? (
                      <Image source={{ uri: cat.image }} style={styles.categoryImg} contentFit="cover" transition={200} />
                    ) : (
                      <Tag size={22} color={colors.brand.primary} />
                    )}
                  </View>
                  <AppText variant="label" weight="semibold" align="center" numberOfLines={1} style={styles.categoryLabel}>
                    {cat.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Products Carousel */}
        <View style={styles.sectionWrapper}>
          <SectionHeader 
            title="Fresh In Season" 
            subtitle="Hand-picked daily by verified farmers"
            actionTitle="See all" 
            onAction={() => router.push('/(tabs)/search')} 
            style={styles.sectionHeader}
          />
          
          {loadingProducts && !refreshing ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProductsScroll}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.productCardWrapper}>
                  <ProductCardSkeleton layout="vertical" />
                </View>
              ))}
            </ScrollView>
          ) : isProductsError ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <AppEmptyState 
                title="Couldn't Load Products" 
                description="Unable to connect to the server. Please check your connection."
                actionTitle="Try Again"
                onAction={refetchProducts}
              />
            </View>
          ) : productsData?.results.length === 0 ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <AppEmptyState 
                title="No Products Available" 
                description="No products in this section at the moment."
                icon={<PackageOpen size={40} color={colors.brand.muted} />}
              />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProductsScroll}>
              {productsData?.results.map((product) => (
                <View key={product.id} style={styles.productCardWrapper}>
                  <AppProductCard 
                    product={product} 
                    layout="vertical"
                    onPress={() => router.push(`/product/${product.id}` as any)}
                    action={
                      <AppButton 
                        title="Add" 
                        size="xs" 
                        variant="primary"
                        shape="pill"
                        onPress={() => handleAddToCart(product.id)}
                        loading={addingId === product.id}
                      />
                    }
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Upcoming Harvests (Crop Lifecycle Showcase) */}
        {upcomingHarvests.length > 0 && (
          <View style={[styles.sectionWrapper, { marginTop: spacing.md }]}>
            <SectionHeader 
              title="Pre-Book Upcoming Harvests" 
              subtitle="Lock in harvest quota before field harvesting begins"
              actionTitle="Explore all" 
              onAction={() => router.push('/(tabs)/search')} 
              style={styles.sectionHeader}
            />

            <View style={styles.cropsList}>
              {upcomingHarvests.slice(0, 3).map((crop) => (
                <AppCropCard
                  key={crop.id}
                  crop={crop}
                  onPress={() => {
                    if (crop.product) {
                      router.push(`/product/${crop.product}` as any);
                    }
                  }}
                  action={
                    crop.product ? (
                      <AppButton
                        title="Pre-Book Produce"
                        size="sm"
                        variant="secondary"
                        shape="rounded"
                        fullWidth
                        onPress={() => router.push(`/product/${crop.product}` as any)}
                      />
                    ) : undefined
                  }
                />
              ))}
            </View>
          </View>
        )}

        {/* Guest Onboarding Banner */}
        {!user && (
          <View style={styles.guestBannerContainer}>
            <AppCard variant="tinted" padding="xl" borderRadius={radii.xxl} style={styles.guestCard}>
              <View style={styles.guestBadge}>
                <Sprout size={16} color={colors.brand.primary} />
                <AppText variant="label" weight="bold" color={colors.brand.primary} style={{ marginLeft: 4 }}>
                  FARMKET COMMUNITY
                </AppText>
              </View>
              <AppText variant="h2" weight="bold" color={colors.text.primary} style={{ marginTop: spacing.xs }}>
                Grow or Buy with Farmket
              </AppText>
              <AppText variant="bodySmall" color={colors.text.secondary} style={styles.guestSubtitle}>
                Pre-book harvests with guaranteed pricing, or list crops directly to thousands of fresh buyers.
              </AppText>
              <View style={styles.guestActions}>
                <AppButton
                  title="Create Free Account"
                  size="sm"
                  shape="pill"
                  onPress={() => router.push('/(auth)/register')}
                  style={{ flex: 1.2, marginRight: spacing.sm }}
                />
                <AppButton
                  title="Sign In"
                  size="sm"
                  variant="outline"
                  shape="pill"
                  onPress={() => router.push('/(auth)/login')}
                  style={{ flex: 1 }}
                />
              </View>
            </AppCard>
          </View>
        )}
      </ScrollView>

      {/* Authentication Gate Modal */}
      {AuthGateModalComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.surface,
  },
  locationContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.huge,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  searchTag: {
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  heroContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroBanner: {
    height: 180,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 47, 46, 0.62)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    alignItems: 'flex-start',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginBottom: spacing.xs,
  },
  heroHeading: {
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    marginBottom: spacing.md,
    maxWidth: 240,
    lineHeight: 18,
  },
  heroButton: {
    paddingHorizontal: spacing.lg,
  },
  valueStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.subtle,
    marginTop: spacing.lg,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionWrapper: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
    ...shadows.xs,
  },
  categoryImg: {
    width: '100%',
    height: '100%',
  },
  categoryLabel: {
    marginTop: 6,
    fontSize: 11,
  },
  horizontalProductsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  productCardWrapper: {
    width: 172,
  },
  cropsList: {
    paddingHorizontal: spacing.lg,
  },
  guestBannerContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  guestCard: {
    backgroundColor: colors.brand.tint,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestSubtitle: {
    marginTop: 4,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  guestActions: {
    flexDirection: 'row',
  },
});
