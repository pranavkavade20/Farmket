import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppEmptyState, AppText, AppCard, AppButton, AppBadge, SegmentedControl } from '../../components/ui';
import { TopBarActions } from '../../components/navigation/TopBarActions';
import { colors, spacing, radii, shadows } from '../../theme';
import { ClipboardList, Package, Truck, CheckCircle2, Clock, LogIn, UserPlus, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, Order } from '../../api/orders';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/format';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'delivered'>('all');

  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Orders" />
        <View style={styles.centerContent}>
          <AppCard variant="tinted" padding="xl" borderRadius={radii.xxl} style={styles.guestContainer}>
            <View style={styles.guestIconBg}>
              <ClipboardList size={36} color={colors.brand.primary} />
            </View>
            <AppText variant="h2" weight="bold" align="center" style={{ marginTop: spacing.md }}>
              Track Farm Deliveries
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary} align="center" style={styles.guestSubtitle}>
              Sign in to view real-time harvest fulfillment, order statuses, and shipment receipts.
            </AppText>
            <View style={styles.guestBtnGroup}>
              <AppButton
                title="Sign In"
                onPress={() => router.push('/(auth)/login')}
                fullWidth
                shape="pill"
                style={{ marginBottom: spacing.sm }}
              />
              <AppButton
                title="Create Free Account"
                variant="outline"
                onPress={() => router.push('/(auth)/register')}
                fullWidth
                shape="pill"
              />
            </View>
          </AppCard>
        </View>
      </View>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'processing') return ['pending', 'processing', 'shipped'].includes(order.status.toLowerCase());
    if (activeTab === 'delivered') return order.status.toLowerCase() === 'delivered';
    return true;
  });

  const renderOrder = ({ item }: { item: Order }) => {
    const totalAmount = Number(item.total_amount || item.total_price || 0);

    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => router.push(`/order/${item.id}` as any)}
      >
        <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <AppText variant="label" color={colors.text.muted}>
                ORDER #{item.order_number || item.id}
              </AppText>
              <AppText variant="bodySmall" weight="bold" style={{ marginTop: 2 }}>
                {formatDate(item.created_at)}
              </AppText>
            </View>
            <AppBadge status={item.status} size="sm" label={item.status} />
          </View>
          
          <View style={styles.orderDivider} />
          
          <View style={styles.orderFooter}>
            <View style={styles.itemPreview}>
              <View style={styles.iconCircle}>
                <Package size={16} color={colors.brand.primary} />
              </View>
              <AppText variant="caption" color={colors.text.secondary} style={{ marginLeft: spacing.xs }}>
                {item.items?.length ? `${item.items.length} produce ${item.items.length === 1 ? 'item' : 'items'}` : 'View details'}
              </AppText>
            </View>
            
            <View style={styles.priceContainer}>
              <AppText variant="h3" weight="bold" color={colors.brand.primary}>
                {formatCurrency(totalAmount)}
              </AppText>
              <ChevronRight size={16} color={colors.text.muted} style={{ marginLeft: 4 }} />
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title={isFarmer ? "Farm Store Orders" : "My Orders"} 
        rightActions={<TopBarActions showCart={true} showNotifications={true} />}
      />
      
      {/* Tab Segmented Control */}
      <View style={styles.tabsContainer}>
        <SegmentedControl
          tabs={[
            { id: 'all', label: 'All Orders' },
            { id: 'processing', label: 'In Progress' },
            { id: 'delivered', label: 'Delivered' },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="Failed to Load Orders" 
            description="We couldn't connect to retrieve your order history."
            actionTitle="Retry"
            onAction={refetch}
          />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.centerContent}>
          <AppEmptyState 
            title="No Orders Found" 
            description={activeTab === 'all' ? "You haven't placed any harvest orders yet." : `No ${activeTab} orders at this moment.`}
            icon={<ClipboardList size={44} color={colors.brand.muted} />}
            actionTitle={activeTab === 'all' && !isFarmer ? "Explore Produce" : undefined}
            onAction={activeTab === 'all' && !isFarmer ? () => router.push('/(tabs)/search') : undefined}
          />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  guestContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  guestIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestSubtitle: {
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  guestBtnGroup: {
    width: '100%',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.sm,
  },
  orderCard: {
    backgroundColor: colors.background.surface,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.md,
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
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
