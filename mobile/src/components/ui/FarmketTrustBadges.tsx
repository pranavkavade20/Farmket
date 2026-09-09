import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radii } from '../../theme';
import { Leaf, Sprout, ShieldCheck } from 'lucide-react-native';

interface FarmketTrustBadgesProps {
  style?: StyleProp<ViewStyle>;
  isOrganic?: boolean;
}

export const FarmketTrustBadges: React.FC<FarmketTrustBadgesProps> = ({
  style,
  isOrganic = true,
}) => {
  const badges = [
    {
      id: 'organic',
      label: isOrganic ? '100% Organic' : 'Pesticide Safe',
      icon: <Leaf size={16} color={colors.brand.primary} strokeWidth={2.2} />,
    },
    {
      id: 'fresh',
      label: 'Farm Fresh',
      icon: <Sprout size={16} color={colors.brand.primary} strokeWidth={2.2} />,
    },
    {
      id: 'traceable',
      label: 'Traceable',
      icon: <ShieldCheck size={16} color={colors.brand.primary} strokeWidth={2.2} />,
    },
  ];

  return (
    <View style={[styles.container, style]}>
      {badges.map((badge) => (
        <View key={badge.id} style={styles.badgeItem}>
          <View style={styles.iconCircle}>{badge.icon}</View>
          <AppText variant="caption" weight="medium" color={colors.text.primary} style={styles.label}>
            {badge.label}
          </AppText>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badgeItem: {
    flex: 1,
    backgroundColor: '#F8F9F5',
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAECE7',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
