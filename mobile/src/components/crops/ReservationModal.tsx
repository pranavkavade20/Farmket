import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { AppText, AppButton, AppCard, AppBadge } from '../ui';
import { colors, spacing, radii } from '../../theme';
import { formatCurrency, formatDate } from '../../utils/format';
import { reserveCrop } from '../../api/crops';
import type { Product } from '../../api/products';
import { X, Sprout, Calendar, Package, AlertCircle } from 'lucide-react-native';

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  onSuccess?: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  visible,
  onClose,
  product,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = product.available_quantity || product.stock_quantity || 100;
  const numQty = parseFloat(quantity) || 0;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const totalAmount = numQty * price;

  const handleReserve = async () => {
    if (!product.active_crop_growth_id) {
      Alert.alert('Error', 'No active crop cycle found for this product.');
      return;
    }

    if (numQty <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    if (numQty > available) {
      setError(`Maximum available quantity to reserve is ${available} ${product.unit}.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await reserveCrop(product.active_crop_growth_id, {
        quantity: numQty,
      });
      Alert.alert(
        'Harvest Reserved! 🌱',
        `You have successfully reserved ${numQty} ${product.unit} of ${product.name}. You will be notified when harvest begins.`,
        [{ text: 'OK', onPress: () => { onClose(); onSuccess?.(); } }]
      );
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to reserve crop. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Reservation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Sprout size={20} color={colors.brand.primary} style={{ marginRight: 8 }} />
              <AppText variant="subheading" weight="bold">Pre-book Harvest</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Crop Info Card */}
            <AppCard elevated padding="md" style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <AppText weight="bold" style={styles.cropName}>{product.name}</AppText>
                {product.crop_stage && (
                  <AppBadge stage={product.crop_stage} size="sm" label="" />
                )}
              </View>
              <AppText variant="small" color={colors.text.secondary}>
                by {product.farmer_name || 'Verified Farmer'}
              </AppText>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Calendar size={14} color={colors.text.muted} />
                  <AppText variant="small" color={colors.text.secondary} style={{ marginLeft: 4 }}>
                    Harvest: {formatDate(product.harvest_date)}
                  </AppText>
                </View>
                <View style={styles.infoItem}>
                  <Package size={14} color={colors.text.muted} />
                  <AppText variant="small" color={colors.text.secondary} style={{ marginLeft: 4 }}>
                    Available: {available} {product.unit}
                  </AppText>
                </View>
              </View>
            </AppCard>

            {error && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={colors.status.danger} style={{ marginRight: 6 }} />
                <AppText variant="small" color={colors.status.danger} style={{ flex: 1 }}>{error}</AppText>
              </View>
            )}

            {/* Quantity Input */}
            <View style={styles.inputSection}>
              <AppText variant="small" weight="bold" color={colors.text.secondary} style={styles.inputLabel}>
                RESERVATION QUANTITY ({product.unit.toUpperCase()})
              </AppText>
              <View style={styles.qtyInputWrapper}>
                <TextInput
                  value={quantity}
                  onChangeText={(val) => { setQuantity(val); setError(null); }}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={colors.text.muted}
                  style={styles.qtyInput}
                />
                <AppText weight="bold" color={colors.text.secondary} style={{ marginRight: spacing.md }}>
                  {product.unit}
                </AppText>
              </View>
            </View>

            {/* Quick Quantity Chips */}
            <View style={styles.chipsRow}>
              {[5, 10, 20, 50].map((qty) => (
                <TouchableOpacity
                  key={qty}
                  style={[styles.chip, numQty === qty && styles.chipActive]}
                  onPress={() => { setQuantity(String(qty)); setError(null); }}
                >
                  <AppText 
                    variant="small" 
                    weight={numQty === qty ? 'bold' : 'medium'}
                    color={numQty === qty ? colors.brand.primary : colors.text.secondary}
                  >
                    {qty} {product.unit}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Estimated Total */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <AppText color={colors.text.secondary}>Unit Price</AppText>
                <AppText weight="medium">{formatCurrency(product.price)} / {product.unit}</AppText>
              </View>
              <View style={styles.summaryRow}>
                <AppText color={colors.text.secondary}>Reserved Quantity</AppText>
                <AppText weight="medium">{numQty} {product.unit}</AppText>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <AppText weight="bold">Estimated Total</AppText>
                <AppText variant="subheading" weight="bold" color={colors.brand.primary}>
                  {formatCurrency(totalAmount)}
                </AppText>
              </View>
            </View>

            <AppText variant="small" color={colors.text.muted} style={styles.disclaimer}>
              * No upfront payment required. You will receive an alert to confirm purchase upon harvest completion.
            </AppText>
          </View>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <AppButton
              title={loading ? 'Reserving...' : `Confirm Pre-booking • ${formatCurrency(totalAmount)}`}
              onPress={handleReserve}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    maxHeight: '90%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  closeBtn: {
    padding: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.background.elevated,
  },
  content: {
    padding: spacing.xl,
  },
  cropCard: {
    backgroundColor: colors.background.elevated,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cropName: {
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.dangerMuted,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  inputSection: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  qtyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    height: 48,
  },
  qtyInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipActive: {
    backgroundColor: colors.brand.muted,
    borderColor: colors.brand.primary,
  },
  summaryCard: {
    backgroundColor: colors.background.elevated,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disclaimer: {
    fontStyle: 'italic',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
