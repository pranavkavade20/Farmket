import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader, AppText, AppInput, AppButton, AppCard } from '../components/ui';
import { colors, spacing, radii, shadows } from '../theme';
import { useCart } from '../context/CartContext';
import { MapPin, CreditCard, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
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
      Alert.alert('Address Required', 'Please enter your delivery address to proceed.');
      return;
    }

    setLoading(true);
    try {
      await checkout({
        delivery_address: address.trim(),
        payment_method: paymentMethod,
      });
      Alert.alert('Order Confirmed! 🎉', 'Your direct farm order has been placed. You will receive dispatch updates shortly.', [
        { text: 'View My Orders', onPress: () => router.push('/(tabs)/orders') },
        { text: 'Back to Home', onPress: () => router.push('/(tabs)') }
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
  const deliveryFee = subtotal >= 500 ? 0 : 50; 
  const total = subtotal + deliveryFee;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Secure Checkout" showBack />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Shipping Address */}
          <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MapPin size={18} color={colors.brand.primary} />
              </View>
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <AppText variant="bodySmall" weight="bold">Delivery Destination</AppText>
                <AppText variant="label" color={colors.text.muted}>Direct doorstep delivery</AppText>
              </View>
            </View>
            <AppInput
              placeholder="Flat / House No., Apartment Name, Street, Landmark, City & PIN Code"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              style={styles.addressInput}
              containerStyle={{ marginBottom: 0 }}
            />
          </AppCard>

          {/* Payment Method */}
          <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <CreditCard size={18} color={colors.brand.primary} />
              </View>
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <AppText variant="bodySmall" weight="bold">Payment Method</AppText>
                <AppText variant="label" color={colors.text.muted}>Encrypted & secure settlement</AppText>
              </View>
            </View>
            
            <View style={styles.paymentOptions}>
              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]} 
                onPress={() => setPaymentMethod('cod')}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIcon, paymentMethod === 'cod' && styles.optionIconActive]}>
                  <Banknote size={20} color={paymentMethod === 'cod' ? colors.brand.primary : colors.text.muted} />
                </View>
                <View style={styles.paymentOptionText}>
                  <AppText variant="bodySmall" weight="bold" color={colors.text.primary}>
                    Cash on Delivery
                  </AppText>
                  <AppText variant="label" color={colors.text.muted}>Pay upon receiving fresh harvest</AppText>
                </View>
                <View style={[styles.radio, paymentMethod === 'cod' && styles.radioActive]}>
                  {paymentMethod === 'cod' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'upi' && styles.paymentOptionActive]} 
                onPress={() => setPaymentMethod('upi')}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIcon, paymentMethod === 'upi' && styles.optionIconActive]}>
                  <ShieldCheck size={20} color={paymentMethod === 'upi' ? colors.brand.primary : colors.text.muted} />
                </View>
                <View style={styles.paymentOptionText}>
                  <AppText variant="bodySmall" weight="bold" color={colors.text.primary}>
                    Instant UPI
                  </AppText>
                  <AppText variant="label" color={colors.text.muted}>GPay, PhonePe, Paytm, BHIM</AppText>
                </View>
                <View style={[styles.radio, paymentMethod === 'upi' && styles.radioActive]}>
                  {paymentMethod === 'upi' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]} 
                onPress={() => setPaymentMethod('card')}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIcon, paymentMethod === 'card' && styles.optionIconActive]}>
                  <CreditCard size={20} color={paymentMethod === 'card' ? colors.brand.primary : colors.text.muted} />
                </View>
                <View style={styles.paymentOptionText}>
                  <AppText variant="bodySmall" weight="bold" color={colors.text.primary}>
                    Credit / Debit Card
                  </AppText>
                  <AppText variant="label" color={colors.text.muted}>Visa, Mastercard, RuPay</AppText>
                </View>
                <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]}>
                  {paymentMethod === 'card' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            </View>
          </AppCard>

          {/* Order Summary */}
          <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.section}>
            <AppText variant="bodySmall" weight="bold" style={{ marginBottom: spacing.md }}>
              Payment Summary
            </AppText>
            <View style={styles.summaryRow}>
              <AppText variant="bodySmall" color={colors.text.secondary}>Items ({cart.items.length})</AppText>
              <AppText variant="bodySmall" weight="semibold">{formatCurrency(subtotal)}</AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="bodySmall" color={colors.text.secondary}>Direct Delivery</AppText>
              {deliveryFee === 0 ? (
                <AppText variant="bodySmall" weight="bold" color={colors.status.success}>FREE</AppText>
              ) : (
                <AppText variant="bodySmall" weight="semibold">{formatCurrency(deliveryFee)}</AppText>
              )}
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <AppText variant="h3" weight="bold">Total to Pay</AppText>
              <AppText variant="display" weight="bold" color={colors.brand.primary} style={{ fontSize: 22 }}>
                {formatCurrency(total)}
              </AppText>
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton 
          title={`Confirm Order • ${formatCurrency(total)}`} 
          onPress={handlePlaceOrder}
          loading={loading}
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
  content: {
    padding: spacing.lg,
    paddingBottom: 110,
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.background.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentOptions: {
    gap: spacing.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    backgroundColor: colors.background.surface,
  },
  paymentOptionActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.tint,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconActive: {
    backgroundColor: '#FFFFFF',
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
    marginBottom: spacing.xs,
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
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    ...shadows.card,
  },
});
