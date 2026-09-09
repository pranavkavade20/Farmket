import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  AppText, 
  AppInput, 
  AppEmptyState, 
  AppProductCard, 
  ProductCardSkeleton, 
  AppButton 
} from '../../components/ui';
import { TopBarActions } from '../../components/navigation/TopBarActions';
import { colors, spacing, radii, shadows } from '../../theme';
import { Search as SearchIcon, PackageOpen, SlidersHorizontal, X, Leaf } from 'lucide-react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, Product } from '../../api/products';
import { useDebounce } from '../../hooks/useDebounce';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { FilterModal } from '../../components/marketplace/FilterModal';
import { useRequireAuth } from '../../components/auth/AuthGateModal';

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Organic Tomatoes',
    slug: 'organic-tomatoes',
    farmer: 1,
    farmer_name: 'Ramesh Farm',
    category: 1,
    description: 'Fresh, juicy and organically grown tomatoes straight from our farm.',
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

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToCart } = useCart();
  const { requireAuth, AuthGateModalComponent } = useRequireAuth();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
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

  const rawData: Product[] = productsData?.pages.flatMap(page => page.results) || [];
  const data: Product[] = rawData.length > 0 || debouncedQuery || selectedCategory || organicOnly
    ? rawData
    : DEFAULT_PRODUCTS;

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

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
            size="xs" 
            shape="pill"
            style={styles.addButton}
            onPress={() => handleAddToCart(item.id)}
            loading={addingId === item.id}
          />
        }
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <AppText variant="h2" weight="bold" color={colors.text.primary}>
              Marketplace
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Direct harvest from verified farms
            </AppText>
          </View>

          <TopBarActions showCart={true} showNotifications={true} />
        </View>

        {/* Search input + Filter action button */}
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <AppInput
              placeholder="Search produce, crops, farmers..."
              value={query}
              onChangeText={setQuery}
              leftIcon={<SearchIcon size={18} color={colors.text.muted} />}
              clearable
              onClear={() => setQuery('')}
              returnKeyType="search"
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]} 
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.75}
          >
            <SlidersHorizontal size={18} color={activeFilterCount > 0 ? colors.brand.primary : colors.text.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <AppText variant="label" weight="bold" color="#FFFFFF" style={{ fontSize: 9 }}>
                  {activeFilterCount}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Horizontal Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryPillsScroll}
        >
          <TouchableOpacity
            style={[styles.pill, !selectedCategory && styles.pillActive]}
            onPress={() => setSelectedCategory('')}
            activeOpacity={0.75}
          >
            <AppText 
              variant="caption" 
              weight={!selectedCategory ? 'bold' : 'medium'}
              color={!selectedCategory ? colors.brand.primary : colors.text.secondary}
            >
              All Produce
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, organicOnly && styles.pillActive]}
            onPress={() => setOrganicOnly(!organicOnly)}
            activeOpacity={0.75}
          >
            <Leaf size={12} color={organicOnly ? colors.brand.primary : colors.status.success} style={{ marginRight: 4 }} />
            <AppText 
              variant="caption" 
              weight={organicOnly ? 'bold' : 'medium'}
              color={organicOnly ? colors.brand.primary : colors.text.secondary}
            >
              Organic Only
            </AppText>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                activeOpacity={0.75}
              >
                <AppText 
                  variant="caption" 
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? colors.brand.primary : colors.text.secondary}
                >
                  {cat.name}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Filter Chips */}
        {(organicOnly || selectedCategory) && (
          <View style={styles.activeFiltersRow}>
            {organicOnly && (
              <TouchableOpacity style={styles.activeTag} onPress={() => setOrganicOnly(false)}>
                <AppText variant="label" weight="medium" color={colors.brand.primary}>Organic Only</AppText>
                <X size={12} color={colors.brand.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            {selectedCategory && (
              <TouchableOpacity style={styles.activeTag} onPress={() => setSelectedCategory('')}>
                <AppText variant="label" weight="medium" color={colors.brand.primary}>
                  {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                </AppText>
                <X size={12} color={colors.brand.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Main Results / State */}
      {isLoading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <ProductCardSkeleton key={i} layout="horizontal" />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="Failed to Load" 
            description="We couldn't connect to the marketplace. Please check your connection."
            actionTitle="Retry"
            onAction={refetch}
          />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="No Produce Found" 
            description={
              query || activeFilterCount > 0
                ? "We couldn't find items matching your filters. Try clearing your search or filter tags."
                : "No marketplace products available right now."
            }
            icon={<PackageOpen size={48} color={colors.brand.muted} />}
            actionTitle={activeFilterCount > 0 || query ? "Clear Filters" : undefined}
            onAction={activeFilterCount > 0 || query ? clearAllFilters : undefined}
          />
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <AppText variant="bodySmall" weight="bold" color={colors.text.primary}>
              {query ? `Results for "${query}"` : 'Direct Farm Produce'}
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              {data.length} {data.length === 1 ? 'item' : 'items'}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.tint,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.brand.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillsScroll: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  pillActive: {
    backgroundColor: colors.brand.tint,
    borderColor: colors.brand.primary,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.brand.tint,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.brand.muted,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    flexGrow: 1,
  },
  addButton: {
    minWidth: 54,
  }
});
