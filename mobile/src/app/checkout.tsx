import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader, AppText, AppInput, AppButton, AppCard } from '../components/ui';
import { colors, spacing, radii } from '../theme';
import { useCart } from '../context/CartContext';
import { MapPin, CreditCard, Banknote, ShieldCheck } from 'lucide-react-native';
import { formatCurrency } from '../utils/format';
import { normalizeApiError } from '../api/client';

type PaymentMethod = 'cod' | 'upi' | 'card';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, checkout } = useCart();
  
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Missing Info', 'Please provide a shipping address.');
      return;
    }

    setLoading(true);
    try {
      await checkout({
        delivery_address: address.trim(),
        payment_method: paymentMethod,
      });
      Alert.alert('Order Confirmed! 🎉', 'Your order has been placed directly with the farmers.', [
        { text: 'View Orders', onPress: () => router.push('/(tabs)/orders') },
        { text: 'Continue Shopping', onPress: () => router.push('/') }
      ]);
    } catch (error: unknown) {
      Alert.alert('Checkout Failed', normalizeApiError(error, 'Failed to place the order. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (!cart) {
    return null;
  }

  const subtotal = Number(cart.total_price || 0);
  const deliveryFee = subtotal > 500 ? 0 : 50; 
  const total = subtotal + deliveryFee;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Checkout" showBack />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Shipping Address */}
          <AppCard elevated padding="lg" style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={colors.brand.primary} />
              <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>
                Delivery Address
              </AppText>
            </View>
            <AppInput
              placeholder="e.g. Flat 401, Harmony Apartments, MG Road, Bengaluru"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              style={styles.addressInput}
            />
          </AppCard>

          {/* Payment Method */}
          <AppCard elevated padding="lg" style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={20} color={colors.brand.primary} />
              <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>
                Payment Method
              </AppText>
            </View>
            
            <View style={styles.paymentOptions}>
              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]} 
                onPress={() => setPaymentMethod('cod')}
                activeOpacity={0.7}
              >
                <Banknote size={24} color={paymentMethod === 'cod' ? colors.brand.primary : colors.text.muted} />
                <View style={styles.paymentOptionText}>
                  <AppText weight="semibold" color={paymentMethod === 'cod' ? colors.brand.primary : colors.text.primary}>
                    Cash on Delivery
                  </AppText>
                  <AppText variant="small" color={colors.text.muted}>Pay when you receive fresh produce</AppText>
                </View>
                <View style={[styles.radio, paymentMethod === 'cod' && styles.radioActive]}>
                  {paymentMethod === 'cod' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'upi' && styles.paymentOptionActive]} 
                onPress={() => setPaymentMethod('upi')}
                activeOpacity={0.7}
              >
                <ShieldCheck size={24} color={paymentMethod === 'upi' ? colors.brand.primary : colors.text.muted} />
                <View style={styles.paymentOptionText}>
                  <AppText weight="semibold" color={paymentMethod === 'upi' ? colors.brand.primary : colors.text.primary}>
                    UPI / Instant Pay
                  </AppText>
                  <AppText variant="small" color={colors.text.muted}>Google Pay, PhonePe, Paytm</AppText>
                </View>
                <View style={[styles.radio, paymentMethod === 'upi' && styles.radioActive]}>
                  {paymentMethod === 'upi' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]} 
                onPress={() => setPaymentMethod('card')}
                activeOpacity={0.7}
              >
                <CreditCard size={24} color={paymentMethod === 'card' ? colors.brand.primary : colors.text.muted} />
                <View style={styles.paymentOptionText}>
                  <AppText weight="semibold" color={paymentMethod === 'card' ? colors.brand.primary : colors.text.primary}>
                    Credit / Debit Card
                  </AppText>
                  <AppText variant="small" color={colors.text.muted}>Visa, Mastercard, RuPay</AppText>
                </View>
                <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]}>
                  {paymentMethod === 'card' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            </View>
          </AppCard>

          {/* Order Summary */}
          <AppCard elevated padding="lg" style={styles.section}>
            <AppText variant="heading" weight="semibold" style={{ marginBottom: spacing.md }}>
              Order Summary
            </AppText>
            <View style={styles.summaryRow}>
              <AppText color={colors.text.secondary}>Subtotal ({cart.items.length} items)</AppText>
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
            <View style={[styles.summaryRow, styles.totalRow]}>
              <AppText variant="heading" weight="bold">Total to Pay</AppText>
              <AppText variant="headingLg" weight="bold" color={colors.brand.primary}>
                {formatCurrency(total)}
              </AppText>
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton 
          title={`Place Order • ${formatCurrency(total)}`} 
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
    padding: spacing.xl,
    paddingBottom: 100,
    gap: spacing.lg,
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
  paymentOptions: {
    gap: spacing.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    backgroundColor: colors.background.surface,
  },
  paymentOptionActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.muted + '20',
  },
  paymentOptionText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.brand.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand.primary,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
});
