import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppBadge, AppEmptyState, AppCropCard, SegmentedControl } from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCrops, fetchReservations, approveReservation, rejectReservation, CropGrowth, CropReservation } from '../../api/crops';
import { useAuth } from '../../context/AuthContext';
import { StageUpdateModal } from '../../components/crops/StageUpdateModal';
import { formatDate } from '../../utils/format';
import { Sprout, CheckCircle2, XCircle, Plus, Package } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function FarmerCropsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'crops' | 'reservations'>('crops');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCropForStage, setSelectedCropForStage] = useState<CropGrowth | null>(null);

  // Fetch Crops
  const { data: cropsData, isLoading: loadingCrops, refetch: refetchCrops } = useQuery({
    queryKey: ['farmer-crops'],
    queryFn: () => fetchCrops(),
    enabled: !!user && user.user_type === 'farmer',
  });

  // Fetch Reservations
  const { data: reservations = [], isLoading: loadingReservations, refetch: refetchReservations } = useQuery({
    queryKey: ['farmer-reservations'],
    queryFn: fetchReservations,
    enabled: !!user && user.user_type === 'farmer' && activeTab === 'reservations',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCrops(), refetchReservations()]);
    setRefreshing(false);
  }, [refetchCrops, refetchReservations]);

  if (!user || user.user_type !== 'farmer') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Crop Lifecycle" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <AppCard variant="tinted" padding="xl" borderRadius={radii.xxl} style={{ alignItems: 'center', maxWidth: 340 }}>
            <Sprout size={48} color={colors.brand.primary} />
            <AppText variant="h2" weight="bold" align="center" style={{ marginTop: spacing.md }}>
              Producer Access Required
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary} align="center" style={{ marginTop: spacing.xs, marginBottom: spacing.xl, lineHeight: 20 }}>
              This crop management hub is exclusively for registered Farmket producers.
            </AppText>
            <AppButton
              title="Return to Home"
              shape="pill"
              fullWidth
              onPress={() => router.replace('/(tabs)')}
            />
          </AppCard>
        </View>
      </View>
    );
  }

  const handleApproveReservation = async (id: number) => {
    try {
      await approveReservation(id);
      Alert.alert('Approved', 'Crop reservation confirmed.');
      refetchReservations();
      refetchCrops();
    } catch {
      Alert.alert('Error', 'Failed to approve reservation.');
    }
  };

  const handleRejectReservation = async (id: number) => {
    try {
      await rejectReservation(id);
      Alert.alert('Declined', 'Crop reservation has been declined.');
      refetchReservations();
      refetchCrops();
    } catch {
      Alert.alert('Error', 'Failed to reject reservation.');
    }
  };

  const crops = cropsData?.results || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title="Crop Lifecycle" 
        rightActions={
          <TouchableOpacity 
            style={styles.addCropBtn} 
            onPress={() => router.push('/crops/add' as any)}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
            <AppText variant="label" weight="bold" color="#FFFFFF" style={{ marginLeft: 4 }}>
              New Crop
            </AppText>
          </TouchableOpacity>
        }
      />

      {/* Segmented Control */}
      <View style={styles.tabsContainer}>
        <SegmentedControl
          tabs={[
            { id: 'crops', label: `Active Crops (${crops.length})` },
            { id: 'reservations', label: `Pre-Bookings (${reservations.length})` },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
        />
      </View>

      {/* Content */}
      {activeTab === 'crops' ? (
        loadingCrops && !refreshing ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : crops.length === 0 ? (
          <View style={styles.centerContent}>
            <AppEmptyState
              title="No Active Crops"
              description="You haven't logged any active crop cultivation cycles yet."
              icon={<Sprout size={48} color={colors.brand.muted} strokeWidth={1.5} />}
              actionTitle="Log Your First Crop"
              onAction={() => router.push('/crops/add' as any)}
            />
          </View>
        ) : (
          <FlatList
            data={crops}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
            }
            renderItem={({ item }) => (
              <AppCropCard
                crop={item}
                action={
                  <View style={styles.cropActionsRow}>
                    <View style={styles.reservationsBadge}>
                      <Package size={14} color={colors.brand.primary} />
                      <AppText variant="caption" weight="bold" color={colors.brand.primary} style={{ marginLeft: 4 }}>
                        {item.reservations?.length || 0} Reserved
                      </AppText>
                    </View>

                    <AppButton
                      title="Update Stage"
                      size="sm"
                      variant="primary"
                      shape="pill"
                      onPress={() => setSelectedCropForStage(item)}
                    />
                  </View>
                }
              />
            )}
          />
        )
      ) : (
        loadingReservations && !refreshing ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : reservations.length === 0 ? (
          <View style={styles.centerContent}>
            <AppEmptyState
              title="No Pre-Bookings Yet"
              description="When buyers pre-reserve upcoming harvest quotas, their requests will appear here."
              icon={<Package size={48} color={colors.brand.muted} strokeWidth={1.5} />}
            />
          </View>
        ) : (
          <FlatList
            data={reservations}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
            }
            renderItem={({ item }) => (
              <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={styles.reservationCard}>
                <View style={styles.resHeader}>
                  <View>
                    <AppText variant="bodySmall" weight="bold">{item.crop_name}</AppText>
                    <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 2 }}>
                      Buyer: <AppText variant="caption" weight="bold" color={colors.text.primary}>{item.buyer_name}</AppText>
                    </AppText>
                  </View>
                  <AppBadge status={item.reservation_status.toLowerCase()} size="xs" label={item.reservation_status} />
                </View>

                <View style={styles.resMeta}>
                  <AppText variant="caption" color={colors.text.muted}>
                    Requested: {item.quantity_reserved} kg • {formatDate(item.reserved_at)}
                  </AppText>
                </View>

                {item.reservation_status === 'PENDING' && (
                  <View style={styles.resActionsRow}>
                    <AppButton
                      title="Decline"
                      size="sm"
                      variant="outline"
                      shape="pill"
                      onPress={() => handleRejectReservation(item.id)}
                      style={{ flex: 1, marginRight: spacing.sm }}
                    />
                    <AppButton
                      title="Approve"
                      size="sm"
                      variant="primary"
                      shape="pill"
                      onPress={() => handleApproveReservation(item.id)}
                      style={{ flex: 1 }}
                    />
                  </View>
                )}
              </AppCard>
            )}
          />
        )
      )}

      {/* Stage Update Modal */}
      {selectedCropForStage && (
        <StageUpdateModal
          visible={!!selectedCropForStage}
          crop={selectedCropForStage}
          onClose={() => setSelectedCropForStage(null)}
          onSuccess={() => {
            refetchCrops();
            refetchReservations();
          }}
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
  addCropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    ...shadows.xs,
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
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.sm,
  },
  cropActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  reservationsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.tint,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  reservationCard: {
    backgroundColor: colors.background.surface,
    marginBottom: spacing.xs,
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xxs,
  },
  resMeta: {
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  resActionsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});
