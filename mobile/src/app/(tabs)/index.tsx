import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppCard, AppButton, AppSkeleton, AppEmptyState, AppProductCard, AppCropCard } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories } from '../../api/products';
import { fetchUpcomingHarvests } from '../../api/crops';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useRequireAuth } from '../../components/auth/AuthGateModal';
import { MapPin, ShoppingCart, Search, PackageOpen, Sprout, Tag, ShieldCheck, Leaf, Truck, ArrowRight, UserPlus } from 'lucide-react-native';
import { Image } from 'expo-image';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, itemCount } = useCart();
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <AppText variant="small" color={colors.text.secondary}>Deliver to</AppText>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.brand.primary} style={{ marginRight: 4 }} />
            <AppText weight="bold" numberOfLines={1}>Bengaluru, KA</AppText>
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
          <ShoppingCart size={24} color={colors.text.primary} />
          {itemCount > 0 && (
            <View style={styles.badge}>
              <AppText variant="small" weight="bold" color={colors.text.inverse} style={styles.badgeText}>
                {itemCount}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} tintColor={colors.brand.primary} />
        }
      >
        {/* Search Bar routing to explore tab */}
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.fakeSearchInput} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Search size={20} color={colors.text.muted} />
            <AppText color={colors.text.muted} style={{ marginLeft: spacing.sm }}>
              Search fresh produce, farmers...
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroContainer}>
          <View style={styles.heroBanner}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1595856342625-63451e03bce6?auto=format&fit=crop&q=80&w=600' }} 
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <AppText variant="heading" weight="bold" color={colors.text.inverse}>
                Direct Farm-to-Table
              </AppText>
              <AppText variant="small" color={colors.text.inverse} style={{ marginTop: 4, marginBottom: 12, opacity: 0.9 }}>
                Pure, fresh harvest direct from local farmers without middlemen.
              </AppText>
              <AppButton 
                title="Shop Marketplace" 
                size="sm" 
                style={styles.heroButton} 
                onPress={() => router.push('/(tabs)/search')} 
              />
            </View>
          </View>
        </View>

        {/* Value Propositions Strip */}
        <View style={styles.valuePropsStrip}>
          <View style={styles.valuePropItem}>
            <View style={styles.valuePropIcon}>
              <Leaf size={16} color={colors.status.success} />
            </View>
            <AppText variant="small" weight="bold">100% Organic</AppText>
          </View>

          <View style={styles.valuePropItem}>
            <View style={styles.valuePropIcon}>
              <Sprout size={16} color={colors.brand.primary} />
            </View>
            <AppText variant="small" weight="bold">Pre-Book Crops</AppText>
          </View>

          <View style={styles.valuePropItem}>
            <View style={styles.valuePropIcon}>
              <ShieldCheck size={16} color={colors.status.info} />
            </View>
            <AppText variant="small" weight="bold">Fair Pricing</AppText>
          </View>
        </View>

        {/* Categories from Backend */}
        {categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.categoryItem} 
                  activeOpacity={0.7} 
                  onPress={() => router.push({
                    pathname: '/(tabs)/search',
                    params: { category: cat.slug }
                  } as any)}
                >
                  <View style={styles.categoryIconCircle}>
                    {cat.image ? (
                      <Image source={{ uri: cat.image }} style={styles.categoryImg} contentFit="cover" />
                    ) : (
                      <Tag size={20} color={colors.brand.primary} />
                    )}
                  </View>
                  <AppText variant="small" weight="medium" style={{ marginTop: 6 }} numberOfLines={1}>
                    {cat.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <AppText variant="subheading" weight="bold">Featured Produce</AppText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <AppText variant="small" weight="semibold" color={colors.brand.primary}>See all →</AppText>
          </TouchableOpacity>
        </View>
        
        {loadingProducts && !refreshing ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProductsScroll}>
            {[1, 2, 3].map((i) => (
              <AppCard key={i} elevated padding={0} style={styles.skeletonVerticalCard}>
                <AppSkeleton width="100%" height={140} borderRadius={0} />
                <View style={{ padding: spacing.md }}>
                  <AppSkeleton width="80%" height={16} style={{ marginBottom: 8 }} />
                  <AppSkeleton width="50%" height={14} style={{ marginBottom: 8 }} />
                  <AppSkeleton width="40%" height={18} />
                </View>
              </AppCard>
            ))}
          </ScrollView>
        ) : isProductsError ? (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <AppEmptyState 
              title="Couldn't Load Products" 
              description="Unable to connect to the Farmket server. Please check your network."
              actionTitle="Try Again"
              onAction={refetchProducts}
            />
          </View>
        ) : productsData?.results.length === 0 ? (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <AppEmptyState 
              title="No Products Available" 
              description="No featured products listed right now."
              icon={<PackageOpen size={48} color={colors.brand.muted} strokeWidth={1.5} />}
            />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProductsScroll}>
            {productsData?.results.map((product) => (
              <View key={product.id} style={styles.verticalCardWrapper}>
                <AppProductCard 
                  product={product} 
                  layout="vertical"
                  onPress={() => router.push(`/product/${product.id}` as any)}
                  action={
                    <AppButton 
                      title="Add" 
                      size="sm" 
                      fullWidth
                      variant="outline"
                      onPress={() => handleAddToCart(product.id)}
                      loading={addingId === product.id}
                    />
                  }
                />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Growing Harvests (Pre-booking Spotlight) */}
        {upcomingHarvests.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sprout size={18} color={colors.brand.primary} style={{ marginRight: 6 }} />
                <AppText variant="subheading" weight="bold">Upcoming Harvests</AppText>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                <AppText variant="small" weight="semibold" color={colors.brand.primary}>Pre-book →</AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.cropsListContainer}>
              {upcomingHarvests.slice(0, 3).map((crop) => (
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

        {/* Join Farmket Guest Banner */}
        {!user && (
          <View style={styles.guestBannerContainer}>
            <AppCard elevated padding="lg" style={styles.guestBannerCard}>
              <AppText variant="heading" weight="bold" color={colors.brand.primary}>
                Join Farmket Today
              </AppText>
              <AppText color={colors.text.secondary} style={{ marginTop: 4, marginBottom: spacing.md, lineHeight: 20 }}>
                Connect directly with farmers, pre-book harvests, or list your own agricultural produce.
              </AppText>
              <View style={styles.guestBannerActions}>
                <AppButton
                  title="Create Free Account"
                  size="sm"
                  onPress={() => router.push('/(auth)/register')}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <AppButton
                  title="Sign In"
                  size="sm"
                  variant="outline"
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  locationContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cartBtn: {
    padding: spacing.xs,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.status.danger,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  fakeSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  heroContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  heroBanner: {
    height: 160,
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    alignItems: 'flex-start',
  },
  heroButton: {
    backgroundColor: colors.background.surface,
  },
  valuePropsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.subtle,
    marginVertical: spacing.xs,
  },
  valuePropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valuePropIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingVertical: spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  categoryItem: {
    alignItems: 'center',
    width: 68,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  categoryImg: {
    width: '100%',
    height: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  horizontalProductsScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  verticalCardWrapper: {
    width: 160,
  },
  skeletonVerticalCard: {
    width: 160,
    overflow: 'hidden',
    borderRadius: radii.lg,
  },
  cropsListContainer: {
    paddingHorizontal: spacing.xl,
  },
  guestBannerContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  guestBannerCard: {
    backgroundColor: colors.brand.muted + '25',
    borderColor: colors.brand.primary + '35',
    borderWidth: 1,
  },
  guestBannerActions: {
    flexDirection: 'row',
  },
});
