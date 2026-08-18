import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppCard, AppButton, AppSkeleton, AppEmptyState } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { PackageOpen, ShoppingCart } from 'lucide-react-native';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToCart, itemCount } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
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

  const renderSkeletons = () => (
    <View style={styles.cardContainer}>
      {[1, 2, 3, 4].map((i) => (
        <AppCard key={i} elevated padding="md" style={styles.productCard}>
          <AppSkeleton width={80} height={80} borderRadius={radii.md} />
          <View style={styles.productInfo}>
            <AppSkeleton width="80%" height={20} style={{ marginBottom: spacing.xs }} />
            <AppSkeleton width="50%" height={14} style={{ marginBottom: spacing.xs }} />
            <AppSkeleton width="30%" height={18} />
          </View>
        </AppCard>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.brand.primary]} 
            tintColor={colors.brand.primary}
          />
        }
      >
        <View style={styles.header}>
          <AppText variant="headingLg" weight="bold" color={colors.brand.primary}>
            Farmket
          </AppText>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.cartBtn} 
              onPress={() => router.push('/cart')}
            >
              <ShoppingCart size={24} color={colors.text.primary} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <AppText variant="small" weight="bold" color={colors.text.inverse} style={styles.badgeText}>
                    {itemCount}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
            {user ? (
              <AppButton 
                title="Logout" 
                variant="outline" 
                size="sm" 
                onPress={logout} 
              />
            ) : (
              <AppButton 
                title="Login" 
                variant="outline" 
                size="sm" 
                onPress={() => router.push('/(auth)/login')} 
              />
            )}
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <AppText variant="subheading" weight="semibold">
            {user ? `Welcome back, ${user.first_name}!` : 'Fresh from farm to you.'}
          </AppText>
        </View>

        <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>
          Featured Products
        </AppText>
        
        {isLoading && !refreshing ? (
          renderSkeletons()
        ) : error ? (
          <AppEmptyState 
            title="Failed to Load" 
            description="We couldn't load the products right now. Please try again."
            actionTitle="Retry"
            onAction={refetch}
          />
        ) : productsData?.results.length === 0 ? (
          <AppEmptyState 
            title="No Products Found" 
            description="There are currently no products available in the market."
            icon={<PackageOpen size={48} color={colors.brand.muted} strokeWidth={1.5} />}
            actionTitle="Refresh"
            onAction={refetch}
          />
        ) : (
          <View style={styles.cardContainer}>
            {productsData?.results.map((product) => {
              const primaryImage = product.images?.find(img => img.is_primary)?.image || product.images?.[0]?.image;
              
              return (
                <AppCard key={product.id} elevated padding="md" style={styles.productCard}>
                  {primaryImage ? (
                    <Image 
                      source={{ uri: primaryImage }} 
                      style={styles.productImage} 
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <AppText variant="small" color={colors.text.muted}>No image</AppText>
                    </View>
                  )}
                  
                  <View style={styles.productInfo}>
                    <AppText weight="bold" numberOfLines={1}>{product.name}</AppText>
                    <AppText variant="small" color={colors.text.secondary} numberOfLines={1}>
                      By {product.farmer.farm_name || `${product.farmer.first_name} ${product.farmer.last_name}`}
                    </AppText>
                    <View style={styles.priceRow}>
                      <View style={{ flex: 1 }}>
                        <AppText weight="bold" color={colors.brand.primary}>
                          ${product.price}
                        </AppText>
                        <AppText variant="small" color={colors.text.muted}>
                          {' '}/ {product.unit}
                        </AppText>
                      </View>
                      <AppButton 
                        title="Add" 
                        size="sm" 
                        onPress={() => handleAddToCart(product.id)}
                        loading={addingId === product.id}
                      />
                    </View>
                  </View>
                </AppCard>
              );
            })}
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
    marginBottom: spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBtn: {
    padding: spacing.xs,
    marginRight: spacing.md,
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
  welcomeSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  cardContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.border.subtle,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  }
});
