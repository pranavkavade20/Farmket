import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppHeader, AppButton, AppCard, AppEmptyState } from '../components/ui';
import { colors, spacing, radii } from '../theme';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, loading, updateQuantity, removeItem, checkout } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // In a real app, you'd navigate to an address selection screen first.
      await checkout("Default Shipping Address");
      // Let it refresh and clear the cart, then we can go back
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setCheckoutLoading(false);
    }
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
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Cart" showBack />
      
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const primaryImage = item.product.images?.find((img: any) => img.is_primary)?.image || item.product.images?.[0]?.image;

          return (
            <AppCard elevated padding="md" style={styles.card}>
              {primaryImage ? (
                <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderImage}>
                  <AppText variant="small" color={colors.text.muted}>No image</AppText>
                </View>
              )}
              
              <View style={styles.info}>
                <View style={styles.headerRow}>
                  <AppText weight="bold" numberOfLines={1} style={{ flex: 1 }}>{item.product.name}</AppText>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                    <Trash2 size={18} color={colors.status.danger} />
                  </TouchableOpacity>
                </View>
                
                <AppText variant="small" color={colors.brand.primary} weight="bold">
                  ${item.product.price} <AppText variant="small" color={colors.text.muted}>/ {item.product.unit}</AppText>
                </AppText>

                <View style={styles.actionRow}>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity 
                      style={styles.qBtn} 
                      onPress={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={16} color={colors.text.primary} />
                    </TouchableOpacity>
                    <AppText weight="semibold" style={styles.qText}>{item.quantity}</AppText>
                    <TouchableOpacity 
                      style={styles.qBtn} 
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  <AppText weight="bold" color={colors.text.primary}>
                    ${item.total_price}
                  </AppText>
                </View>
              </View>
            </AppCard>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <AppText variant="heading" weight="semibold">Total</AppText>
              <AppText variant="headingLg" weight="bold" color={colors.brand.primary}>
                ${cart.total_price}
              </AppText>
            </View>
            <AppButton
              title="Checkout"
              onPress={handleCheckout}
              loading={checkoutLoading}
              fullWidth
            />
          </View>
        }
      />
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
    padding: spacing.md,
  },
  card: {
    flexDirection: 'row',
    marginBottom: spacing.md,
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  removeBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  qBtn: {
    padding: spacing.sm,
  },
  qText: {
    width: 24,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  }
});
