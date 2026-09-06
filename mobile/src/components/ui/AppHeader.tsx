import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';
import { AppText } from './AppText';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  rightActions?: React.ReactNode;
  transparent?: boolean;
}

export function AppHeader({ 
  title, 
  subtitle, 
  showBack = false, 
  onBack,
  rightElement,
  rightActions,
  transparent = false
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const effectiveRight = rightActions || rightElement;

  return (
    <View 
      style={[
        styles.header, 
        { paddingTop: insets.top },
        transparent ? styles.transparentHeader : styles.solidHeader
      ]}
    >
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton} 
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={colors.text.primary} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.titleContainer}>
          <AppText variant="h3" weight="bold" align="center" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color={colors.text.muted} align="center" numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>

        <View style={styles.rightContainer}>
          {effectiveRight}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    zIndex: 10,
  },
  solidHeader: {
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  transparentHeader: {
    backgroundColor: 'transparent',
  },
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  subtitle: {
    marginTop: 2,
  },
  rightContainer: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  }
});
