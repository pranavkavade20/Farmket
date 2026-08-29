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
import { MapPin, ShoppingCart, Search, PackageOpen, Sprout, Tag } from 'lucide-react-native';
import { Image } from 'expo-image';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, itemCount } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Categories from backend
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Featured Products
  const { data: productsData, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ limit: 8 }), 
  });

  // Upcoming Harvests
  const { data: upcomingHarvests = [], isLoading: loadingHarvests, refetch: refetchHarvests } = useQuery({
    queryKey: ['upcoming-harvests'],
    queryFn: fetchUpcomingHarvests,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchProducts(), refetchHarvests()]);
    setRefreshing(false);
  }, [refetchCategories, refetchProducts, refetchHarvests]);

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      router.push('/(auth)/login');
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
                Fresh From Local Farms
              </AppText>
              <AppText variant="small" color={colors.text.inverse} style={{ marginTop: 4, marginBottom: 12, opacity: 0.9 }}>
                Pure, Organic produce direct to your doorstep.
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
        ) : productsData?.results.length === 0 ? (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <AppEmptyState 
              title="No Products" 
              description="No featured products available right now."
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
      </ScrollView>
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
});
