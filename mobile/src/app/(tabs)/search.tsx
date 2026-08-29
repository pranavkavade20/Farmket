import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppEmptyState, AppCard, AppSkeleton, AppProductCard, AppBadge } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { Search as SearchIcon, PackageOpen, SlidersHorizontal, X } from 'lucide-react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, Product } from '../../api/products';
import { useDebounce } from '../../hooks/useDebounce';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { AppButton } from '../../components/ui/AppButton';
import { FilterModal } from '../../components/marketplace/FilterModal';
import { useRequireAuth } from '../../components/auth/AuthGateModal';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToCart } = useCart();
  const { requireAuth, AuthGateModalComponent } = useRequireAuth();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('-created_at');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const activeFilterCount = (selectedCategory ? 1 : 0) + (organicOnly ? 1 : 0) + (sortBy !== '-created_at' ? 1 : 0);

  // Fetch products with infinite pagination and filters
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isError
  } = useInfiniteQuery({
    queryKey: ['products', 'search', debouncedQuery, selectedCategory, organicOnly, sortBy],
    queryFn: ({ pageParam }) => fetchProducts({
      pageParam: pageParam as string,
      search: debouncedQuery,
      category__slug: selectedCategory || undefined,
      is_organic: organicOnly || undefined,
      ordering: sortBy,
    }),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: 'products/products/',
  });

  const data: Product[] = productsData?.pages.flatMap(page => page.results) || [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!requireAuth('Add to Cart', 'Sign in to add fresh produce to your cart.')) {
      return;
    }
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setAddingId(null);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setOrganicOnly(false);
    setSortBy('-created_at');
    setQuery('');
  };

  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <AppProductCard 
        product={item} 
        layout="horizontal"
        onPress={(product) => router.push(`/product/${product.id}` as any)} 
        action={
          <AppButton 
            title="Add" 
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
        <AppCard key={i} elevated padding="md" style={styles.skeletonCard}>
          <AppSkeleton width={80} height={80} borderRadius={radii.lg} />
          <View style={styles.skeletonInfo}>
            <AppSkeleton width="80%" height={18} style={{ marginBottom: spacing.xs }} />
            <AppSkeleton width="50%" height={14} style={{ marginBottom: spacing.xs }} />
            <AppSkeleton width="40%" height={16} />
          </View>
        </AppCard>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Search and Filter button */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <AppInput
              placeholder="Search produce, farmers..."
              value={query}
              onChangeText={setQuery}
              leftIcon={<SearchIcon size={20} color={colors.text.muted} />}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]} 
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.8}
          >
            <SlidersHorizontal size={20} color={activeFilterCount > 0 ? colors.brand.primary : colors.text.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <AppText variant="small" weight="bold" color={colors.text.inverse} style={{ fontSize: 10 }}>
                  {activeFilterCount}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Horizontal Pills */}
        {categories.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryPillsScroll}
          >
            <TouchableOpacity
              style={[styles.pill, !selectedCategory && styles.pillActive]}
              onPress={() => setSelectedCategory('')}
            >
              <AppText 
                variant="small" 
                weight={!selectedCategory ? 'bold' : 'medium'}
                color={!selectedCategory ? colors.brand.primary : colors.text.secondary}
              >
                All
              </AppText>
            </TouchableOpacity>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                >
                  <AppText 
                    variant="small" 
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? colors.brand.primary : colors.text.secondary}
                  >
                    {cat.name}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Active Filter Chips */}
        {(organicOnly || selectedCategory) && (
          <View style={styles.activeFiltersRow}>
            {organicOnly && (
              <TouchableOpacity style={styles.activeTag} onPress={() => setOrganicOnly(false)}>
                <AppText variant="small" color={colors.brand.primary}>Organic Only</AppText>
                <X size={12} color={colors.brand.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            {selectedCategory && (
              <TouchableOpacity style={styles.activeTag} onPress={() => setSelectedCategory('')}>
                <AppText variant="small" color={colors.brand.primary}>
                  {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                </AppText>
                <X size={12} color={colors.brand.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Main Results / Idle State */}
      {isLoading ? (
        renderSkeletons()
      ) : isError ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="Failed to Load" 
            description="We couldn't load the marketplace products. Please try again."
            actionTitle="Retry"
            onAction={refetch}
          />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="No Products Found" 
            description={
              query || activeFilterCount > 0
                ? "We couldn't find any products matching your filters. Try clearing some criteria."
                : "No marketplace products are available right now."
            }
            icon={<PackageOpen size={48} color={colors.brand.muted} strokeWidth={1.5} />}
            actionTitle={activeFilterCount > 0 || query ? "Clear Filters" : undefined}
            onAction={activeFilterCount > 0 || query ? clearAllFilters : undefined}
          />
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <AppText weight="bold">
              {query ? `Results for "${query}"` : 'All Products'}
            </AppText>
            <AppText variant="small" color={colors.text.muted}>
              {data.length} items
            </AppText>
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
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="small" color={colors.brand.primary} style={{ padding: spacing.md }} />
              ) : null
            }
          />
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        organicOnly={organicOnly}
        onToggleOrganic={setOrganicOnly}
        sortBy={sortBy}
        onSelectSort={setSortBy}
        onClearFilters={() => {
          setSelectedCategory('');
          setOrganicOnly(false);
          setSortBy('-created_at');
        }}
        activeFilterCount={activeFilterCount}
      />

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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
    height: 48,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.muted,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.brand.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillsScroll: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  pillActive: {
    backgroundColor: colors.brand.muted,
    borderColor: colors.brand.primary,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: colors.brand.muted,
    borderRadius: radii.full,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.background.surface,
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  addButton: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
  }
});
