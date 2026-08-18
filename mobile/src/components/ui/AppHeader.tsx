import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { AppText } from './AppText';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function AppHeader({ 
  title, 
  showBack = false, 
  onBack,
  rightElement 
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

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.leftContainer} hitSlop={10}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.leftContainer} />
        )}

        <View style={styles.titleContainer}>
          <AppText variant="subheading" weight="semibold" align="center" numberOfLines={1}>
            {title}
          </AppText>
        </View>

        <View style={styles.rightContainer}>
          {rightElement}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  }
});
