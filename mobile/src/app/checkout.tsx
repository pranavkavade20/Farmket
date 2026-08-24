import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader, AppText, AppInput, AppButton, AppCard } from '../components/ui';
import { colors, spacing, radii } from '../theme';
import { useCart } from '../context/CartContext';
import { CreditCard, MapPin } from 'lucide-react-native';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, checkout } = useCart();
  
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Missing Info', 'Please provide a shipping address.');
      return;
    }

    setLoading(true);
    try {
      await checkout(address);
      Alert.alert('Success', 'Your order has been placed successfully!', [
        { text: 'OK', onPress: () => router.push('/') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to place the order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Checkout" showBack />
      
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppCard elevated padding="lg" style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.brand.primary} />
            <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>
              Shipping Details
            </AppText>
          </View>
          <AppInput
            placeholder="123 Farm Road, City, Country"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            style={styles.addressInput}
          />
        </AppCard>

        <AppCard elevated padding="lg" style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={colors.brand.primary} />
            <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>
              Payment Method
            </AppText>
          </View>
          <AppText color={colors.text.secondary}>
            Payment integration (e.g. Stripe) will be enabled once backend payment intents are configured.
          </AppText>
          <View style={styles.mockPayment}>
            <AppText weight="bold" color={colors.status.info}>Pay on Delivery (Mock)</AppText>
          </View>
        </AppCard>

        <AppCard elevated padding="lg" style={styles.section}>
          <AppText variant="heading" weight="semibold" style={{ marginBottom: spacing.md }}>
            Order Summary
          </AppText>
          <View style={styles.summaryRow}>
            <AppText color={colors.text.secondary}>Subtotal</AppText>
            <AppText weight="semibold">${cart.total_price}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText color={colors.text.secondary}>Shipping</AppText>
            <AppText weight="semibold">Free</AppText>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <AppText variant="heading" weight="bold">Total</AppText>
            <AppText variant="headingLg" weight="bold" color={colors.brand.primary}>
              ${cart.total_price}
            </AppText>
          </View>
        </AppCard>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton 
          title="Place Order" 
          onPress={handlePlaceOrder}
          loading={loading}
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
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginLeft: spacing.sm,
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mockPayment: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.status.info,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    alignItems: 'center',
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});
