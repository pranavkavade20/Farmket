import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppEmptyState, AppCard, AppSkeleton, AppProductCard, AppCropCard } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { Search as SearchIcon, PackageOpen, Sprout } from 'lucide-react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products';
import { fetchCrops } from '../../api/crops';
import { useDebounce } from '../../hooks/useDebounce'; // We need to create this hook!

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [activeTab, setActiveTab] = useState<'products' | 'crops'>('products');

  const {
    data: productsData,
    fetchNextPage: fetchNextProducts,
    hasNextPage: hasNextProducts,
    isFetchingNextPage: isFetchingNextProducts,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
    isError: isProductsError
  } = useInfiniteQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: ({ pageParam }) => fetchProducts({ pageParam: pageParam as string, search: debouncedQuery }),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: 'products/products/',
    enabled: activeTab === 'products',
  });

  const {
    data: cropsData,
    fetchNextPage: fetchNextCrops,
    hasNextPage: hasNextCrops,
    isFetchingNextPage: isFetchingNextCrops,
    isLoading: isCropsLoading,
    refetch: refetchCrops,
    isError: isCropsError
  } = useInfiniteQuery({
    queryKey: ['crops', 'search', debouncedQuery],
    queryFn: ({ pageParam }) => fetchCrops({ pageParam: pageParam as string, search: debouncedQuery }),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: 'crops/',
    enabled: activeTab === 'crops',
  });

  const isLoading = activeTab === 'products' ? isProductsLoading : isCropsLoading;
  const isError = activeTab === 'products' ? isProductsError : isCropsError;
  const data = activeTab === 'products' 
    ? productsData?.pages.flatMap(page => page.results) 
    : cropsData?.pages.flatMap(page => page.results);

  const handleEndReached = () => {
    if (activeTab === 'products' && hasNextProducts) {
      fetchNextProducts();
    } else if (activeTab === 'crops' && hasNextCrops) {
      fetchNextCrops();
    }
  };

  const renderProduct = ({ item }: { item: any }) => {
    return <AppProductCard product={item} onPress={(product) => console.log('Product clicked:', product.id)} />;
  };

  const renderCrop = ({ item }: { item: any }) => {
    return <AppCropCard crop={item} onPress={(crop) => console.log('Crop clicked:', crop.id)} />;
  };

  const renderSkeletons = () => (
    <View style={styles.listContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <AppCard key={i} elevated padding="md" style={styles.card}>
          <AppSkeleton width={80} height={80} borderRadius={radii.md} />
          <View style={styles.info}>
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
      <View style={styles.header}>
        <AppInput
          placeholder="Search products, crops..."
          value={query}
          onChangeText={setQuery}
          leftIcon={<SearchIcon size={20} color={colors.text.muted} />}
          style={styles.searchInput}
          returnKeyType="search"
        />
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <AppText weight="semibold" color={activeTab === 'products' ? colors.brand.primary : colors.text.secondary}>Products</AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'crops' && styles.activeTab]}
            onPress={() => setActiveTab('crops')}
          >
            <AppText weight="semibold" color={activeTab === 'crops' ? colors.brand.primary : colors.text.secondary}>Crops</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        renderSkeletons()
      ) : isError ? (
        <AppEmptyState 
          title="Failed to Load" 
          description="We couldn't load the search results. Please try again."
          actionTitle="Retry"
          onAction={activeTab === 'products' ? refetchProducts : refetchCrops}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={activeTab === 'products' ? renderProduct : renderCrop}
          contentContainerStyle={styles.listContainer}
          keyboardShouldPersistTaps="handled"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <AppEmptyState 
              title="No Results Found" 
              description={`We couldn't find any ${activeTab} matching "${query}".`}
              icon={activeTab === 'products' ? <PackageOpen size={48} color={colors.brand.muted} /> : <Sprout size={48} color={colors.brand.muted} />}
            />
          }
          ListFooterComponent={
            (isFetchingNextProducts || isFetchingNextCrops) ? (
              <ActivityIndicator size="small" color={colors.brand.primary} style={{ padding: spacing.md }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    padding: spacing.md,
    paddingBottom: 0,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  searchInput: {
    backgroundColor: colors.background.main,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.brand.primary,
  },
  listContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
});
