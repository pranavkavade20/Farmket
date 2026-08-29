import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppEmptyState, AppCard, AppSkeleton, AppProductCard } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { Search as SearchIcon, PackageOpen, SlidersHorizontal, ArrowLeft } from 'lucide-react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products';
import { useDebounce } from '../../hooks/useDebounce';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { AppButton } from '../../components/ui/AppButton';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [addingId, setAddingId] = useState<number | null>(null);

  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isError
  } = useInfiniteQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: ({ pageParam }) => fetchProducts({ pageParam: pageParam as string, search: debouncedQuery }),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: 'products/products/',
    enabled: debouncedQuery.length > 0,
  });

  const data = productsData?.pages.flatMap(page => page.results) || [];

  const handleEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleAddToCart = async (productId: number) => {
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setAddingId(null);
    }
  };

  const renderProduct = ({ item }: { item: any }) => {
    return (
      <AppProductCard 
        product={item} 
        layout="horizontal"
        onPress={(product) => router.push(`/product/${product.id}` as any)} 
        action={
          <AppButton 
            title="+" 
            size="sm" 
            style={styles.addButton}
            onPress={() => handleAddToCart(item.id)}
            loading={addingId === item.id}
          />
        }
      />
    );
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
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <AppInput
              placeholder="Search tomatoes, rice..."
              value={query}
              onChangeText={setQuery}
              leftIcon={<SearchIcon size={20} color={colors.text.muted} />}
              style={styles.searchInput}
              returnKeyType="search"
              autoFocus
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {!debouncedQuery ? (
        <ScrollView style={styles.idleContainer} keyboardShouldPersistTaps="handled">
          <AppText variant="subheading" weight="semibold" style={styles.sectionTitle}>Recent Searches</AppText>
          <View style={styles.chipsContainer}>
            {['Tomato', 'Basmati rice', 'Milk'].map((term) => (
              <TouchableOpacity key={term} style={styles.chip} onPress={() => setQuery(term)}>
                <AppText variant="small">{term}</AppText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.popularHeader}>
            <AppText variant="subheading" weight="semibold">Popular Categories</AppText>
            <TouchableOpacity>
              <AppText variant="small" weight="semibold" color={colors.brand.primary}>View all</AppText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesGrid}>
            {[
              { name: 'Fruits', icon: '🍎' },
              { name: 'Veggies', icon: '🥦' },
              { name: 'Dairy', icon: '🥛' },
              { name: 'Grains', icon: '🌾' },
              { name: 'Leafy', icon: '🥬' },
            ].map((cat) => (
              <TouchableOpacity key={cat.name} style={styles.categoryGridItem} onPress={() => setQuery(cat.name)}>
                <View style={styles.categoryIconCircle}>
                  <AppText style={{ fontSize: 24 }}>{cat.icon}</AppText>
                </View>
                <AppText variant="small" weight="medium" style={{ marginTop: 4 }}>{cat.name}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : isLoading ? (
        renderSkeletons()
      ) : isError ? (
        <AppEmptyState 
          title="Failed to Load" 
          description="We couldn't load the search results. Please try again."
          actionTitle="Retry"
          onAction={refetch}
        />
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <AppText weight="bold">Results for "{debouncedQuery}"</AppText>
            <AppText variant="small" color={colors.text.muted}>{data.length} items</AppText>
          </View>
          
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProduct}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            onScrollBeginDrag={Keyboard.dismiss}
            ListEmptyComponent={
              <AppEmptyState 
                title="No Results Found" 
                description={`We couldn't find anything matching "${debouncedQuery}".`}
                icon={<PackageOpen size={48} color={colors.brand.muted} />}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="small" color={colors.brand.primary} style={{ padding: spacing.md }} />
              ) : null
            }
          />
        </View>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.main,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
    height: 48,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.full,
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  categoryGridItem: {
    alignItems: 'center',
    width: '18%',
    marginBottom: spacing.md,
  },
  categoryIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
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
  addButton: {
    height: 32,
    width: 32,
    borderRadius: radii.full,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
