import React from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppBadge, AppEmptyState } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, Order } from '../../api/orders';
import { formatCurrency, formatDate } from '../../utils/format';
import { 
  Package, LogOut, Settings, HelpCircle, Info, 
  ChevronRight, Sprout, ShoppingBag, ShieldCheck 
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const isFarmer = user?.user_type === 'farmer';

  const { data: ordersData = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders-profile'],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  const orders = ordersData.slice(0, 3);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Farmket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          } 
        }
      ]
    );
  };

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}` 
    : (user?.username || 'Guest User');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Account Profile" />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <AppCard elevated padding="xl" style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            {user?.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <AppText variant="heading" weight="bold" color={colors.brand.primary}>
                  {user ? displayName.charAt(0).toUpperCase() : '?'}
                </AppText>
              </View>
            )}
            {user && (
              <View style={styles.roleBadgeContainer}>
                <AppBadge 
                  label={isFarmer ? 'Farmer' : 'Buyer'} 
                  variant={isFarmer ? 'warning' : 'brand'} 
                  size="sm" 
                />
              </View>
            )}
          </View>
          
          <AppText variant="heading" weight="bold" style={styles.name}>
            {displayName}
          </AppText>
          <AppText variant="small" color={colors.text.secondary} style={styles.email}>
            {user ? user.email : 'Sign in to access your farm store & orders'}
          </AppText>
          
          {!user ? (
            <AppButton 
              title="Sign In / Register" 
              fullWidth 
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginBtn}
            />
          ) : isFarmer ? (
            <View style={styles.farmerPill}>
              <Sprout size={14} color={colors.brand.primary} />
              <AppText variant="small" weight="bold" color={colors.brand.primary} style={{ marginLeft: 4 }}>
                {user.farm_name || `${displayName}'s Farm`} • Verified Producer
              </AppText>
            </View>
          ) : null}
        </AppCard>

        {/* Recent Orders Section */}
        {user && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <AppText variant="subheading" weight="bold">
                {isFarmer ? 'Recent Store Orders' : 'My Recent Orders'}
              </AppText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)}>
                <AppText variant="small" weight="bold" color={colors.brand.primary}>View All →</AppText>
              </TouchableOpacity>
            </View>

            {loadingOrders ? (
              <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginVertical: spacing.lg }} />
            ) : orders.length > 0 ? (
              <View style={styles.ordersCardGroup}>
                {orders.map((order: Order) => (
                  <TouchableOpacity 
                    key={order.id} 
                    style={styles.orderItem}
                    onPress={() => router.push(`/order/${order.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.orderIconBg}>
                      <ShoppingBag size={18} color={colors.brand.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <AppText weight="bold">#{order.order_number || `ORD-${order.id}`}</AppText>
                      <AppText variant="small" color={colors.text.muted}>{formatDate(order.created_at)}</AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: spacing.sm }}>
                      <AppBadge status={order.status} size="sm" label={order.status} />
                      <AppText weight="bold" style={{ marginTop: 2 }}>
                        {formatCurrency(order.total_amount || order.total_price)}
                      </AppText>
                    </View>
                    <ChevronRight size={16} color={colors.text.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <AppEmptyState 
                title="No Orders Yet" 
                description="When transactions occur, they will be listed here."
                icon={<Package size={32} color={colors.text.muted} />}
              />
            )}
          </View>
        )}
        
        {/* Settings & Support Menu */}
        <View style={styles.section}>
          <AppText variant="subheading" weight="bold" style={styles.sectionTitle}>
            Account & Support
          </AppText>

          <View style={styles.menuGroup}>
            <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
              <View style={styles.menuIconBg}>
                <Settings size={18} color={colors.text.primary} />
              </View>
              <AppText weight="medium" style={{ flex: 1 }}>Settings & Security</AppText>
              <ChevronRight size={18} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
              <View style={styles.menuIconBg}>
                <HelpCircle size={18} color={colors.text.primary} />
              </View>
              <AppText weight="medium" style={{ flex: 1 }}>Help & Support</AppText>
              <ChevronRight size={18} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
              <View style={styles.menuIconBg}>
                <ShieldCheck size={18} color={colors.text.primary} />
              </View>
              <AppText weight="medium" style={{ flex: 1 }}>About Farmket Standards</AppText>
              <ChevronRight size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
          
          {user && (
            <AppButton 
              title="Log Out" 
              variant="outline"
              leftIcon={<LogOut size={18} color={colors.status.danger} />}
              fullWidth 
              onPress={handleLogout}
              style={styles.logoutBtn}
            />
          )}
        </View>
      </ScrollView>
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
    gap: spacing.lg,
  },
  userCard: {
    alignItems: 'center',
    borderRadius: radii.xxl,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.brand.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadgeContainer: {
    position: 'absolute',
    bottom: -4,
    right: -8,
  },
  name: {
    marginBottom: 2,
    fontSize: 20,
  },
  email: {
    marginBottom: spacing.sm,
  },
  farmerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.muted + '40',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: spacing.xs,
  },
  loginBtn: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  ordersCardGroup: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  orderIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGroup: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  logoutBtn: {
    marginTop: spacing.xl,
    borderColor: colors.status.dangerMuted,
  },
});
