import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppEmptyState, AppText, AppCard, AppButton } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { ClipboardList, Package, ChevronRight, Truck, CheckCircle2, Clock } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, Order } from '../../api/orders';
import { useRouter } from 'expo-router';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'delivered'>('all');

  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredOrders = orders?.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'processing') return ['pending', 'processing', 'shipped'].includes(order.status.toLowerCase());
    if (activeTab === 'delivered') return order.status.toLowerCase() === 'delivered';
    return true;
  }) || [];

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'delivered':
        return { color: colors.status.success, bgColor: colors.status.successMuted, icon: CheckCircle2, label: 'Delivered' };
      case 'shipped':
        return { color: colors.status.info, bgColor: colors.status.infoMuted, icon: Truck, label: 'Shipped' };
      case 'processing':
        return { color: colors.accent.orange, bgColor: colors.accent.orange + '20', icon: Package, label: 'Processing' };
      case 'pending':
        return { color: colors.status.warning, bgColor: colors.status.warningMuted, icon: Clock, label: 'Pending' };
      case 'cancelled':
        return { color: colors.status.danger, bgColor: colors.status.dangerMuted, icon: Package, label: 'Cancelled' };
      default:
        return { color: colors.text.secondary, bgColor: colors.border.subtle, icon: Package, label: status };
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const statusConfig = getStatusConfig(item.status);
    const StatusIcon = statusConfig.icon;

    // Formatting date
    const dateObj = new Date(item.created_at);
    const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => router.push(`/order/${item.id}` as any)}
      >
        <AppCard elevated padding="md" style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <AppText variant="small" color={colors.text.muted}>Order #{item.id}</AppText>
              <AppText weight="semibold" style={{ marginTop: 2 }}>{formattedDate}</AppText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <StatusIcon size={14} color={statusConfig.color} />
              <AppText variant="small" weight="semibold" color={statusConfig.color} style={{ marginLeft: 4 }}>
                {statusConfig.label}
              </AppText>
            </View>
          </View>
          
          <View style={styles.orderDivider} />
          
          <View style={styles.orderFooter}>
            <View style={styles.itemPreview}>
              <Package size={20} color={colors.text.muted} />
              <AppText color={colors.text.secondary} style={{ marginLeft: spacing.sm }}>View order details</AppText>
            </View>
            
            <View style={styles.priceContainer}>
              <AppText variant="small" color={colors.text.muted}>Total</AppText>
              <AppText weight="bold" color={colors.text.primary}>₹{Number(item.total_price).toFixed(2)}</AppText>
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="My Orders" />
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['all', 'processing', 'delivered'] as const).map(tab => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <AppText 
              weight="semibold" 
              color={activeTab === tab ? colors.brand.primary : colors.text.secondary}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="Failed to Load" 
            description="We couldn't load your orders."
            actionTitle="Retry"
            onAction={refetch}
          />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="No Orders Found" 
            description={activeTab === 'all' ? "Looks like you haven't placed any orders yet." : `You have no ${activeTab} orders.`}
            icon={<ClipboardList size={48} color={colors.brand.muted} strokeWidth={1.5} />}
            actionTitle={activeTab === 'all' ? "Browse Market" : undefined}
            onAction={activeTab === 'all' ? () => router.push('/(tabs)/search') : undefined}
          />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.brand.primary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  orderHeader: {
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
  orderDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.md,
    borderStyle: 'dashed',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  }
});
