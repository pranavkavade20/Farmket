import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  AlertButton,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  AppText,
  AppButton,
  FarmketCropRowCard,
  AppProductCard,
  AppCard,
  AppBadge,
} from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { FarmBannerSvg } from '../../components/illustrations/FarmBannerSvg';
import { FarmerAvatarSvg } from '../../components/illustrations/FarmerAvatarSvg';
import { useAuth } from '../../context/AuthContext';
import { useRequireAuth } from '../../components/auth/AuthGateModal';
import { fetchFarmerProfile } from '../../api/farmers';
import { fetchCrops } from '../../api/crops';
import { fetchProducts } from '../../api/products';
import { getOrCreateConversation } from '../../api/chat';
import { formatDate } from '../../utils/format';
import {
  ArrowLeft,
  MoreHorizontal,
  MapPin,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Sprout,
  Store,
  Settings,
  LogOut,
  ShieldCheck,
  Plus,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FarmerProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { requireAuth, AuthGateModalComponent } = useRequireAuth();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(2400);

  // Target farmer ID (fallback to current user if not provided)
  const targetId = id || user?.id || 1;

  // 1. Fetch live Farmer Profile from backend
  const { data: farmerProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['farmer-profile', targetId],
    queryFn: async () => {
      try {
        return await fetchFarmerProfile(targetId as string | number);
      } catch {
        // Fallback for demo ID or offline
        return {
          id: Number(targetId) || 21,
          user: {
            id: Number(targetId) || 2,
            username: 'ramesh_farmer',
            first_name: 'Ramesh',
            last_name: 'Patil',
            email: 'ramesh.patil@gmail.com',
            user_type: 'farmer',
            profile_picture: null,
            is_verified: true,
          },
          farm_name: 'Patil Organic Farms',
          farm_size: '12.50',
          location: 'Kolhapur, Maharashtra',
          organic_certified: true,
          description:
            'Organic sugarcane and seasonal vegetables farm. Dedicated to 100% natural, chemical-free sustainable farming for our local community.',
          rating: 4.8,
          total_sales: 120,
        };
      }
    },
    enabled: !!targetId,
  });

  const farmerUserId = farmerProfile?.user?.id || (Number(targetId) || 2);

  // 2. Fetch live crops for this farmer
  const { data: cropsData, isLoading: loadingCrops } = useQuery({
    queryKey: ['farmer-crops', farmerUserId],
    queryFn: () => fetchCrops({ pageParam: `crops/?farmer=${farmerUserId}` }),
    enabled: !!farmerUserId,
  });

  // 3. Fetch live products for this farmer
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['farmer-products', farmerUserId],
    queryFn: () => fetchProducts({ farmer: farmerUserId }),
    enabled: !!farmerUserId,
  });

  // RBAC checks
  const isFarmer = user?.user_type === 'farmer';
  const isOwnProfile = Boolean(
    user && farmerProfile && (user.id === farmerProfile.user?.id || (isFarmer && !id))
  );

  const farmerName = farmerProfile?.farm_name || farmerProfile?.user?.first_name 
    ? `${farmerProfile.user.first_name}'s Farm` 
    : 'Patil Organic Farms';

  const farmerOwnerName = farmerProfile?.user?.first_name 
    ? `${farmerProfile.user.first_name} ${farmerProfile.user.last_name || ''}`.trim()
    : 'Ramesh Patil';

  const subtitle = farmerProfile?.organic_certified
    ? 'Certified Organic • Sustainable • Local'
    : 'Local Sustainable Agriculture';

  const location = farmerProfile?.location || 'Kolhapur, Maharashtra';
  const aboutText =
    farmerProfile?.description ||
    'We are a family-owned farm growing fresh, organic produce using sustainable farming practices. Our goal is to bring healthy food directly from our farm to your table.';

  const rating = farmerProfile?.rating ? Number(farmerProfile.rating).toFixed(1) : '4.8';
  const productsCount = productsData?.count || productsData?.results?.length || (farmerProfile ? 6 : 12);
  const formattedFollowers = (followersCount / 1000).toFixed(1) + 'k';

  const handleFollowToggle = () => {
    if (!requireAuth('Follow Farmer', 'Sign in to follow farmers and get early harvest alerts.')) {
      return;
    }
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    }
  };

  const handleMessage = async () => {
    if (!requireAuth('Chat with Farmer', 'Sign in to message this farmer directly.')) {
      return;
    }
    try {
      const conv = await getOrCreateConversation(farmerUserId);
      router.push(`/chat/${conv.id}` as any);
    } catch {
      router.push('/(tabs)/chat');
    }
  };

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

  const handleMoreOptions = () => {
    const options: AlertButton[] = [
      {
        text: 'Share Profile',
        onPress: async () => {
          try {
            await Share.share({
              message: `Discover fresh organic produce from ${farmerName} on Farmket!`,
            });
          } catch {
            // Dismissed
          }
        },
      },
    ];

    if (!isOwnProfile) {
      options.unshift({
        text: 'Message Producer',
        onPress: () => {
          handleMessage();
        },
      });
    } else {
      options.push({
        text: 'Account Settings',
        onPress: () => {
          router.push('/(tabs)/profile');
        },
      });
      options.push({
        text: 'Log Out',
        onPress: () => {
          handleLogout();
        },
      });
    }

    options.push({
      text: 'Cancel',
      style: 'cancel',
    });

    Alert.alert(farmerName, 'Select an action', options);
  };

  // Convert API crop growth stage to display text
  const formatCropStage = (stage: string): 'Growing' | 'Harvest Ready' | 'Planted' => {
    if (stage === 'NEAR_HARVEST' || stage === 'HARVESTED') return 'Harvest Ready';
    if (stage === 'PLANTED') return 'Planted';
    return 'Growing';
  };

  const crops = cropsData?.results || [];
  const products = productsData?.results || [];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
      >
        {/* 1. SCENIC FARM LANDSCAPE BANNER */}
        <View style={styles.bannerContainer}>
          <FarmBannerSvg
            width={SCREEN_WIDTH}
            height={190}
            variant="profileHeader"
          />

          {/* Floating Top Nav Buttons */}
          <View style={[styles.floatingNav, { top: insets.top + spacing.xs }]}>
            <TouchableOpacity
              style={styles.navCircleBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={colors.text.primary} strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCircleBtn}
              onPress={handleMoreOptions}
              activeOpacity={0.8}
              accessibilityLabel="More options"
            >
              <MoreHorizontal size={20} color={colors.text.primary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. OVERLAPPING FARMER AVATAR & IDENTITY */}
        <View style={styles.profileHeaderSection}>
          <View style={styles.avatarWrapper}>
            {farmerProfile?.user?.profile_picture ? (
              <Image
                source={{ uri: farmerProfile.user.profile_picture }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <FarmerAvatarSvg size={84} />
            )}
          </View>

          {/* Farm Name with Verified Badge */}
          <View style={styles.nameRow}>
            <AppText variant="h1" weight="bold" color={colors.text.primary} style={styles.name}>
              {farmerName}
            </AppText>
            {farmerProfile?.user?.is_verified && (
              <View style={styles.verifiedIconWrap}>
                <CheckCircle2 size={18} color="#15803D" fill="#DCFCE7" />
              </View>
            )}
          </View>

          {/* Farmer Owner Subtitle */}
          <AppText variant="caption" weight="medium" color={colors.text.muted} style={{ marginTop: 2 }}>
            Operated by {farmerOwnerName}
          </AppText>

          {/* Subtitle / Farm Certification */}
          <AppText variant="bodySmall" color={colors.brand.primary} weight="semibold" style={styles.subtitle}>
            {subtitle}
          </AppText>

          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.brand.primary} />
            <AppText variant="caption" color={colors.text.muted} style={{ marginLeft: 4 }}>
              {location}
              {farmerProfile?.farm_size ? ` • ${farmerProfile.farm_size} acres` : ''}
            </AppText>
          </View>

          {/* RBAC Action Button Row */}
          {isOwnProfile ? (
            <View style={styles.ownActionsRow}>
              <AppButton
                title="Manage Crops Hub"
                variant="forest"
                size="md"
                shape="pill"
                leftIcon={<Sprout size={16} color="#FFFFFF" strokeWidth={2.4} />}
                onPress={() => router.push('/farmer-crops' as any)}
                style={styles.manageBtn}
              />
              <TouchableOpacity
                style={styles.settingsIconBtn}
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.8}
              >
                <Settings size={18} color={colors.text.primary} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buyerActionRow}>
              <AppButton
                title={isFollowing ? 'Following' : 'Follow'}
                variant={isFollowing ? 'outline' : 'forest'}
                size="md"
                shape="pill"
                onPress={handleFollowToggle}
                style={styles.followBtn}
              />
              <AppButton
                title="Message"
                variant="outline"
                size="md"
                shape="pill"
                leftIcon={<MessageSquare size={16} color={colors.brand.primary} strokeWidth={2.2} />}
                onPress={handleMessage}
                style={styles.messageBtn}
              />
            </View>
          )}
        </View>

        {/* 3. STATISTICS ROW - Live Data */}
        <View style={styles.statsContainer}>
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
              {rating}
            </AppText>
            <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
              Rating
            </AppText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <AppText variant="h2" weight="bold" color={colors.text.primary}>
              {farmerProfile?.total_sales ? `${farmerProfile.total_sales}+` : formattedFollowers}
            </AppText>
            <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
              {farmerProfile?.total_sales ? 'Sales' : 'Followers'}
            </AppText>
          </View>
        </View>

        {/* 4. ABOUT SECTION */}
        <View style={styles.contentSection}>
          <AppText variant="h3" weight="bold" color={colors.text.primary} style={styles.sectionTitle}>
            About the Farm
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.aboutText}>
            {aboutText}
          </AppText>
        </View>

        {/* 5. CURRENT CROPS SECTION - Live from backend */}
        <View style={styles.contentSection}>
          <View style={styles.cropsHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText variant="h3" weight="bold" color={colors.text.primary}>
                Current Crops
              </AppText>
              {crops.length > 0 && (
                <AppBadge label={`${crops.length}`} variant="brand" size="xs" />
              )}
            </View>

            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => (isOwnProfile ? router.push('/farmer-crops' as any) : router.push('/(tabs)/search'))}
              activeOpacity={0.7}
            >
              <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                {isOwnProfile ? 'Manage Hub' : 'View All'}
              </AppText>
              <ArrowRight size={13} color={colors.brand.primary} strokeWidth={2.4} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          {/* List of crop cards */}
          {loadingCrops ? (
            <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginVertical: spacing.md }} />
          ) : crops.length > 0 ? (
            <View style={styles.cropsList}>
              {crops.map((crop) => (
                <FarmketCropRowCard
                  key={crop.id}
                  id={crop.id}
                  name={crop.crop_name || crop.product_details?.name || 'Seasonal Crop'}
                  stage={formatCropStage(crop.stage)}
                  expectedDate={formatDate(crop.expected_harvest_date)}
                  onPress={() => {
                    if (crop.product) {
                      router.push(`/product/${crop.product}` as any);
                    } else if (isOwnProfile) {
                      router.push('/farmer-crops' as any);
                    }
                  }}
                />
              ))}
            </View>
          ) : (
            <AppCard variant="default" padding="md" style={styles.emptyCard}>
              <Sprout size={24} color={colors.brand.primary} style={{ marginBottom: 4 }} />
              <AppText variant="caption" color={colors.text.muted} align="center">
                {isOwnProfile ? 'No crops currently planted. Add tracking from Crops Hub!' : 'No crops currently planted by this producer.'}
              </AppText>
            </AppCard>
          )}
        </View>

        {/* 6. FARM PRODUCE SECTION - Live from backend */}
        {products.length > 0 && (
          <View style={styles.contentSection}>
            <View style={styles.cropsHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText variant="h3" weight="bold" color={colors.text.primary}>
                  Farm Produce
                </AppText>
                <AppBadge label={`${products.length}`} variant="neutral" size="xs" />
              </View>

              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/(tabs)/search')}
                activeOpacity={0.7}
              >
                <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                  Marketplace
                </AppText>
                <ArrowRight size={13} color={colors.brand.primary} strokeWidth={2.4} style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: spacing.xs }}>
              {products.map((prod) => (
                <View key={prod.id} style={{ marginRight: spacing.md, width: 170 }}>
                  <AppProductCard
                    product={prod}
                    layout="vertical"
                    onPress={() => router.push(`/product/${prod.id}` as any)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 7. IF OWN PROFILE: ACCOUNT & LOGOUT ACTIONS */}
        {isOwnProfile && (
          <View style={styles.contentSection}>
            <AppText variant="h3" weight="bold" color={colors.text.primary} style={styles.sectionTitle}>
              Farmer Account Actions
            </AppText>
            <View style={styles.accountActionBtns}>
              <AppButton
                title="Manage Account Settings"
                variant="outline"
                shape="pill"
                fullWidth
                leftIcon={<Settings size={16} color={colors.text.primary} />}
                onPress={() => router.push('/(tabs)/profile')}
                style={{ marginBottom: spacing.sm }}
              />
              <AppButton
                title="Log Out"
                variant="danger"
                shape="pill"
                fullWidth
                leftIcon={<LogOut size={16} color="#FFFFFF" />}
                onPress={handleLogout}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Authentication Gate Modal */}
      {AuthGateModalComponent}
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
    height: 190,
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
  navCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  // Overlapping Profile Header
  profileHeaderSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: -44,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
  },
  verifiedIconWrap: {
    marginLeft: 2,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  ownActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  manageBtn: {
    flex: 1,
    backgroundColor: colors.brand.forest,
  },
  settingsIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9F5',
    borderWidth: 1,
    borderColor: '#EAECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  followBtn: {
    flex: 1,
    backgroundColor: colors.brand.forest,
  },
  messageBtn: {
    flex: 1,
  },
  // Statistics Row
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
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
  // Content Sections
  contentSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  aboutText: {
    lineHeight: 22,
    fontSize: 14,
  },
  cropsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropsList: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: '#F8F9F5',
    borderColor: '#EAECE7',
  },
  accountActionBtns: {
    marginTop: spacing.xs,
  },
});
