import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppHeader, AppButton, AppCard, AppEmptyState } from '../components/ui';
import { colors, spacing, radii, shadows } from '../theme';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Plus, Minus, Trash2, Tag, ShieldCheck, Truck, Award, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { formatCurrency } from '../utils/format';
import { normalizeApiError } from '../api/client';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleDeleteItem = async (itemId: number, itemName?: string) => {
    setRemovingId(itemId);
    try {
      await removeItem(itemId);
    } catch (error) {
      Alert.alert('Error', 'Could not remove item from cart. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpdateQuantity = async (
    itemId: number,
    currentQty: number,
    change: number,
    itemName?: string,
    maxStock?: number
  ) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      Alert.alert(
        'Remove Item',
        `Remove "${itemName || 'this produce'}" from your cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => handleDeleteItem(itemId) },
        ]
      );
      return;
    }

    if (change > 0 && maxStock !== undefined && newQty > maxStock) {
      Alert.alert(
        'Stock Limit Reached',
        `Only ${maxStock} units of "${itemName || 'this produce'}" are available in farm inventory.`
      );
      return;
    }

    setUpdatingId(itemId);
    try {
      await updateQuantity(itemId, newQty);
    } catch (error) {
      const errorMsg = normalizeApiError(error, 'Could not update item quantity.');
      Alert.alert('Stock Notice', errorMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !cart) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <AppHeader title="Shopping Cart" showBack />
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Shopping Cart" showBack />
        <AppEmptyState
          title="Your Cart is Empty"
          description="Explore fresh harvests and add direct produce to your basket."
          icon={<ShoppingBag size={44} color={colors.brand.primary} strokeWidth={1.8} />}
          actionTitle="Explore Marketplace"
          onAction={() => router.push('/(tabs)/search')}
        />
      </View>
    );
  }

  const subtotal = Number(cart.total_price || 0);
  const freeDeliveryThreshold = 500;
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 50;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const itemCount = cart.items.length;
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title={`Shopping Cart (${itemCount})`} showBack />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={cart.items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            /* Free Delivery Progress Strip */
            <View style={styles.deliveryProgressCard}>
              <View style={styles.deliveryProgressHeader}>
                <Truck size={16} color={colors.brand.primary} />
                <AppText variant="caption" weight="medium" color={colors.text.primary} style={{ flex: 1, marginLeft: 6 }}>
                  {deliveryFee === 0 ? (
                    'Unlocked FREE Direct Farm Delivery! 🎉'
                  ) : (
                    `Add ${formatCurrency(freeDeliveryThreshold - subtotal)} more for FREE delivery`
                  )}
                </AppText>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${freeDeliveryProgress}%` }]} />
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const prod = item.product_details || (item as any).product;
            const primaryImage = prod?.images?.find((img: any) => img.is_primary)?.image || prod?.images?.[0]?.image;
            const itemPrice = prod?.price || 0;
            const itemSubtotal = item.subtotal || (Number(itemPrice) * item.quantity);
            const isItemRemoving = removingId === item.id;
            const isItemUpdating = updatingId === item.id;

            const maxStock = item.is_prebooking && prod?.available_quantity
              ? Number(prod.available_quantity)
              : Number(prod?.stock_quantity ?? 99);
            const isAtMaxStock = item.quantity >= maxStock;

            const renderRightActions = () => (
              <TouchableOpacity 
                style={styles.deleteAction} 
                onPress={() => handleDeleteItem(item.id, prod?.name)}
                disabled={isItemRemoving}
              >
                {isItemRemoving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Trash2 size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            );

            return (
              <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
                <AppCard variant="elevated" padding="md" borderRadius={radii.xl} style={styles.card}>
                  {primaryImage ? (
                    <Image source={{ uri: primaryImage }} style={styles.image} contentFit="cover" transition={200} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <ShoppingBag size={24} color={colors.brand.primary} />
                    </View>
                  )}
                  
                  <View style={styles.info}>
                    <View style={styles.headerRow}>
                      <View style={{ flex: 1, paddingRight: spacing.xs }}>
                        <AppText variant="bodySmall" weight="bold" numberOfLines={1} color={colors.text.primary}>
                          {prod?.name || 'Farm Produce'}
                        </AppText>
                        {prod?.farmer_name ? (
                          <AppText variant="label" color={colors.text.muted} numberOfLines={1}>
                            by {prod.farmer_name}
                          </AppText>
                        ) : null}
                      </View>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteItem(item.id, prod?.name)}
                        disabled={isItemRemoving}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {isItemRemoving ? (
                          <ActivityIndicator size="small" color={colors.status.danger} />
                        ) : (
                          <Trash2 size={16} color={colors.text.muted} />
                        )}
                      </TouchableOpacity>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                      <AppText variant="caption" color={colors.text.muted}>
                        {formatCurrency(itemPrice)} / {prod?.unit || 'kg'}
                      </AppText>
                      {maxStock <= 5 && (
                        <AppText variant="label" color={colors.status.warning} weight="bold">
                          Only {maxStock} in stock
                        </AppText>
                      )}
                    </View>

                    {/* Price & Stepper Row */}
                    <View style={styles.actionRow}>
                      <AppText variant="h3" weight="bold" color={colors.brand.primary}>
                        {formatCurrency(itemSubtotal)}
                      </AppText>
                      
                      <View style={styles.quantityControl}>
                        <TouchableOpacity 
                          style={styles.qBtn} 
                          onPress={() => handleUpdateQuantity(item.id, item.quantity, -1, prod?.name, maxStock)}
                          disabled={isItemUpdating || isItemRemoving}
                          activeOpacity={0.7}
                        >
                          <Minus size={13} color={colors.text.primary} strokeWidth={2.4} />
                        </TouchableOpacity>
                        
                        <View style={styles.qTextWrapper}>
                          {isItemUpdating ? (
                            <ActivityIndicator size="small" color={colors.brand.primary} />
                          ) : (
                            <AppText variant="caption" weight="bold" style={styles.qText}>{item.quantity}</AppText>
                          )}
                        </View>

                        <TouchableOpacity 
                          style={[styles.qBtn, isAtMaxStock && styles.qBtnDisabled]} 
                          onPress={() => handleUpdateQuantity(item.id, item.quantity, 1, prod?.name, maxStock)}
                          disabled={isItemUpdating || isItemRemoving || isAtMaxStock}
                          activeOpacity={0.7}
                        >
                          <Plus
                            size={13}
                            color={isAtMaxStock ? colors.text.muted : colors.text.primary}
                            strokeWidth={2.4}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </AppCard>
              </Swipeable>
            );
          }}
          ListFooterComponent={
            <View style={styles.footer}>
              {/* Coupon Section */}
              <View style={styles.couponContainer}>
                <View style={styles.couponInputWrapper}>
                  <Tag size={18} color={colors.brand.primary} style={{ marginLeft: spacing.md }} />
                  <TextInput 
                    placeholder="Enter Coupon Code (e.g. ORGANIC10)"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    style={styles.couponInput}
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="characters"
                    editable={!couponApplied}
                  />
                  <TouchableOpacity 
                    style={[styles.applyBtn, couponApplied && styles.appliedBtn]}
                    onPress={() => {
                      if (couponApplied) {
                        setCouponApplied(false);
                        setCouponCode('');
                      } else if (couponCode.trim()) {
                        setCouponApplied(true);
                      }
                    }}
                  >
                    <AppText variant="caption" weight="bold" color={couponApplied ? colors.status.success : colors.brand.primary}>
                      {couponApplied ? 'Applied ✓' : 'Apply'}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bill Details */}
              <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.billCard}>
                <AppText variant="h3" weight="bold" style={{ marginBottom: spacing.md }}>
                  Order Breakdown
                </AppText>
                
                <View style={styles.summaryRow}>
                  <AppText variant="bodySmall" color={colors.text.secondary}>Produce Subtotal</AppText>
                  <AppText variant="bodySmall" weight="semibold">{formatCurrency(subtotal)}</AppText>
                </View>
                
                <View style={styles.summaryRow}>
                  <AppText variant="bodySmall" color={colors.text.secondary}>Direct Farm Delivery</AppText>
                  {deliveryFee === 0 ? (
                    <AppText variant="bodySmall" weight="bold" color={colors.status.success}>FREE</AppText>
                  ) : (
                    <AppText variant="bodySmall" weight="semibold">{formatCurrency(deliveryFee)}</AppText>
                  )}
                </View>

                {couponApplied && (
                  <View style={styles.summaryRow}>
                    <AppText variant="bodySmall" color={colors.status.success}>Special Discount (10%)</AppText>
                    <AppText variant="bodySmall" weight="bold" color={colors.status.success}>-{formatCurrency(discount)}</AppText>
                  </View>
                )}

                <View style={styles.divider} />
                
                <View style={styles.totalRow}>
                  <AppText variant="h3" weight="bold">Total Amount</AppText>
                  <AppText variant="display" weight="bold" color={colors.brand.primary} style={{ fontSize: 24 }}>
                    {formatCurrency(total)}
                  </AppText>
                </View>
              </AppCard>

              {/* Trust Badges */}
              <View style={styles.trustBadges}>
                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconWrapper}>
                    <ShieldCheck size={18} color={colors.brand.primary} />
                  </View>
                  <AppText variant="label" weight="semibold" style={styles.badgeText}>Direct From Farm</AppText>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconWrapper}>
                    <Truck size={18} color={colors.status.info} />
                  </View>
                  <AppText variant="label" weight="semibold" style={styles.badgeText}>Carefully Dispatched</AppText>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconWrapper}>
                    <Award size={18} color={colors.accent.amber} />
                  </View>
                  <AppText variant="label" weight="semibold" style={styles.badgeText}>100% Guaranteed</AppText>
                </View>
              </View>
            </View>
          }
        />
      </KeyboardAvoidingView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton
          title={`Proceed to Checkout • ${formatCurrency(total)}`}
          onPress={handleCheckout}
          fullWidth
          size="lg"
          shape="pill"
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 120,
  },
  deliveryProgressCard: {
    backgroundColor: colors.brand.tint,
    borderWidth: 1,
    borderColor: colors.brand.muted,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  deliveryProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.brand.muted,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 2.5,
  },
  card: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.surface,
  },
  image: {
    width: 82,
    height: 82,
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
  },
  placeholderImage: {
    width: 82,
    height: 82,
    borderRadius: radii.lg,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.pill,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  qBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  qBtnDisabled: {
    opacity: 0.35,
    backgroundColor: '#F3F4F6',
  },
  qTextWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qText: {
    fontSize: 13,
  },
  deleteAction: {
    backgroundColor: colors.status.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    marginBottom: spacing.sm,
    borderRadius: radii.xl,
    marginLeft: spacing.xs,
  },
  footer: {
    marginTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  couponContainer: {
    marginBottom: spacing.md,
  },
  couponInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
    height: 46,
    overflow: 'hidden',
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
    color: colors.text.primary,
  },
  applyBtn: {
    paddingHorizontal: spacing.md,
    height: '100%',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border.subtle,
  },
  appliedBtn: {
    backgroundColor: colors.status.successMuted,
  },
  billCard: {
    backgroundColor: colors.background.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  badgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  badgeIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadows.xs,
  },
  badgeText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.surface,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    ...shadows.card,
  }
});
