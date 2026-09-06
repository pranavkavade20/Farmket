import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppBadge, AppEmptyState, AppInput } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, Order } from '../../api/orders';
import { formatCurrency, formatDate } from '../../utils/format';
import { resendVerificationApi, changePasswordApi } from '../../api/auth';
import { normalizeApiError } from '../../api/client';
import { 
  Package, LogOut, Settings, HelpCircle, Info, 
  ChevronRight, Sprout, ShoppingBag, ShieldCheck, CheckCircle2, AlertTriangle, Lock
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, logoutAll } = useAuth();
  const isFarmer = user?.user_type === 'farmer';

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

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

  const handleLogoutAll = () => {
    Alert.alert(
      'Log Out All Devices',
      'This will invalidate your sessions on all devices and phones. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out All',
          style: 'destructive',
          onPress: async () => {
            await logoutAll();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    try {
      const res = await resendVerificationApi(user.email);
      Alert.alert('Verification Sent', res.detail || 'Check your inbox for the verification email.');
    } catch (error) {
      Alert.alert('Error', normalizeApiError(error, 'Failed to send verification email.'));
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Required', 'Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Password Too Short', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    setChangingPass(true);
    try {
      await changePasswordApi(oldPassword, newPassword, confirmPassword);
      Alert.alert('Success', 'Your password has been changed successfully. Other sessions have been signed out.');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Password Error', normalizeApiError(error, 'Failed to change password.'));
    } finally {
      setChangingPass(false);
    }
  };

  const handleSecurityMenuPress = () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    const options: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [
      { text: 'Change Password', onPress: () => setShowPasswordModal(true) },
    ];

    if (!user.is_verified) {
      options.push({ text: 'Resend Verification Email', onPress: handleResendVerification });
    }

    options.push({ text: 'Log Out All Devices', onPress: handleLogoutAll, style: 'destructive' });
    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Security & Sessions', 'Manage your account security', options);
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

          {user && (
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: spacing.xs }}
              onPress={user.is_verified ? undefined : handleResendVerification}
              disabled={user.is_verified}
            >
              {user.is_verified ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircle2 size={13} color={colors.status.success} style={{ marginRight: 4 }} />
                  <AppText variant="caption" color={colors.status.success} weight="semibold">Verified Account</AppText>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.status.warning + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full }}>
                  <AlertTriangle size={13} color={colors.status.warning} style={{ marginRight: 4 }} />
                  <AppText variant="caption" color={colors.status.warning} weight="semibold">Unverified • Tap to resend email</AppText>
                </View>
              )}
            </TouchableOpacity>
          )}
          
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
            <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={handleSecurityMenuPress}>
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

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl }}>
          <AppCard elevated padding="xl">
            <AppText variant="subheading" weight="bold" style={{ marginBottom: spacing.sm }}>
              Change Password
            </AppText>
            <AppText variant="small" color={colors.text.secondary} style={{ marginBottom: spacing.lg }}>
              Update your account password. Other active sessions will be signed out.
            </AppText>

            <AppInput
              label="Current Password"
              placeholder="••••••••"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.text.muted} />}
            />

            <AppInput
              label="New Password"
              placeholder="Min 8 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.text.muted} />}
            />

            <AppInput
              label="Confirm New Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.text.muted} />}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <AppButton
                title="Cancel"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => setShowPasswordModal(false)}
              />
              <AppButton
                title="Save"
                style={{ flex: 1 }}
                loading={changingPass}
                onPress={handleChangePasswordSubmit}
              />
            </View>
          </AppCard>
        </View>
      </Modal>
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
