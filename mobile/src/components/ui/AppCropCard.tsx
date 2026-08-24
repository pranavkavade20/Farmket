import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { colors, spacing, radii } from '../../theme';
import type { CropGrowth } from '../../api/crops';

interface AppCropCardProps {
  crop: CropGrowth;
  onPress?: (crop: CropGrowth) => void;
}

export const AppCropCard: React.FC<AppCropCardProps> = ({ crop, onPress }) => {
  const content = (
    <AppCard elevated padding="md" style={styles.card}>
      <View style={styles.placeholderImage}>
        <Sprout size={32} color={colors.brand.muted} />
      </View>
      <View style={styles.info}>
        <AppText weight="bold" numberOfLines={1}>{crop.name}</AppText>
        <AppText variant="small" color={colors.text.secondary} numberOfLines={1}>
          By {crop.farmer?.farm_name || `${crop.farmer?.first_name} ${crop.farmer?.last_name}`}
        </AppText>
        <AppText variant="small" color={colors.status.warning} numberOfLines={1}>
          Status: {crop.status}
        </AppText>
      </View>
    </AppCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(crop)} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
});
