import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AppText, AppButton, AppCard, AppBadge } from '../ui';
import { colors, spacing, radii } from '../../theme';
import { updateCropStage, CropGrowth, CropStageType } from '../../api/crops';
import { X, Sprout, Check } from 'lucide-react-native';

interface StageUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  crop: CropGrowth;
  onSuccess: () => void;
}

export const StageUpdateModal: React.FC<StageUpdateModalProps> = ({
  visible,
  onClose,
  crop,
  onSuccess,
}) => {
  const [selectedStage, setSelectedStage] = useState<CropStageType>(crop.stage);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const stages: { stage: CropStageType; label: string; desc: string }[] = [
    { stage: 'PLANTED', label: 'Planted', desc: 'Seeds sown, germination in progress (25%)' },
    { stage: 'GROWING', label: 'Growing', desc: 'Vegetative growth & pest management (50%)' },
    { stage: 'NEAR_HARVEST', label: 'Near Harvest', desc: 'Maturing crops, pre-booking open (75%)' },
    { stage: 'HARVESTED', label: 'Harvested', desc: 'Harvest complete, ready for fulfillment (100%)' },
  ];

  const handleUpdate = async () => {
    if (selectedStage === crop.stage) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await updateCropStage(crop.id, {
        stage: selectedStage,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Stage Updated! 🌾', `Crop stage has been changed to ${selectedStage}. Followers and reserved buyers have been notified.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to update crop stage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Sprout size={20} color={colors.brand.primary} style={{ marginRight: 8 }} />
              <AppText variant="subheading" weight="bold">Update Crop Stage</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <AppText weight="bold" style={styles.cropTitle}>
              {crop.crop_name || crop.product_details?.name || 'Crop'}
            </AppText>
            <AppText variant="small" color={colors.text.secondary} style={{ marginBottom: spacing.lg }}>
              Current Stage: <AppBadge stage={crop.stage} size="sm" label="" />
            </AppText>

            {/* Stages Selection */}
            <View style={styles.stagesList}>
              {stages.map((st) => {
                const isSelected = selectedStage === st.stage;
                return (
                  <TouchableOpacity
                    key={st.stage}
                    style={[styles.stageItem, isSelected && styles.stageItemActive]}
                    onPress={() => setSelectedStage(st.stage)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppBadge stage={st.stage} size="sm" label="" />
                        <AppText weight="bold" style={{ marginLeft: 8 }}>{st.label}</AppText>
                      </View>
                      <AppText variant="small" color={colors.text.secondary} style={{ marginTop: 2 }}>
                        {st.desc}
                      </AppText>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Remarks Input */}
            <View style={styles.inputSection}>
              <AppText variant="small" weight="bold" color={colors.text.secondary} style={styles.inputLabel}>
                REMARKS / PROGRESS NOTES (OPTIONAL)
              </AppText>
              <TextInput
                placeholder="e.g. Irrigation completed, flowering started..."
                placeholderTextColor={colors.text.muted}
                value={remarks}
                onChangeText={setRemarks}
                style={styles.remarksInput}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <AppButton
              title={loading ? 'Updating...' : 'Save Stage Update'}
              onPress={handleUpdate}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    maxHeight: '90%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  closeBtn: {
    padding: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.background.elevated,
  },
  content: {
    padding: spacing.xl,
  },
  cropTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  stagesList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  stageItemActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.muted + '40',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  inputSection: {
    marginTop: spacing.xs,
  },
  inputLabel: {
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  remarksInput: {
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 60,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
