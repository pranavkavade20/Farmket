import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppCard, AppButton, AppSkeleton, AppEmptyState } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import { PackageOpen } from 'lucide-react-native';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
                      <AppText weight="bold" color={colors.brand.primary}>
                        ${product.price}
                      </AppText>
                      <AppText variant="small" color={colors.text.muted}>
                        {' '}/ {product.unit}
                      </AppText>
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
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  welcomeSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  cardContainer: {
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
    alignItems: 'baseline',
    marginTop: spacing.xs,
  }
});
