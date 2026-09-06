import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppBadge, SectionHeader } from '../../components/ui';
import { TopBarActions } from '../../components/navigation/TopBarActions';
import { colors, spacing, radii, shadows } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { fetchOrders, Order } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { formatCurrency, formatDate } from '../../utils/format';
import { 
  TrendingUp, ShoppingBag, Sprout, Package, Clock, 
  ArrowRight, Newspaper, ChevronRight, PlusCircle, ShieldCheck 
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
    enabled: !!user && user.user_type === 'farmer',
  });

  // Fetch Recent Orders
  const { data: ordersData = [], isLoading: loadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['farmer-recent-orders'],
    queryFn: fetchOrders,
    enabled: !!user && user.user_type === 'farmer',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchOrders()]);
    setRefreshing(false);
  }, [refetchStats, refetchOrders]);

  if (!user || user.user_type !== 'farmer') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Farmer Operations" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <AppCard variant="tinted" padding="xl" borderRadius={radii.xxl} style={{ alignItems: 'center', maxWidth: 340 }}>
            <View style={styles.heroIconBg}>
              <Sprout size={36} color={colors.brand.primary} />
            </View>
            <AppText variant="h2" weight="bold" align="center" style={{ marginTop: spacing.md }}>
              Farmer Access Required
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary} align="center" style={{ marginTop: spacing.xs, marginBottom: spacing.xl, lineHeight: 20 }}>
              This operations hub is exclusively for registered and verified Farmket agricultural producers.
            </AppText>
            <AppButton
              title={user ? "Return to Buyer Home" : "Sign In to Farmket"}
              shape="pill"
              fullWidth
              onPress={() => user ? router.replace('/(tabs)') : router.push('/(auth)/login')}
            />
          </AppCard>
        </View>
      </View>
    );
  }

  const recentOrders = ordersData.slice(0, 4);
  const farmerName = user?.first_name || user?.username || 'Farmer';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title="Producer Hub" 
        rightActions={<TopBarActions showCart={false} showNotifications={true} />}
      />

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
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color="#FFFFFF" />
              <AppText variant="label" color="#FFFFFF" weight="bold" style={{ marginLeft: 4 }}>
                VERIFIED PRODUCER
              </AppText>
            </View>
            <AppText variant="h2" weight="bold" color="#FFFFFF" style={{ marginTop: 6 }}>
              Welcome back, {farmerName}
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.9)" style={{ marginTop: 4, lineHeight: 18 }}>
              Monitor live field cycles, fulfill direct customer orders, and manage sales revenue.
            </AppText>
          </View>
          <View style={styles.heroIconBg}>
            <Sprout size={32} color="#FFFFFF" />
          </View>
        </View>

        {/* Store Overview KPI Grid */}
        <SectionHeader title="Store Overview" subtitle="Real-time commercial performance" />

        <View style={styles.kpiGrid}>
          <AppCard variant="elevated" padding="md" borderRadius={radii.xl} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <AppText variant="label" color={colors.text.muted}>REVENUE</AppText>
              <View style={[styles.kpiIcon, { backgroundColor: colors.brand.tint }]}>
                <TrendingUp size={15} color={colors.brand.primary} />
              </View>
            </View>
            <AppText variant="h2" weight="bold" color={colors.brand.primary} style={styles.kpiValue}>
              {loadingStats ? '—' : formatCurrency(stats?.total_revenue || 0)}
            </AppText>
          </AppCard>

          <AppCard variant="elevated" padding="md" borderRadius={radii.xl} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <AppText variant="label" color={colors.text.muted}>TOTAL ORDERS</AppText>
              <View style={[styles.kpiIcon, { backgroundColor: colors.status.infoMuted }]}>
                <ShoppingBag size={15} color={colors.status.info} />
              </View>
            </View>
            <AppText variant="h2" weight="bold" color={colors.text.primary} style={styles.kpiValue}>
              {loadingStats ? '—' : stats?.total_orders || 0}
            </AppText>
          </AppCard>

          <AppCard variant="elevated" padding="md" borderRadius={radii.xl} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <AppText variant="label" color={colors.text.muted}>ACTIVE LISTINGS</AppText>
              <View style={[styles.kpiIcon, { backgroundColor: colors.accent.amber + '22' }]}>
                <Package size={15} color={colors.accent.amber} />
              </View>
            </View>
            <AppText variant="h2" weight="bold" color={colors.text.primary} style={styles.kpiValue}>
              {loadingStats ? '—' : stats?.total_products || 0}
            </AppText>
          </AppCard>

          <AppCard variant="elevated" padding="md" borderRadius={radii.xl} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <AppText variant="label" color={colors.text.muted}>PENDING ORDERS</AppText>
              <View style={[styles.kpiIcon, { backgroundColor: colors.status.warningMuted }]}>
                <Clock size={15} color={colors.status.warning} />
              </View>
            </View>
            <AppText variant="h2" weight="bold" color={colors.status.warning} style={styles.kpiValue}>
              {loadingStats ? '—' : stats?.pending_orders || 0}
            </AppText>
          </AppCard>
        </View>

        {/* Quick Operations Shortcuts */}
        <SectionHeader title="Farm Operations" subtitle="Manage crops and orders" />

        <View style={styles.shortcutsRow}>
          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => router.push('/(tabs)/farmer-crops' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.brand.tint }]}>
              <Sprout size={22} color={colors.brand.primary} />
            </View>
            <AppText variant="bodySmall" weight="bold" style={{ marginTop: 8 }}>Crop Hub</AppText>
            <AppText variant="label" color={colors.text.muted}>Lifecycle Stages</AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => router.push('/(tabs)/feed' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.status.infoMuted }]}>
              <Newspaper size={22} color={colors.status.info} />
            </View>
            <AppText variant="bodySmall" weight="bold" style={{ marginTop: 8 }}>Field Feed</AppText>
            <AppText variant="label" color={colors.text.muted}>Post Updates</AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => router.push('/(tabs)/orders' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.accent.amber + '22' }]}>
              <ShoppingBag size={22} color={colors.accent.amber} />
            </View>
            <AppText variant="bodySmall" weight="bold" style={{ marginTop: 8 }}>Fulfillment</AppText>
            <AppText variant="label" color={colors.text.muted}>Shipments</AppText>
          </TouchableOpacity>
        </View>

        {/* Recent Orders List */}
        <SectionHeader 
          title="Recent Orders" 
          actionTitle="View all" 
          onAction={() => router.push('/(tabs)/orders' as any)} 
        />

        {loadingOrders ? (
          <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginVertical: spacing.lg }} />
        ) : recentOrders.length === 0 ? (
          <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.emptyOrdersCard}>
            <AppText variant="bodySmall" color={colors.text.muted} align="center">
              No orders received yet. Once buyers order your produce, they will be listed here.
            </AppText>
          </AppCard>
        ) : (
          <View style={styles.ordersList}>
            {recentOrders.map((ord: Order) => (
              <TouchableOpacity
                key={ord.id}
                style={styles.orderRow}
                onPress={() => router.push(`/order/${ord.id}` as any)}
                activeOpacity={0.75}
              >
                <View style={styles.orderIcon}>
                  <ShoppingBag size={18} color={colors.brand.primary} />
                </View>
                <View style={styles.orderInfo}>
                  <AppText variant="bodySmall" weight="bold">#{ord.order_number || `ORD-${ord.id}`}</AppText>
                  <AppText variant="caption" color={colors.text.muted}>{formatDate(ord.created_at)}</AppText>
                </View>
                <View style={styles.orderStatusCol}>
                  <AppBadge status={ord.status} size="xs" label={ord.status} />
                  <AppText variant="bodySmall" weight="bold" color={colors.text.primary} style={{ marginTop: 4 }}>
                    {formatCurrency(ord.total_amount || ord.total_price)}
                  </AppText>
                </View>
                <ChevronRight size={16} color={colors.text.muted} />
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
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.brand.primary,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  heroContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  heroIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: colors.background.surface,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  kpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    marginTop: 2,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    ...shadows.xs,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOrdersCard: {
    backgroundColor: colors.background.surface,
  },
  ordersList: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
    ...shadows.xs,
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
    backgroundColor: colors.brand.tint,
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
