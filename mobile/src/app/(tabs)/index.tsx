import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppCard, AppButton, AppSkeleton, AppEmptyState, AppProductCard } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { MapPin, ShoppingCart, Search, PackageOpen } from 'lucide-react-native';
import { Image } from 'expo-image';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, itemCount } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ limit: 10 }), 
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  const categories = [
    { id: 1, name: 'Fruits', icon: '🍎' },
    { id: 2, name: 'Veg', icon: '🥦' },
    { id: 3, name: 'Dairy', icon: '🥛' },
    { id: 4, name: 'Grains', icon: '🌾' },
    { id: 5, name: 'More', icon: '✨' },
  ];

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
        {/* Fake Search Bar routing to actual search tab */}
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.fakeSearchInput} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Search size={20} color={colors.text.muted} />
            <AppText color={colors.text.muted} style={{ marginLeft: spacing.sm }}>
              Search products, farmers...
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
                Fresh from Farms
              </AppText>
              <AppText variant="body" color={colors.text.inverse} style={{ marginTop: 4, marginBottom: 12 }}>
                Pure, Organic, Delivered.
              </AppText>
              <AppButton 
                title="Shop Now" 
                size="sm" 
                style={styles.heroButton} 
                onPress={() => router.push('/(tabs)/search')} 
              />
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem} activeOpacity={0.7} onPress={() => router.push('/(tabs)/search')}>
                <View style={styles.categoryIconCircle}>
                  <AppText style={{ fontSize: 24 }}>{cat.icon}</AppText>
                </View>
                <AppText variant="small" weight="medium" style={{ marginTop: 8 }}>{cat.name}</AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <AppText variant="subheading" weight="bold">Featured Products</AppText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <AppText variant="small" weight="semibold" color={colors.brand.primary}>See all</AppText>
          </TouchableOpacity>
        </View>
        
        {isLoading && !refreshing ? (
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
        ) : error ? (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <AppEmptyState 
              title="Failed to Load" 
              description="Couldn't load products."
              actionTitle="Retry"
              onAction={refetch}
            />
          </View>
        ) : productsData?.results.length === 0 ? (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <AppEmptyState 
              title="No Products" 
              description="No featured products available."
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  },
  categoryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
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
  }
});
