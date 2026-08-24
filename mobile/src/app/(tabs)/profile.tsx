import React from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppEmptyState } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../../api/orders';
import { Package, LogOut, Settings, HelpCircle, Info } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <AppCard elevated padding="xl" style={styles.card}>
          {user?.profile_picture ? (
            <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppText variant="heading" weight="bold" color={colors.text.muted}>
                {user ? user.first_name?.charAt(0).toUpperCase() : '?'}
              </AppText>
            </View>
          )}
          
          <AppText variant="heading" weight="semibold" style={styles.name}>
            {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.email}>
            {user ? user.email : 'Sign in to manage your account'}
          </AppText>
          
          {!user && (
            <AppButton 
              title="Log In" 
              fullWidth 
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginBtn}
            />
          )}
        </AppCard>

        {user && (
          <View style={styles.section}>
            <AppText variant="heading" weight="bold" style={styles.sectionTitle}>
              My Orders
            </AppText>
            {loadingOrders ? (
              <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginVertical: spacing.lg }} />
            ) : orders && orders.length > 0 ? (
              orders.map(order => (
                <AppCard key={order.id} style={styles.orderCard} padding="md">
                  <View style={styles.orderHeader}>
                    <AppText weight="bold">Order #{order.id}</AppText>
                    <View style={[styles.statusBadge, order.status === 'pending' ? styles.statusPending : styles.statusSuccess]}>
                      <AppText variant="small" weight="bold" color={order.status === 'pending' ? colors.status.warning : colors.status.success}>
                        {order.status.toUpperCase()}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="small" color={colors.text.secondary}>
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </AppText>
                  <AppText weight="bold" color={colors.brand.primary} style={{ marginTop: spacing.sm }}>
                    ${order.total_price}
                  </AppText>
                </AppCard>
              ))
            ) : (
              <AppEmptyState 
                title="No Orders Yet" 
                description="When you buy products, they will appear here."
                icon={<Package size={32} color={colors.text.muted} />}
              />
            )}
          </View>
        )}
        
        <View style={styles.section}>
          <AppText variant="heading" weight="bold" style={styles.sectionTitle}>
            Account
          </AppText>
          <AppCard style={styles.menuCard} padding="lg">
            <Settings size={20} color={colors.text.primary} style={styles.menuIcon} />
            <AppText weight="medium">Settings</AppText>
          </AppCard>
          <AppCard style={styles.menuCard} padding="lg">
            <HelpCircle size={20} color={colors.text.primary} style={styles.menuIcon} />
            <AppText weight="medium">Help & Support</AppText>
          </AppCard>
          <AppCard style={styles.menuCard} padding="lg">
            <Info size={20} color={colors.text.primary} style={styles.menuIcon} />
            <AppText weight="medium">About Farmket</AppText>
          </AppCard>
          
          {user && (
            <AppButton 
              title="Log Out" 
              variant="danger"
              leftIcon={<LogOut size={20} color={colors.text.inverse} />}
              fullWidth 
              onPress={logout}
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
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    marginBottom: spacing.xxs,
  },
  email: {
    marginBottom: spacing.xs,
  },
  loginBtn: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  orderCard: {
    marginBottom: spacing.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },
  statusPending: {
    backgroundColor: colors.status.warningMuted,
  },
  statusSuccess: {
    backgroundColor: colors.status.successMuted,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  logoutBtn: {
    marginTop: spacing.xl,
  }
});
