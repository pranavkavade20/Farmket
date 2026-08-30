import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppHeader, AppButton, AppCard, AppEmptyState } from '../components/ui';
import { colors, spacing, radii } from '../theme';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, Tag, ArrowLeft, ShieldCheck, Truck, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { formatCurrency } from '../utils/format';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const handleUpdateQuantity = async (itemId: number, currentQty: number, change: number, itemName?: string) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      Alert.alert(
        'Remove Item',
        `Remove "${itemName || 'this item'}" from your cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => handleDeleteItem(itemId) }
        ]
      );
      return;
    }

    setUpdatingId(itemId);
    try {
      await updateQuantity(itemId, newQty);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !cart) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <AppHeader title="Your Cart" showBack />
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Your Cart" showBack />
        <AppEmptyState
          title="Your Cart is Empty"
          description="Explore the marketplace and add fresh produce directly from local farms."
          icon={<ShoppingCart size={48} color={colors.brand.muted} strokeWidth={1.5} />}
          actionTitle="Browse Marketplace"
          onAction={() => router.push('/(tabs)/search')}
        />
      </View>
    );
  }

  const subtotal = Number(cart.total_price || 0);
  const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above 500
  const total = subtotal + deliveryFee;
  const itemCount = cart.items.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title={`Cart (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`} showBack />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={cart.items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const prod = item.product_details || (item as any).product;
            const primaryImage = prod?.images?.find((img: any) => img.is_primary)?.image || prod?.images?.[0]?.image;
            const itemPrice = prod?.price || 0;
            const itemSubtotal = item.subtotal || (Number(itemPrice) * item.quantity);
            const isItemRemoving = removingId === item.id;
            const isItemUpdating = updatingId === item.id;

            const renderRightActions = () => (
              <TouchableOpacity 
                style={styles.deleteAction} 
                onPress={() => handleDeleteItem(item.id, prod?.name)}
                disabled={isItemRemoving}
              >
                {isItemRemoving ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Trash2 size={22} color={colors.text.inverse} />
                )}
              </TouchableOpacity>
            );

            return (
              <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
                <AppCard elevated padding="md" style={styles.card}>
                  {primaryImage ? (
                    <Image source={{ uri: primaryImage }} style={styles.image} contentFit="cover" />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <AppText variant="small" color={colors.text.muted}>No image</AppText>
                    </View>
                  )}
                  
                  <View style={styles.info}>
                    {/* Header Row with Product Name, Farmer & Delete Button */}
                    <View style={styles.headerRow}>
                      <View style={{ flex: 1, paddingRight: spacing.xs }}>
                        <AppText weight="bold" numberOfLines={1} style={styles.productName}>
                          {prod?.name || 'Produce Item'}
                        </AppText>
                        {prod?.farmer_name ? (
                          <AppText variant="small" color={colors.text.secondary} numberOfLines={1}>
                            by {prod.farmer_name}
                          </AppText>
                        ) : null}
                      </View>

                      {/* Explicit Web-styled Delete/Trash Button */}
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteItem(item.id, prod?.name)}
                        disabled={isItemRemoving}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel="Remove item"
                      >
                        {isItemRemoving ? (
                          <ActivityIndicator size="small" color={colors.status.danger} />
                        ) : (
                          <Trash2 size={18} color={colors.status.danger} />
                        )}
                      </TouchableOpacity>
                    </View>
                    
                    <AppText variant="small" color={colors.text.muted} style={{ marginTop: 2 }}>
                      {formatCurrency(itemPrice)} / {prod?.unit || 'kg'}
                    </AppText>

                    {/* Action Row: Price & Quantity Controls */}
                    <View style={styles.actionRow}>
                      <AppText weight="bold" color={colors.brand.primary} style={styles.subtotalText}>
                        {formatCurrency(itemSubtotal)}
                      </AppText>
                      
                      <View style={styles.quantityControl}>
                        <TouchableOpacity 
                          style={styles.qBtn} 
                          onPress={() => handleUpdateQuantity(item.id, item.quantity, -1, prod?.name)}
                          disabled={isItemUpdating || isItemRemoving}
                        >
                          <Minus size={14} color={colors.text.primary} />
                        </TouchableOpacity>
                        
                        <View style={styles.qTextWrapper}>
                          {isItemUpdating ? (
                            <ActivityIndicator size="small" color={colors.brand.primary} />
                          ) : (
                            <AppText weight="bold" style={styles.qText}>{item.quantity}</AppText>
                          )}
                        </View>

                        <TouchableOpacity 
                          style={styles.qBtn} 
                          onPress={() => handleUpdateQuantity(item.id, item.quantity, 1, prod?.name)}
                          disabled={isItemUpdating || isItemRemoving}
                        >
                          <Plus size={14} color={colors.text.primary} />
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
                  <Tag size={18} color={colors.text.muted} style={{ marginLeft: spacing.md }} />
                  <TextInput 
                    placeholder="Enter Coupon Code"
                    style={styles.couponInput}
                    placeholderTextColor={colors.text.muted}
                  />
                  <TouchableOpacity style={styles.applyBtn}>
                    <AppText weight="bold" color={colors.brand.primary}>Apply</AppText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bill Details */}
              <AppCard elevated padding="lg" style={styles.billCard}>
                <AppText variant="subheading" weight="bold" style={{ marginBottom: spacing.md }}>
                  Bill Details
                </AppText>
                
                <View style={styles.summaryRow}>
                  <AppText color={colors.text.secondary}>Subtotal</AppText>
                  <AppText weight="semibold">{formatCurrency(subtotal)}</AppText>
                </View>
                
                <View style={styles.summaryRow}>
                  <AppText color={colors.text.secondary}>Delivery Fee</AppText>
                  {deliveryFee === 0 ? (
                    <AppText weight="bold" color={colors.brand.primary}>Free</AppText>
                  ) : (
                    <AppText weight="semibold">{formatCurrency(deliveryFee)}</AppText>
                  )}
                </View>
                
                {deliveryFee > 0 && (
                  <View style={styles.deliveryNotice}>
                    <Truck size={14} color={colors.status.info} style={{ marginRight: 6 }} />
                    <AppText variant="small" color={colors.status.info}>
                      Add {formatCurrency(500 - subtotal)} more for free delivery
                    </AppText>
                  </View>
                )}

                <View style={styles.divider} />
                
                <View style={styles.totalRow}>
                  <AppText variant="subheading" weight="bold">Total to Pay</AppText>
                  <AppText variant="heading" weight="bold" color={colors.brand.primary}>
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
                  <AppText variant="small" weight="semibold" style={styles.badgeText}>100% Direct</AppText>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconWrapper}>
                    <Truck size={18} color={colors.status.info} />
                  </View>
                  <AppText variant="small" weight="semibold" style={styles.badgeText}>Fast Delivery</AppText>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconWrapper}>
                    <Award size={18} color={colors.accent.orange} />
                  </View>
                  <AppText variant="small" weight="semibold" style={styles.badgeText}>Quality Checked</AppText>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 110,
  },
  card: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
  },
  placeholderImage: {
    width: 88,
    height: 88,
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
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
  productName: {
    fontSize: 16,
    color: colors.text.primary,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.status.dangerMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  subtotalText: {
    fontSize: 16,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.full,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  qBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  qTextWrapper: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.text.primary,
  },
  deleteAction: {
    backgroundColor: colors.status.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    marginLeft: spacing.sm,
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
    height: 48,
    overflow: 'hidden',
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
  },
  applyBtn: {
    paddingHorizontal: spacing.lg,
    height: '100%',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border.subtle,
  },
  billCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deliveryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.md,
    borderStyle: 'dashed',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
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
  },
  badgeText: {
    fontSize: 11,
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
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  }
});
