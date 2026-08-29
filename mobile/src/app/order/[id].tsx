import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppHeader, AppText, AppCard, AppEmptyState, AppButton } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderDetail } from '../../api/orders';
import { CheckCircle2, Truck, Package, Clock, MapPin, PackageOpen, Info } from 'lucide-react-native';

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
          description="We couldn't load this order's details."
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
        return { color: colors.accent.orange, bgColor: colors.accent.orange + '20', icon: Package, label: 'Processing', msg: 'We are preparing your order.' };
      case 'pending':
        return { color: colors.status.warning, bgColor: colors.status.warningMuted, icon: Clock, label: 'Pending', msg: 'Awaiting confirmation.' };
      case 'cancelled':
        return { color: colors.status.danger, bgColor: colors.status.dangerMuted, icon: Package, label: 'Cancelled', msg: 'This order was cancelled.' };
      default:
        return { color: colors.text.secondary, bgColor: colors.border.subtle, icon: Package, label: status, msg: 'Status unknown.' };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const dateObj = new Date(order.created_at);
  const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title={`Order Details`} showBack />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <AppCard elevated padding="lg" style={styles.section}>
          <View style={styles.statusHeaderRow}>
            <View>
              <AppText variant="subheading" weight="bold">Order #{order.id}</AppText>
              <AppText variant="small" color={colors.text.muted}>{formattedDate} at {formattedTime}</AppText>
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

        {/* Tracking Timeline (Mock) */}
        {['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) && (
          <AppCard elevated padding="lg" style={styles.section}>
            <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>Track Order</AppText>
            
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIconWrapper}>
                  <View style={[styles.timelineIcon, styles.timelineIconActive]}>
                    <CheckCircle2 size={16} color={colors.background.surface} />
                  </View>
                  <View style={[styles.timelineLine, styles.timelineLineActive]} />
                </View>
                <View style={styles.timelineContent}>
                  <AppText weight="semibold">Order Placed</AppText>
                  <AppText variant="small" color={colors.text.muted}>{formattedDate}</AppText>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineIconWrapper}>
                  <View style={[styles.timelineIcon, order.status.toLowerCase() !== 'pending' ? styles.timelineIconActive : styles.timelineIconInactive]}>
                    <Package size={16} color={order.status.toLowerCase() !== 'pending' ? colors.background.surface : colors.text.muted} />
                  </View>
                  <View style={[styles.timelineLine, ['shipped', 'delivered'].includes(order.status.toLowerCase()) ? styles.timelineLineActive : styles.timelineLineInactive]} />
                </View>
                <View style={styles.timelineContent}>
                  <AppText weight="semibold">Processing</AppText>
                  <AppText variant="small" color={colors.text.muted}>Seller is preparing your items</AppText>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineIconWrapper}>
                  <View style={[styles.timelineIcon, ['shipped', 'delivered'].includes(order.status.toLowerCase()) ? styles.timelineIconActive : styles.timelineIconInactive]}>
                    <Truck size={16} color={['shipped', 'delivered'].includes(order.status.toLowerCase()) ? colors.background.surface : colors.text.muted} />
                  </View>
                </View>
                <View style={styles.timelineContent}>
                  <AppText weight="semibold">Out for Delivery</AppText>
                  <AppText variant="small" color={colors.text.muted}>Your order is on the way</AppText>
                </View>
              </View>
            </View>
          </AppCard>
        )}

        {/* Order Summary */}
        <AppCard elevated padding="lg" style={styles.section}>
          <AppText variant="heading" weight="semibold" style={styles.sectionTitle}>Order Summary</AppText>
          
          <View style={styles.summaryRow}>
            <AppText color={colors.text.secondary}>Subtotal</AppText>
            <AppText weight="medium">₹{Number(order.total_price).toFixed(2)}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText color={colors.text.secondary}>Delivery</AppText>
            <AppText weight="bold" color={colors.brand.primary}>Free</AppText>
          </View>
          
          <View style={styles.totalRow}>
            <AppText variant="heading" weight="bold">Total Paid</AppText>
            <AppText variant="heading" weight="bold" color={colors.brand.primary}>
              ₹{Number(order.total_price).toFixed(2)}
            </AppText>
          </View>
        </AppCard>
      </ScrollView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton 
          title="Need Help?" 
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
    marginBottom: spacing.lg,
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
  timeline: {
    marginLeft: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineIconWrapper: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineIconActive: {
    backgroundColor: colors.brand.primary,
  },
  timelineIconInactive: {
    backgroundColor: colors.background.main,
    borderWidth: 2,
    borderColor: colors.border.subtle,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    position: 'absolute',
    top: 32,
    bottom: -24,
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: colors.brand.primary,
  },
  timelineLineInactive: {
    backgroundColor: colors.border.subtle,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
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
