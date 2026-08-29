import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppHeader, AppButton, AppCard, AppEmptyState } from '../components/ui';
import { colors, spacing, radii } from '../theme';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, Tag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading && !cart) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <AppHeader title="Cart" showBack />
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Cart" showBack />
        <AppEmptyState
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet."
          icon={<ShoppingCart size={48} color={colors.brand.muted} strokeWidth={1.5} />}
          actionTitle="Continue Shopping"
          onAction={() => router.push('/(tabs)/')}
        />
      </View>
    );
  }

  const subtotal = Number(cart.total_price || 0);
  const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above 500
  const total = subtotal + deliveryFee;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Cart" showBack />
      
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
            const primaryImage = item.product.images?.find((img: any) => img.is_primary)?.image || item.product.images?.[0]?.image;

            const renderRightActions = () => (
              <TouchableOpacity style={styles.deleteAction} onPress={() => removeItem(item.id)}>
                <Trash2 size={24} color={colors.text.inverse} />
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
                    <View style={styles.headerRow}>
                      <AppText weight="bold" numberOfLines={1} style={{ flex: 1 }}>{item.product.name}</AppText>
                    </View>
                    
                    <AppText variant="small" color={colors.text.secondary}>
                      ₹{item.product.price} / {item.product.unit}
                    </AppText>

                    <View style={styles.actionRow}>
                      <AppText weight="bold" color={colors.brand.primary} style={{ fontSize: 16 }}>
                        ₹{item.total_price}
                      </AppText>
                      
                      <View style={styles.quantityControl}>
                        <TouchableOpacity 
                          style={styles.qBtn} 
                          onPress={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={14} color={colors.text.primary} />
                        </TouchableOpacity>
                        <AppText weight="bold" style={styles.qText}>{item.quantity}</AppText>
                        <TouchableOpacity 
                          style={styles.qBtn} 
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
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
                  <Tag size={20} color={colors.text.muted} style={{ marginLeft: spacing.md }} />
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
              <AppText variant="subheading" weight="bold" style={{ marginBottom: spacing.md }}>Bill Details</AppText>
              
              <View style={styles.summaryRow}>
                <AppText color={colors.text.secondary}>Subtotal</AppText>
                <AppText weight="medium">₹{subtotal.toFixed(2)}</AppText>
              </View>
              
              <View style={styles.summaryRow}>
                <AppText color={colors.text.secondary}>Delivery Fee</AppText>
                {deliveryFee === 0 ? (
                  <AppText weight="bold" color={colors.brand.primary}>Free</AppText>
                ) : (
                  <AppText weight="medium">₹{deliveryFee.toFixed(2)}</AppText>
                )}
              </View>
              
              {deliveryFee > 0 && (
                <AppText variant="small" color={colors.status.info} style={{ marginBottom: spacing.md }}>
                  Add ₹{(500 - subtotal).toFixed(2)} more for free delivery
                </AppText>
              )}

              <View style={styles.divider} />
              
              <View style={styles.totalRow}>
                <AppText variant="heading" weight="bold">Total to Pay</AppText>
                <AppText variant="heading" weight="bold" color={colors.text.primary}>
                  ₹{total.toFixed(2)}
                </AppText>
              </View>
            </View>
          }
        />
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.md }]}>
        <AppButton
          title={`Proceed to Checkout • ₹${total.toFixed(2)}`}
          onPress={handleCheckout}
          loading={checkoutLoading}
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 120, // space for bottom bar
  },
  card: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background.surface,
  },
  image: {
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
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.muted + '40',
    borderRadius: radii.full,
    paddingHorizontal: 4,
    paddingVertical: 4,
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
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qText: {
    width: 32,
    textAlign: 'center',
  },
  deleteAction: {
    backgroundColor: colors.status.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    marginLeft: spacing.md,
  },
  footer: {
    marginTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  couponContainer: {
    marginBottom: spacing.xl,
  },
  couponInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    height: 48,
    overflow: 'hidden',
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontFamily: 'Inter-Regular', // matches body font if loaded
    color: colors.text.primary,
  },
  applyBtn: {
    paddingHorizontal: spacing.lg,
    height: '100%',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border.subtle,
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
    borderStyle: 'dashed',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  }
});
