import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  AppText,
  AppCard,
  AppButton,
  AppBadge,
  AppInput,
  FarmketCropRowCard,
} from '../../components/ui';
import { TopBarActions } from '../../components/navigation/TopBarActions';
import { colors, spacing, radii, shadows } from '../../theme';
import { FarmBannerSvg } from '../../components/illustrations/FarmBannerSvg';
import { FarmerAvatarSvg } from '../../components/illustrations/FarmerAvatarSvg';
import { useAuth } from '../../context/AuthContext';
import { fetchOrders, Order } from '../../api/orders';
import { fetchCrops } from '../../api/crops';
import { fetchProducts } from '../../api/products';
import { fetchFarmerProfile } from '../../api/farmers';
import { getDashboardStatsApi, resendVerificationApi, changePasswordApi } from '../../api/auth';
import { formatCurrency, formatDate } from '../../utils/format';
import { normalizeApiError } from '../../api/client';
import {
  Package,
  LogOut,
  Settings,
  ChevronRight,
  Sprout,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  MapPin,
  Store,
  ArrowRight,
  User,
  MessageSquare,
  Leaf,
  Layers,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  // 1. Dashboard Stats (Orders count, revenue / spent)
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: getDashboardStatsApi,
    enabled: !!user,
  });

  // 2. Live Farmer Profile (if farmer)
  const { data: farmerProfile } = useQuery({
    queryKey: ['farmer-profile-me', user?.id],
    queryFn: () => fetchFarmerProfile(user!.id),
    enabled: Boolean(user && isFarmer),
  });

  // 3. Live Crops (if farmer)
  const { data: cropsData, isLoading: loadingCrops } = useQuery({
    queryKey: ['farmer-crops-me', user?.id],
    queryFn: () => fetchCrops({ pageParam: `crops/?farmer=${user!.id}` }),
    enabled: Boolean(user && isFarmer),
  });

  // 4. Live Products (if farmer)
  const { data: productsData } = useQuery({
    queryKey: ['farmer-products-me', user?.id],
    queryFn: () => fetchProducts({ farmer: user!.id }),
    enabled: Boolean(user && isFarmer),
  });

  // 5. Live Orders (if buyer or farmer)
  const { data: ordersData = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders-profile', user?.id],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  const recentOrders = ordersData.slice(0, 3);
  const crops = cropsData?.results || [];
  const productsCount = productsData?.count ?? productsData?.results?.length ?? (isFarmer ? 6 : 0);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Farmket?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleLogoutAll = () => {
    Alert.alert(
      'Log Out All Devices',
      'This will invalidate your sessions on all devices. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out All',
          style: 'destructive',
          onPress: async () => {
            await logoutAll();
            router.replace('/(auth)/login');
          },
        },
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
      Alert.alert(
        'Success',
        'Your password has been changed successfully. Other sessions have been signed out.'
      );
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
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'Guest User';

  const farmTitle = farmerProfile?.farm_name || user?.farm_name || `${displayName}'s Farm`;
  const locationText = farmerProfile?.location || user?.address || 'Kolhapur, Maharashtra';

  const formatCropStage = (stage: string): 'Growing' | 'Harvest Ready' | 'Planted' => {
    if (stage === 'NEAR_HARVEST' || stage === 'HARVESTED') return 'Harvest Ready';
    if (stage === 'PLANTED') return 'Planted';
    return 'Growing';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
      >
        {/* 1. SCENIC FARM LANDSCAPE BANNER */}
        <View style={styles.bannerContainer}>
          <FarmBannerSvg width={SCREEN_WIDTH} height={180} variant="profileHeader" />

          {/* Floating Top Nav Actions */}
          <View style={[styles.floatingNav, { top: insets.top + spacing.xs }]}>
            <View style={styles.headerTagWrap}>
              <AppText variant="caption" weight="bold" color={colors.brand.forest}>
                {isFarmer ? '🌾 Farmer Account' : user ? '🛒 Buyer Account' : '👋 Welcome'}
              </AppText>
            </View>

            <TopBarActions showCart={!isFarmer} showNotifications={true} />
          </View>
        </View>

        {/* 2. OVERLAPPING AVATAR & IDENTITY */}
        <View style={styles.profileHeaderSection}>
          <View style={styles.avatarWrapper}>
            {user?.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatarImage} contentFit="cover" />
            ) : isFarmer ? (
              <FarmerAvatarSvg size={84} />
            ) : (
              <View style={styles.avatarInitialWrap}>
                <AppText variant="display" weight="bold" color="#FFFFFF" style={{ fontSize: 32 }}>
                  {user ? displayName.charAt(0).toUpperCase() : '?'}
                </AppText>
              </View>
            )}

            {user && (
              <View style={styles.avatarBadgeWrap}>
                <AppBadge
                  label={isFarmer ? 'Farmer' : 'Buyer'}
                  variant={isFarmer ? 'warning' : 'brand'}
                  size="xs"
                />
              </View>
            )}
          </View>

          {/* User / Farm Name */}
          <View style={styles.nameRow}>
            <AppText variant="h1" weight="bold" color={colors.text.primary} style={styles.name}>
              {isFarmer ? farmTitle : displayName}
            </AppText>
            {user?.is_verified && (
              <View style={styles.verifiedIconWrap}>
                <CheckCircle2 size={18} color="#15803D" fill="#DCFCE7" />
              </View>
            )}
          </View>

          {/* Secondary Title / Email */}
          <AppText variant="bodySmall" color={colors.text.secondary} style={styles.email}>
            {user ? user.email : 'Sign in to access your farm orders & produce'}
          </AppText>

          {/* Location / Producer Chip */}
          {user && (
            <View style={styles.locationRow}>
              <MapPin size={13} color={colors.brand.primary} />
              <AppText variant="caption" color={colors.text.muted} style={{ marginLeft: 4 }}>
                {locationText}
              </AppText>
            </View>
          )}

          {/* Verification Warning Chip if unverified */}
          {user && !user.is_verified && (
            <TouchableOpacity
              style={styles.unverifiedChip}
              onPress={handleResendVerification}
              activeOpacity={0.7}
            >
              <AlertTriangle size={13} color={colors.status.warning} style={{ marginRight: 4 }} />
              <AppText variant="label" color={colors.status.warning} weight="bold">
                Unverified • Tap to resend email
              </AppText>
            </TouchableOpacity>
          )}

          {/* Sign In button for guests */}
          {!user && (
            <AppButton
              title="Sign In / Register"
              fullWidth
              shape="pill"
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginBtn}
            />
          )}
        </View>

        {/* 3. LIVE STATISTICS ROW (RBAC Tailored) */}
        {user && (
          <View style={styles.statsContainer}>
            {isFarmer ? (
              <>
                <View style={styles.statItem}>
                  <AppText variant="h2" weight="bold" color={colors.text.primary}>
                    {productsCount}
                  </AppText>
                  <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
                    Products
                  </AppText>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <AppText variant="h2" weight="bold" color={colors.text.primary}>
                    {crops.length}
                  </AppText>
                  <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
                    Active Crops
                  </AppText>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <AppText variant="h2" weight="bold" color={colors.text.primary}>
                    {statsData?.total_orders ?? farmerProfile?.total_sales ?? 0}
                  </AppText>
                  <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
                    Total Orders
                  </AppText>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statItem}>
                  <AppText variant="h2" weight="bold" color={colors.text.primary}>
                    {statsData?.total_orders ?? ordersData.length}
                  </AppText>
                  <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
                    Total Orders
                  </AppText>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <AppText variant="h2" weight="bold" color={colors.brand.primary}>
                    {statsData?.pending_orders ?? 0}
                  </AppText>
                  <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
                    Active Orders
                  </AppText>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <AppText variant="h2" weight="bold" color={colors.text.primary}>
                    {formatCurrency(statsData?.total_revenue ?? 0)}
                  </AppText>
                  <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
                    Total Spent
                  </AppText>
                </View>
              </>
            )}
          </View>
        )}

        {/* 4. FARMER: LIVE ACTIVE CROPS SECTION */}
        {isFarmer && (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText variant="h3" weight="bold" color={colors.text.primary}>
                  My Crops in Soil
                </AppText>
                {crops.length > 0 && <AppBadge label={`${crops.length}`} variant="brand" size="xs" />}
              </View>

              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/farmer-crops' as any)}
                activeOpacity={0.7}
              >
                <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                  Crops Hub
                </AppText>
                <ArrowRight size={13} color={colors.brand.primary} strokeWidth={2.4} style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>

            {loadingCrops ? (
              <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginVertical: spacing.md }} />
            ) : crops.length > 0 ? (
              <View style={styles.cropsList}>
                {crops.slice(0, 3).map((crop) => (
                  <FarmketCropRowCard
                    key={crop.id}
                    id={crop.id}
                    name={crop.crop_name || crop.product_details?.name || 'Seasonal Produce'}
                    stage={formatCropStage(crop.stage)}
                    expectedDate={formatDate(crop.expected_harvest_date)}
                    onPress={() => router.push('/farmer-crops' as any)}
                  />
                ))}
              </View>
            ) : (
              <AppCard variant="default" padding="md" style={styles.emptyCard}>
                <Sprout size={24} color={colors.brand.primary} style={{ marginBottom: 4 }} />
                <AppText variant="caption" color={colors.text.muted} align="center">
                  No crops currently tracked. Start tracking your harvests in Crops Hub!
                </AppText>
              </AppCard>
            )}
          </View>
        )}

        {/* 5. FARMER: DIRECT PUBLIC STOREFRONT BANNER */}
        {isFarmer && user && (
          <View style={styles.contentSection}>
            <TouchableOpacity
              style={styles.storefrontBanner}
              onPress={() => router.push(`/farmer/${user.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={styles.storefrontLeft}>
                <View style={styles.storefrontIconWrap}>
                  <Store size={22} color="#FFFFFF" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <AppText variant="bodySmall" weight="bold" color="#FFFFFF">
                    View Public Farm Storefront
                  </AppText>
                  <AppText variant="caption" color="rgba(255,255,255,0.82)">
                    See how buyers view {farmTitle}
                  </AppText>
                </View>
              </View>
              <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        )}

        {/* 6. BUYER: RECENT ORDERS SECTION */}
        {!isFarmer && user && (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeaderRow}>
              <AppText variant="h3" weight="bold" color={colors.text.primary}>
                Recent Orders
              </AppText>
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/(tabs)/orders')}
                activeOpacity={0.7}
              >
                <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                  View All Orders
                </AppText>
                <ArrowRight size={13} color={colors.brand.primary} strokeWidth={2.4} style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>

            {loadingOrders ? (
              <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginVertical: spacing.md }} />
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <AppCard key={order.id} variant="default" padding="md" style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View style={styles.orderCardLeft}>
                      <Package size={16} color={colors.brand.primary} />
                      <AppText variant="caption" weight="bold" style={{ marginLeft: 6 }}>
                        Order #{order.id}
                      </AppText>
                    </View>
                    <AppBadge
                      label={order.status.toUpperCase()}
                      variant={
                        order.status === 'delivered'
                          ? 'success'
                          : order.status === 'cancelled'
                          ? 'danger'
                          : 'warning'
                      }
                      size="xs"
                    />
                  </View>

                  <View style={styles.orderCardBody}>
                    <AppText variant="label" color={colors.text.muted}>
                      {formatDate(order.created_at)} • {order.items?.length || 1} items
                    </AppText>
                    <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                      {formatCurrency(order.total_amount)}
                    </AppText>
                  </View>
                </AppCard>
              ))
            ) : (
              <AppCard variant="default" padding="md" style={styles.emptyCard}>
                <ShoppingBag size={24} color={colors.brand.primary} style={{ marginBottom: 4 }} />
                <AppText variant="caption" color={colors.text.muted} align="center">
                  No orders placed yet. Explore fresh produce from local farms!
                </AppText>
              </AppCard>
            )}
          </View>
        )}

        {/* 7. ACCOUNT MANAGEMENT & SECURITY SHORTCUTS */}
        {user && (
          <View style={styles.contentSection}>
            <AppText variant="h3" weight="bold" color={colors.text.primary} style={styles.sectionTitle}>
              Account & Security
            </AppText>

            <AppCard variant="default" padding={0} borderRadius={radii.xl} style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowPasswordModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#F0F9FF' }]}>
                    <Lock size={17} color="#0284C7" />
                  </View>
                  <AppText variant="bodySmall" weight="semibold">
                    Change Password
                  </AppText>
                </View>
                <ChevronRight size={18} color={colors.text.muted} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSecurityMenuPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                    <ShieldCheck size={17} color="#15803D" />
                  </View>
                  <AppText variant="bodySmall" weight="semibold">
                    Security & Active Sessions
                  </AppText>
                </View>
                <ChevronRight size={18} color={colors.text.muted} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogoutAll}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <LogOut size={17} color="#D97706" />
                  </View>
                  <AppText variant="bodySmall" weight="semibold">
                    Log Out of All Devices
                  </AppText>
                </View>
                <ChevronRight size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </AppCard>

            {/* Main Log Out Button */}
            <AppButton
              title="Log Out"
              variant="danger"
              shape="pill"
              fullWidth
              leftIcon={<LogOut size={16} color="#FFFFFF" />}
              onPress={handleLogout}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h2" weight="bold">
                Change Password
              </AppText>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <AppText variant="caption" color={colors.text.muted} weight="bold">
                  Cancel
                </AppText>
              </TouchableOpacity>
            </View>

            <AppInput
              label="Current Password"
              placeholder="••••••••"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              style={{ marginBottom: spacing.md }}
            />

            <AppInput
              label="New Password (min 8 chars)"
              placeholder="••••••••"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={{ marginBottom: spacing.md }}
            />

            <AppInput
              label="Confirm New Password"
              placeholder="••••••••"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{ marginBottom: spacing.lg }}
            />

            <AppButton
              title="Update Password"
              variant="primary"
              fullWidth
              shape="pill"
              loading={changingPass}
              onPress={handleChangePasswordSubmit}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bannerContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#BAE6FD',
  },
  floatingNav: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTagWrap: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
    ...shadows.xs,
  },
  profileHeaderSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: -42,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  avatarInitialWrap: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeWrap: {
    position: 'absolute',
    bottom: -4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
  },
  verifiedIconWrap: {
    marginLeft: 2,
  },
  email: {
    marginTop: 2,
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  unverifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  loginBtn: {
    marginTop: spacing.md,
    width: '100%',
  },
  // Statistics Row
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#F8F9F5',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#EAECE7',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EAECE7',
  },
  // Sections
  contentSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropsList: {
    gap: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: '#F8F9F5',
    borderColor: '#EAECE7',
  },
  storefrontBanner: {
    backgroundColor: colors.brand.forest,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  storefrontLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storefrontIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Order Card
  orderCard: {
    marginBottom: spacing.sm,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Menu List
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F3EE',
    marginLeft: 56,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
});
