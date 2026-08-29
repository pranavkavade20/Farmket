import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppBadge } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { fetchOrders, Order } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { formatCurrency, formatDate } from '../../utils/format';
import { 
  TrendingUp, ShoppingBag, Sprout, Package, Clock, 
  ArrowRight, Newspaper, ChevronRight 
} from 'lucide-react-native';

export default function FarmerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Stats
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['farmer-stats'],
    queryFn: async () => {
      const res = await apiClient.get<{
        total_orders: number;
        total_revenue: number;
        total_products: number;
        pending_orders: number;
      }>('accounts/dashboard-stats/');
      return res.data;
    },
  });

  // Fetch Recent Orders
  const { data: ordersData = [], isLoading: loadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['farmer-recent-orders'],
    queryFn: fetchOrders,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchOrders()]);
    setRefreshing(false);
  }, [refetchStats, refetchOrders]);

  const recentOrders = ordersData.slice(0, 4);
  const farmerName = user?.first_name || user?.username || 'Farmer';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Farmer Operations" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
        }
      >
        {/* Welcome Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <AppText variant="subheading" weight="bold" color="#FFFFFF">
              Welcome back, {farmerName} 👋
            </AppText>
            <AppText variant="small" color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>
              Track farm cultivation, fulfill buyer orders, and view earnings in real-time.
            </AppText>
          </View>
          <View style={styles.heroIconBg}>
            <Sprout size={36} color="#FFFFFF" />
          </View>
        </View>

        {/* Store Overview KPI Grid */}
        <AppText variant="subheading" weight="bold" style={styles.sectionTitle}>
          Store Overview
        </AppText>

        <View style={styles.kpiGrid}>
          <AppCard elevated padding="md" style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <AppText variant="small" weight="bold" color={colors.text.secondary}>REVENUE</AppText>
              <View style={[styles.kpiIcon, { backgroundColor: colors.brand.muted }]}>
                <TrendingUp size={16} color={colors.brand.primary} />
              </View>
            </View>
            <AppText variant="heading" weight="bold" color={colors.text.primary} style={styles.kpiValue}>
              {loadingStats ? '—' : formatCurrency(stats?.total_revenue || 0)}
            </AppText>
          </AppCard>

          <AppCard elevated padding="md" style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <AppText variant="small" weight="bold" color={colors.text.secondary}>TOTAL ORDERS</AppText>
              <View style={[styles.kpiIcon, { backgroundColor: colors.status.infoMuted }]}>
                <ShoppingBag size={16} color={colors.status.info} />
              </View>
            </View>
            <AppText variant="heading" weight="bold" color={colors.text.primary} style={styles.kpiValue}>
              {loadingStats ? '—' : stats?.total_orders || 0}
            </AppText>
          </AppCard>

          <AppCard elevated padding="md" style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <AppText variant="small" weight="bold" color={colors.text.secondary}>PRODUCTS</AppText>
              <View style={[styles.kpiIcon, { backgroundColor: colors.accent.yellow + '33' }]}>
                <Package size={16} color={colors.accent.yellow} />
              </View>
            </View>
            <AppText variant="heading" weight="bold" color={colors.text.primary} style={styles.kpiValue}>
              {loadingStats ? '—' : stats?.total_products || 0}
            </AppText>
          </AppCard>

          <AppCard elevated padding="md" style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <AppText variant="small" weight="bold" color={colors.text.secondary}>PENDING</AppText>
              <View style={[styles.kpiIcon, { backgroundColor: colors.status.warningMuted }]}>
                <Clock size={16} color={colors.status.warning} />
              </View>
            </View>
            <AppText variant="heading" weight="bold" color={colors.status.warning} style={styles.kpiValue}>
              {loadingStats ? '—' : stats?.pending_orders || 0}
            </AppText>
          </AppCard>
        </View>

        {/* Quick Operations Shortcuts */}
        <AppText variant="subheading" weight="bold" style={styles.sectionTitle}>
          Quick Services
        </AppText>

        <View style={styles.shortcutsRow}>
          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => router.push('/(tabs)/farmer-crops' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.brand.muted }]}>
              <Sprout size={24} color={colors.brand.primary} />
            </View>
            <AppText weight="bold" style={{ fontSize: 13, marginTop: 8 }}>Crop Tracking</AppText>
            <AppText variant="small" color={colors.text.muted}>Stage Lifecycle</AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => router.push('/(tabs)/feed' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.status.infoMuted }]}>
              <Newspaper size={24} color={colors.status.info} />
            </View>
            <AppText weight="bold" style={{ fontSize: 13, marginTop: 8 }}>Community</AppText>
            <AppText variant="small" color={colors.text.muted}>Share Updates</AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => router.push('/(tabs)/orders' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.accent.orange + '22' }]}>
              <ShoppingBag size={24} color={colors.accent.orange} />
            </View>
            <AppText weight="bold" style={{ fontSize: 13, marginTop: 8 }}>Fulfill Orders</AppText>
            <AppText variant="small" color={colors.text.muted}>Shipments</AppText>
          </TouchableOpacity>
        </View>

        {/* Recent Orders List */}
        <View style={styles.recentOrdersHeader}>
          <AppText variant="subheading" weight="bold">Recent Orders</AppText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)}>
            <AppText variant="small" weight="bold" color={colors.brand.primary}>View All →</AppText>
          </TouchableOpacity>
        </View>

        {loadingOrders ? (
          <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginVertical: spacing.lg }} />
        ) : recentOrders.length === 0 ? (
          <AppCard elevated padding="lg" style={styles.emptyOrdersCard}>
            <AppText color={colors.text.muted} style={{ textAlign: 'center' }}>
              No orders received yet. Once buyers purchase your harvest, they will appear here.
            </AppText>
          </AppCard>
        ) : (
          <View style={styles.ordersList}>
            {recentOrders.map((ord: Order) => (
              <TouchableOpacity
                key={ord.id}
                style={styles.orderRow}
                onPress={() => router.push(`/order/${ord.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.orderIcon}>
                  <ShoppingBag size={18} color={colors.brand.primary} />
                </View>
                <View style={styles.orderInfo}>
                  <AppText weight="bold">#{ord.order_number || `ORD-${ord.id}`}</AppText>
                  <AppText variant="small" color={colors.text.muted}>{formatDate(ord.created_at)}</AppText>
                </View>
                <View style={styles.orderStatusCol}>
                  <AppBadge status={ord.status} size="sm" label={ord.status} />
                  <AppText weight="bold" style={{ marginTop: 4 }}>
                    {formatCurrency(ord.total_amount || ord.total_price)}
                  </AppText>
                </View>
                <ChevronRight size={18} color={colors.text.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.brand.primary,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  heroContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  heroIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  kpiCard: {
    width: '47%',
    borderRadius: radii.xl,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  kpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 20,
    marginTop: 2,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyOrdersCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.background.surface,
  },
  ordersList: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  orderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderStatusCol: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
});
