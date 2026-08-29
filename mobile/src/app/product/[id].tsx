import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, AppButton, AppEmptyState } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import { fetchProductDetail } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { ChevronLeft, Star, Heart, CheckCircle2, ShieldCheck, Info } from 'lucide-react-native';
import { Image } from 'expo-image';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductDetail(Number(id)),
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      router.push('/cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppEmptyState 
          title="Product Not Found"
          description="We couldn't load this product's details."
          actionTitle="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const primaryImage = product.images?.find((img) => img.is_primary)?.image || product.images?.[0]?.image;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {primaryImage ? (
            <Image 
              source={{ uri: primaryImage }} 
              style={styles.image} 
              contentFit="cover" 
            />
          ) : (
            <View style={[styles.image, { backgroundColor: colors.border.subtle, alignItems: 'center', justifyContent: 'center' }]}>
              <AppText color={colors.text.muted}>No Image Available</AppText>
            </View>
          )}
          
          <TouchableOpacity style={[styles.backButton, { top: insets.top + spacing.sm }]} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wishlistButton, { top: insets.top + spacing.sm }]}>
            <Heart size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: colors.brand.muted }]}>
              <AppText variant="small" weight="semibold" color={colors.brand.primary}>100% Organic</AppText>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.status.infoMuted }]}>
              <AppText variant="small" weight="semibold" color={colors.status.info}>Pesticide Free</AppText>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.accent.yellow + '33' }]}>
              <AppText variant="small" weight="semibold" color={colors.accent.yellow}>Farm Fresh</AppText>
            </View>
          </View>

          <AppText variant="heading" weight="bold" style={styles.title}>{product.name}</AppText>
          
          <View style={styles.ratingRow}>
            <Star size={16} color={colors.accent.yellow} fill={colors.accent.yellow} />
            <AppText weight="bold" style={{ marginLeft: 4 }}>
              {product.average_rating ? Number(product.average_rating).toFixed(1) : 'New'}
            </AppText>
            <AppText color={colors.text.muted} style={{ marginLeft: 4 }}>
              ({product.reviews_count} reviews)
            </AppText>
          </View>

          <View style={styles.priceRow}>
            <AppText variant="headingLg" weight="bold" color={colors.text.primary}>
              ₹{product.price}
            </AppText>
            <AppText color={colors.text.muted} style={{ marginLeft: 4, marginTop: 8 }}>
              / {product.unit}
            </AppText>
          </View>

          <AppText color={colors.text.secondary} style={styles.description}>
            {product.description || 'Fresh, juicy organic produce grown without pesticides.'}
          </AppText>

          {/* Farmer Card */}
          <AppText variant="subheading" weight="bold" style={styles.sectionTitle}>Farmer</AppText>
          <View style={styles.farmerCard}>
            <View style={styles.farmerAvatar}>
              <AppText weight="bold" color={colors.brand.primary}>
                {product.farmer.first_name[0]}{product.farmer.last_name[0]}
              </AppText>
            </View>
            <View style={styles.farmerInfo}>
              <AppText weight="semibold">{product.farmer.first_name} {product.farmer.last_name}</AppText>
              <AppText variant="small" color={colors.text.muted}>{product.farmer.farm_name || 'Independent Farmer'}</AppText>
            </View>
            <AppButton title="View Farm" variant="outline" size="sm" />
          </View>

          <AppText variant="subheading" weight="bold" style={styles.sectionTitle}>Product Information</AppText>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <CheckCircle2 size={16} color={colors.brand.primary} />
              <AppText style={styles.infoText}>Available Stock: {product.stock_quantity} {product.unit}</AppText>
            </View>
            <View style={styles.infoRow}>
              <ShieldCheck size={16} color={colors.brand.primary} />
              <AppText style={styles.infoText}>Quality Assured by Farmket</AppText>
            </View>
            <View style={styles.infoRow}>
              <Info size={16} color={colors.brand.primary} />
              <AppText style={styles.infoText}>Directly from source</AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.md }]}>
        <View style={styles.quantityContainer}>
          <AppText color={colors.text.muted} style={{ marginRight: spacing.sm }}>Quantity</AppText>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <AppText weight="bold">-</AppText>
            </TouchableOpacity>
            <AppText weight="bold" style={{ marginHorizontal: spacing.sm }}>{quantity}</AppText>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
            >
              <AppText weight="bold">+</AppText>
            </TouchableOpacity>
          </View>
          <AppText style={{ marginLeft: spacing.sm }}>{product.unit}</AppText>
        </View>
        
        <AppButton 
          title="Add to Cart" 
          fullWidth 
          size="lg"
          onPress={handleAddToCart}
          loading={addingToCart}
          disabled={!product.is_available || product.stock_quantity === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
    backgroundColor: colors.background.surface,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishlistButton: {
    position: 'absolute',
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: spacing.xl,
    backgroundColor: colors.background.main,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    marginTop: -radii.xl,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  description: {
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.xl,
  },
  farmerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  farmerInfo: {
    flex: 1,
  },
  infoList: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.surface,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.main,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
