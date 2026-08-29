import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppText, AppCard, AppButton, AppBadge, AppEmptyState, AppCropCard } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCrops, fetchReservations, approveReservation, rejectReservation, CropGrowth, CropReservation } from '../../api/crops';
import { useAuth } from '../../context/AuthContext';
import { StageUpdateModal } from '../../components/crops/StageUpdateModal';
import { formatDate } from '../../utils/format';
import { Sprout, CheckCircle2, XCircle, ArrowUpRight, Plus, Package } from 'lucide-react-native';

export default function FarmerCropsScreen() {
  const insets = useSafeAreaInsets();
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

  if (!user || user.user_type !== 'farmer') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Farmer Crops Hub" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Sprout size={56} color={colors.brand.primary} />
          <AppText variant="heading" weight="bold" style={{ marginTop: spacing.md, textAlign: 'center' }}>
            Farmer Access Required
          </AppText>
          <AppText color={colors.text.secondary} style={{ textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl }}>
            This crop management hub is exclusively for registered Farmket producers.
          </AppText>
        </View>
      </View>
    );
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCrops(), refetchReservations()]);
    setRefreshing(false);
  }, [refetchCrops, refetchReservations]);

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
      Alert.alert('Rejected', 'Crop reservation has been declined.');
      refetchReservations();
      refetchCrops();
    } catch {
      Alert.alert('Error', 'Failed to reject reservation.');
    }
  };

  const crops = cropsData?.results || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Crop Lifecycle" />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'crops' && styles.tabActive]}
          onPress={() => setActiveTab('crops')}
        >
          <AppText weight="bold" color={activeTab === 'crops' ? colors.brand.primary : colors.text.secondary}>
            Active Crops ({crops.length})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reservations' && styles.tabActive]}
          onPress={() => setActiveTab('reservations')}
        >
          <AppText weight="bold" color={activeTab === 'reservations' ? colors.brand.primary : colors.text.secondary}>
            Reservations ({reservations.length})
          </AppText>
        </TouchableOpacity>
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
              description="You don't have any crops in a growth tracking cycle."
              icon={<Sprout size={48} color={colors.brand.muted} strokeWidth={1.5} />}
            />
          </View>
        ) : (
          <FlatList
            data={crops}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
            }
            renderItem={({ item }) => (
              <AppCropCard
                crop={item}
                action={
                  <View style={styles.cropActionsRow}>
                    <View style={styles.reservationsBadge}>
                      <Package size={14} color={colors.text.secondary} />
                      <AppText variant="small" weight="bold" color={colors.text.secondary} style={{ marginLeft: 4 }}>
                        {item.reservations?.length || 0} Reserved
                      </AppText>
                    </View>

                    <AppButton
                      title="Update Stage"
                      size="sm"
                      variant="primary"
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
              title="No Reservations"
              description="No buyer pre-booking requests are pending."
              icon={<Package size={48} color={colors.brand.muted} strokeWidth={1.5} />}
            />
          </View>
        ) : (
          <FlatList
            data={reservations}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
            }
            renderItem={({ item }) => (
              <AppCard elevated padding="md" style={styles.reservationCard}>
                <View style={styles.resHeader}>
                  <View>
                    <AppText weight="bold" style={{ fontSize: 16 }}>{item.crop_name}</AppText>
                    <AppText variant="small" color={colors.text.secondary}>
                      Buyer: <AppText variant="small" weight="bold">{item.buyer_name}</AppText>
                    </AppText>
                  </View>
                  <AppBadge status={item.reservation_status.toLowerCase()} size="sm" label={item.reservation_status} />
                </View>

                <View style={styles.resMeta}>
                  <AppText variant="small" color={colors.text.muted}>
                    Requested: {item.quantity_reserved} kg • {formatDate(item.reserved_at)}
                  </AppText>
                </View>

                {item.reservation_status === 'PENDING' && (
                  <View style={styles.resActionsRow}>
                    <AppButton
                      title="Reject"
                      size="sm"
                      variant="outline"
                      onPress={() => handleRejectReservation(item.id)}
                      style={{ flex: 1, marginRight: spacing.sm }}
                    />
                    <AppButton
                      title="Approve"
                      size="sm"
                      variant="primary"
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.brand.primary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
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
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  reservationCard: {
    marginBottom: spacing.md,
    borderRadius: radii.xl,
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
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
