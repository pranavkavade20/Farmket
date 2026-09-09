import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, AppButton, FarmketCropRowCard } from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { FarmBannerSvg } from '../../components/illustrations/FarmBannerSvg';
import { FarmerAvatarSvg } from '../../components/illustrations/FarmerAvatarSvg';
import { useRequireAuth } from '../../components/auth/AuthGateModal';
import { getOrCreateConversation } from '../../api/chat';
import {
  ArrowLeft,
  MoreHorizontal,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CropItem {
  id: number;
  name: string;
  stage: 'Growing' | 'Harvest Ready' | 'Planted';
  expectedDate: string;
}

const DEFAULT_CROPS: CropItem[] = [
  {
    id: 1,
    name: 'Tomatoes',
    stage: 'Growing',
    expectedDate: '12 Sep 2026',
  },
  {
    id: 2,
    name: 'Spinach',
    stage: 'Harvest Ready',
    expectedDate: '02 Sep 2026',
  },
  {
    id: 3,
    name: 'Carrots',
    stage: 'Growing',
    expectedDate: '18 Sep 2026',
  },
];

export default function FarmerProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requireAuth, AuthGateModalComponent } = useRequireAuth();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(2400);

  const farmerName = 'Ramesh Farm';
  const subtitle = 'Organic • Sustainable • Local';
  const location = 'Pune, Maharashtra';
  const aboutText =
    'We are a family-owned farm growing fresh, organic produce using sustainable farming practices. Our goal is to bring healthy food directly from our farm to your table.';

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

  const handleMoreOptions = () => {
    Alert.alert(
      farmerName,
      'Select an action',
      [
        {
          text: 'Message Producer',
          onPress: async () => {
            if (!requireAuth('Chat with Farmer', 'Sign in to message this farmer directly.')) {
              return;
            }
            try {
              const conv = await getOrCreateConversation(Number(id) || 1);
              router.push(`/chat/${conv.id}` as any);
            } catch {
              router.push('/(tabs)/chat');
            }
          },
        },
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
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formattedFollowers = (followersCount / 1000).toFixed(1) + 'k';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
      >
        {/* 1. SCENIC FARM LANDSCAPE BANNER - Exact match for Screen 4 */}
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
            >
              <ArrowLeft size={20} color={colors.text.primary} strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCircleBtn}
              onPress={handleMoreOptions}
              activeOpacity={0.8}
            >
              <MoreHorizontal size={20} color={colors.text.primary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. OVERLAPPING FARMER AVATAR & IDENTITY */}
        <View style={styles.profileHeaderSection}>
          <View style={styles.avatarWrapper}>
            <FarmerAvatarSvg size={84} />
          </View>

          {/* Farm Name with Verified Badge */}
          <View style={styles.nameRow}>
            <AppText variant="h1" weight="bold" color={colors.text.primary} style={styles.name}>
              {farmerName}
            </AppText>
            <View style={styles.verifiedIconWrap}>
              <CheckCircle2 size={18} color="#15803D" fill="#DCFCE7" />
            </View>
          </View>

          {/* Subtitle / Farm Type */}
          <AppText variant="bodySmall" color={colors.text.secondary} style={styles.subtitle}>
            {subtitle}
          </AppText>

          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.brand.primary} />
            <AppText variant="caption" color={colors.text.muted} style={{ marginLeft: 4 }}>
              {location}
            </AppText>
          </View>

          {/* Follow CTA Button (Full width deep green) */}
          <AppButton
            title={isFollowing ? 'Following' : 'Follow'}
            variant={isFollowing ? 'outline' : 'forest'}
            size="md"
            shape="pill"
            fullWidth
            onPress={handleFollowToggle}
            style={styles.followBtn}
          />
        </View>

        {/* 3. STATISTICS ROW - Exact match for Screen 4 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <AppText variant="h2" weight="bold" color={colors.text.primary}>
              12
            </AppText>
            <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
              Products
            </AppText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <AppText variant="h2" weight="bold" color={colors.text.primary}>
              4.8
            </AppText>
            <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
              Rating
            </AppText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <AppText variant="h2" weight="bold" color={colors.text.primary}>
              {formattedFollowers}
            </AppText>
            <AppText variant="caption" color={colors.text.muted} style={styles.statLabel}>
              Followers
            </AppText>
          </View>
        </View>

        {/* 4. ABOUT SECTION - Exact match for Screen 4 */}
        <View style={styles.contentSection}>
          <AppText variant="h3" weight="bold" color={colors.text.primary} style={styles.sectionTitle}>
            About
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.aboutText}>
            {aboutText}
          </AppText>
        </View>

        {/* 5. CURRENT CROPS SECTION - Exact match for Screen 4 */}
        <View style={styles.contentSection}>
          <View style={styles.cropsHeaderRow}>
            <AppText variant="h3" weight="bold" color={colors.text.primary}>
              Current Crops
            </AppText>

            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.7}
            >
              <AppText variant="caption" weight="bold" color={colors.brand.primary}>
                View All
              </AppText>
              <ArrowRight size={13} color={colors.brand.primary} strokeWidth={2.4} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          {/* List of crop cards */}
          <View style={styles.cropsList}>
            {DEFAULT_CROPS.map((crop) => (
              <FarmketCropRowCard
                key={crop.id}
                id={crop.id}
                name={crop.name}
                stage={crop.stage}
                expectedDate={crop.expectedDate}
                onPress={() => router.push(`/product/1` as any)}
              />
            ))}
          </View>
        </View>
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
    ...shadows.sm,
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
  followBtn: {
    backgroundColor: colors.brand.forest,
    marginTop: spacing.xs,
    width: '100%',
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
  },
});
