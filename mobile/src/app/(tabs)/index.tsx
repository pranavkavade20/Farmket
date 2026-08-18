import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppCard, AppButton } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppText variant="headingLg" weight="bold" color={colors.brand.primary}>
            Farmket
          </AppText>
          <AppButton 
            title="Login" 
            variant="outline" 
            size="sm" 
            onPress={() => router.push('/(auth)/login')} 
          />
        </View>

        <AppText variant="subheading" weight="semibold" style={styles.sectionTitle}>
          Featured Products
        </AppText>
        
        <View style={styles.cardContainer}>
          <AppCard elevated style={styles.placeholderCard}>
            <AppText weight="medium">Product 1</AppText>
            <AppText variant="small" color={colors.text.secondary}>Loading data...</AppText>
          </AppCard>
          <AppCard elevated style={styles.placeholderCard}>
            <AppText weight="medium">Product 2</AppText>
            <AppText variant="small" color={colors.text.secondary}>Loading data...</AppText>
          </AppCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  cardContainer: {
    gap: spacing.md,
  },
  placeholderCard: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
