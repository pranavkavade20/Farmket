import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppHeader, AppText, AppCard, AppEmptyState, AppButton, AppBadge } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderDetail, Order, OrderItem } from '../../api/orders';
import { formatCurrency, formatDate, formatTime } from '../../utils/format';
import { CheckCircle2, Truck, Package, Clock, MapPin, Info, ShoppingBag } from 'lucide-react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: order, isLoading, isError, refetch } = useQuery({
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
          description="We couldn't load this order's details from the server."
          actionTitle="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'delivered':
        return { color: colors.status.success, bgColor: colors.status.successMuted, icon: CheckCircle2, label: 'Delivered', msg: 'Your order has been delivered.' };
      case 'shipped':
        return { color: colors.status.info, bgColor: colors.status.infoMuted, icon: Truck, label: 'Shipped', msg: 'Your order is on the way.' };
      case 'processing':
        return { color: colors.accent.orange, bgColor: colors.accent.orange + '20', icon: Package, label: 'Processing', msg: 'The farmer is preparing your order.' };
      case 'pending':
        return { color: colors.status.warning, bgColor: colors.status.warningMuted, icon: Clock, label: 'Pending', msg: 'Order received, awaiting confirmation.' };
      case 'cancelled':
        return { color: colors.status.danger, bgColor: colors.status.dangerMuted, icon: Package, label: 'Cancelled', msg: 'This order was cancelled.' };
      default:
        return { color: colors.text.secondary, bgColor: colors.border.subtle, icon: Package, label: status, msg: 'Order status updated.' };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const totalAmount = Number(order.total_amount || order.total_price || 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title={`Order #${order.order_number || order.id}`} showBack />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <AppCard elevated padding="lg" style={styles.section}>
          <View style={styles.statusHeaderRow}>
            <View>
              <AppText variant="subheading" weight="bold">
                Order #{order.order_number || `ORD-${order.id}`}
              </AppText>
              <AppText variant="small" color={colors.text.muted}>
                {formatDate(order.created_at)} at {formatTime(order.created_at)}
              </AppText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <StatusIcon size={14} color={statusConfig.color} />
              <AppText variant="small" weight="semibold" color={statusConfig.color} style={{ marginLeft: 4 }}>
                {statusConfig.label}
              </AppText>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statusMessageRow}>
            <Info size={16} color={colors.text.secondary} />
            <AppText color={colors.text.secondary} style={{ marginLeft: spacing.sm }}>
              {statusConfig.msg}
            </AppText>
          </View>
        </AppCard>

        {/* Real Order Items */}
        {order.items && order.items.length > 0 && (
          <AppCard elevated padding="lg" style={styles.section}>
            <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>
              Ordered Items ({order.items.length})
            </AppText>
            
            <View style={styles.itemsList}>
              {order.items.map((item: OrderItem) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemIconBg}>
                    <ShoppingBag size={18} color={colors.brand.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <AppText weight="bold">{item.product_name || `Product #${item.product}`}</AppText>
                    <AppText variant="small" color={colors.text.muted}>
                      Quantity: {item.quantity} × {formatCurrency(item.price_at_purchase || item.price || 0)}
                    </AppText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText weight="bold">
                      {formatCurrency(item.subtotal || (Number(item.price || 0) * item.quantity))}
                    </AppText>
                    <AppBadge status={item.status} size="sm" label={item.status} />
                  </View>
                </View>
              ))}
            </View>
          </AppCard>
        )}

        {/* Delivery Address */}
        {(order.delivery_address || order.shipping_address) && (
          <AppCard elevated padding="lg" style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <MapPin size={18} color={colors.brand.primary} />
              <AppText variant="subheading" weight="bold" style={{ marginLeft: spacing.xs }}>
                Delivery Address
              </AppText>
            </View>
            <AppText color={colors.text.secondary} style={{ marginTop: 4 }}>
              {order.delivery_address || order.shipping_address}
            </AppText>
            {order.payment_method && (
              <AppText variant="small" color={colors.text.muted} style={{ marginTop: spacing.sm }}>
                Payment Method: <AppText variant="small" weight="bold">{order.payment_method.toUpperCase()}</AppText>
              </AppText>
            )}
          </AppCard>
        )}

        {/* Order Summary */}
        <AppCard elevated padding="lg" style={styles.section}>
          <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>
            Payment Summary
          </AppText>
          
          <View style={styles.summaryRow}>
            <AppText color={colors.text.secondary}>Subtotal</AppText>
            <AppText weight="medium">{formatCurrency(totalAmount)}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText color={colors.text.secondary}>Delivery</AppText>
            <AppText weight="bold" color={colors.brand.primary}>Free</AppText>
          </View>
          
          <View style={styles.totalRow}>
            <AppText variant="heading" weight="bold">Total Paid</AppText>
            <AppText variant="heading" weight="bold" color={colors.brand.primary}>
              {formatCurrency(totalAmount)}
            </AppText>
          </View>
        </AppCard>
      </ScrollView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton 
          title="Need Help? Chat Support" 
          variant="outline" 
          fullWidth 
          size="lg"
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
    padding: spacing.xl,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  section: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.md,
  },
  statusMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsList: {
    gap: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  itemIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
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
  }
});
