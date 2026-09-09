import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { colors, spacing, radii, shadows } from '../../theme';
import {
  TomatoesIllustration,
  SpinachIllustration,
  CarrotsIllustration,
} from '../illustrations/ProduceIllustrations';
import { ChevronRight, Sprout } from 'lucide-react-native';

export interface FarmketCropRowCardProps {
  id: number | string;
  name: string;
  stage: 'Growing' | 'Harvest Ready' | 'Planted' | 'Harvested' | string;
  expectedDate?: string;
  imageUrl?: string | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const FarmketCropRowCard: React.FC<FarmketCropRowCardProps> = ({
  name,
  stage,
  expectedDate,
  imageUrl,
  onPress,
  style,
}) => {
  const normalizedName = name.toLowerCase();
  const isHarvestReady = stage.toLowerCase().includes('harvest') || stage.toLowerCase().includes('ready');

  const renderThumbnail = () => {
    if (imageUrl) {
      return (
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} contentFit="cover" transition={200} />
      );
    }
    if (normalizedName.includes('tomato')) {
      return <TomatoesIllustration size={44} />;
    }
    if (normalizedName.includes('spinach') || normalizedName.includes('palak') || normalizedName.includes('green')) {
      return <SpinachIllustration size={44} />;
    }
    if (normalizedName.includes('carrot')) {
      return <CarrotsIllustration size={44} />;
    }
    return (
      <View style={styles.placeholder}>
        <Sprout size={24} color={colors.brand.primary} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.thumbContainer}>
        {renderThumbnail()}
      </View>

      <View style={styles.infoCol}>
        <View style={styles.titleBadgeRow}>
          <AppText variant="body" weight="bold" color={colors.text.primary} numberOfLines={1} style={styles.title}>
            {name}
          </AppText>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isHarvestReady ? '#FEF3C7' : '#DCFCE7',
              },
            ]}
          >
            <AppText
              variant="label"
              weight="bold"
              color={isHarvestReady ? '#D97706' : '#15803D'}
            >
              {stage}
            </AppText>
          </View>
        </View>

        {expectedDate ? (
          <AppText variant="caption" color={colors.text.muted} style={styles.dateText}>
            Expected: {expectedDate}
          </AppText>
        ) : null}
      </View>

      <ChevronRight size={18} color={colors.text.muted} strokeWidth={2} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#EAECE7',
    ...shadows.xs,
  },
  thumbContainer: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: '#F8F9F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
  },
  placeholder: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  dateText: {
    marginTop: 3,
  },
});
