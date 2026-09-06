import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppHeader, AppText, AppCard, AppEmptyState, AppButton, AppBadge } from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderDetail, Order, OrderItem } from '../../api/orders';
import { formatCurrency, formatDate, formatTime } from '../../utils/format';
import { CheckCircle2, Truck, Package, Clock, MapPin, Info, ShoppingBag, MessageSquare } from 'lucide-react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderDetail(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <AppHeader title={`Order #${id}`} showBack />
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title={`Order #${id}`} showBack />
        <AppEmptyState 
          title="Order Not Found"
          description="We couldn't retrieve the details for this order."
          actionTitle="Back to Orders"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'delivered':
        return { color: colors.status.success, icon: CheckCircle2, label: 'Delivered', msg: 'Produce safely received.' };
      case 'shipped':
        return { color: colors.status.info, icon: Truck, label: 'Out for Delivery', msg: 'Your fresh harvest is en route.' };
      case 'processing':
        return { color: colors.accent.amber, icon: Package, label: 'Preparing Harvest', msg: 'The farmer is packing your produce.' };
      case 'pending':
        return { color: colors.status.warning, icon: Clock, label: 'Order Confirmed', msg: 'Direct order registered with farmer.' };
      case 'cancelled':
        return { color: colors.status.danger, icon: Package, label: 'Cancelled', msg: 'This order was cancelled.' };
      default:
        return { color: colors.text.secondary, icon: Package, label: status, msg: 'Status updated.' };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const totalAmount = Number(order.total_amount || order.total_price || 0);

  // Status timeline steps
  const steps = [
    { key: 'placed', label: 'Placed', isDone: true },
    { key: 'confirmed', label: 'Confirmed', isDone: ['pending', 'processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) },
    { key: 'shipped', label: 'Dispatched', isDone: ['shipped', 'delivered'].includes(order.status.toLowerCase()) },
    { key: 'delivered', label: 'Delivered', isDone: order.status.toLowerCase() === 'delivered' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title={`Order #${order.order_number || order.id}`} showBack />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card with Timeline */}
        <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.section}>
          <View style={styles.statusHeaderRow}>
            <View>
              <AppText variant="h3" weight="bold">
                Order #{order.order_number || `ORD-${order.id}`}
              </AppText>
              <AppText variant="caption" color={colors.text.muted} style={{ marginTop: 2 }}>
                {formatDate(order.created_at)} at {formatTime(order.created_at)}
              </AppText>
            </View>
            <AppBadge status={order.status} size="sm" label={statusConfig.label} />
          </View>
          
          <View style={styles.statusMessageRow}>
            <Info size={15} color={colors.brand.primary} />
            <AppText variant="caption" color={colors.text.secondary} style={{ marginLeft: spacing.xs, flex: 1 }}>
              {statusConfig.msg}
            </AppText>
          </View>

          {/* Timeline Bar */}
          <View style={styles.timelineWrapper}>
            {steps.map((step, idx) => (
              <React.Fragment key={step.key}>
                <View style={styles.stepNode}>
                  <View style={[styles.stepDot, step.isDone && styles.stepDotDone]}>
                    {step.isDone && <CheckCircle2 size={10} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <AppText 
                    variant="label" 
                    weight={step.isDone ? 'bold' : 'normal'} 
                    color={step.isDone ? colors.text.primary : colors.text.muted}
                    style={styles.stepLabel}
                  >
                    {step.label}
                  </AppText>
                </View>
                {idx < steps.length - 1 && (
                  <View style={[styles.stepLine, steps[idx + 1].isDone && styles.stepLineDone]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </AppCard>

        {/* Real Order Items */}
        {order.items && order.items.length > 0 && (
          <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.section}>
            <AppText variant="bodySmall" weight="bold" style={styles.sectionTitle}>
              Produce Items ({order.items.length})
            </AppText>
            
            <View style={styles.itemsList}>
              {order.items.map((item: OrderItem) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemIconBg}>
                    <ShoppingBag size={18} color={colors.brand.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <AppText variant="bodySmall" weight="bold">{item.product_name || `Product #${item.product}`}</AppText>
                    <AppText variant="caption" color={colors.text.muted} style={{ marginTop: 2 }}>
                      Qty: {item.quantity} × {formatCurrency(item.price_at_purchase || item.price || 0)}
                    </AppText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText variant="bodySmall" weight="bold" color={colors.brand.primary}>
                      {formatCurrency(item.subtotal || (Number(item.price || 0) * item.quantity))}
                    </AppText>
                    {item.status && (
                      <View style={{ marginTop: 4 }}>
                        <AppBadge status={item.status} size="xs" label={item.status} />
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </AppCard>
        )}

        {/* Delivery Address */}
        {(order.delivery_address || order.shipping_address) && (
          <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <MapPin size={16} color={colors.brand.primary} />
              <AppText variant="bodySmall" weight="bold" style={{ marginLeft: spacing.xs }}>
                Delivery Destination
              </AppText>
            </View>
            <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 4, lineHeight: 18 }}>
              {order.delivery_address || order.shipping_address}
            </AppText>
            {order.payment_method && (
              <AppText variant="label" color={colors.text.muted} style={{ marginTop: spacing.sm }}>
                Payment Method: <AppText variant="label" weight="bold" color={colors.text.primary}>{order.payment_method.toUpperCase()}</AppText>
              </AppText>
            )}
          </AppCard>
        )}

        {/* Order Summary */}
        <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.section}>
          <AppText variant="bodySmall" weight="bold" style={styles.sectionTitle}>
            Payment Breakdown
          </AppText>
          
          <View style={styles.summaryRow}>
            <AppText variant="bodySmall" color={colors.text.secondary}>Subtotal</AppText>
            <AppText variant="bodySmall" weight="medium">{formatCurrency(totalAmount)}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText variant="bodySmall" color={colors.text.secondary}>Direct Delivery</AppText>
            <AppText variant="bodySmall" weight="bold" color={colors.status.success}>FREE</AppText>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <AppText variant="h3" weight="bold">Total Amount</AppText>
            <AppText variant="display" weight="bold" color={colors.brand.primary} style={{ fontSize: 22 }}>
              {formatCurrency(totalAmount)}
            </AppText>
          </View>
        </AppCard>
      </ScrollView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton 
          title="Direct Support / Questions" 
          variant="outline" 
          shape="pill"
          fullWidth 
          size="lg"
          leftIcon={<MessageSquare size={16} color={colors.brand.primary} />}
          onPress={() => router.push('/(tabs)/chat')}
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
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.background.surface,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.tint,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  timelineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  stepNode: {
    alignItems: 'center',
    width: 54,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: colors.brand.primary,
  },
  stepLabel: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border.subtle,
    marginBottom: 16,
  },
  stepLineDone: {
    backgroundColor: colors.brand.primary,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  }
});
