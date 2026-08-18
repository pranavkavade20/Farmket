import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { AppHeader, AppText, AppCard, AppButton } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard elevated padding="xl" style={styles.card}>
          {user?.profile_picture ? (
            <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          
          <AppText variant="heading" weight="semibold" style={styles.name}>
            {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.email}>
            {user ? user.email : 'Sign in to manage your account'}
          </AppText>
          
          {user ? (
            <AppButton 
              title="Log Out" 
              variant="secondary"
              fullWidth 
              onPress={logout}
              style={styles.loginBtn}
            />
          ) : (
            <AppButton 
              title="Log In" 
              fullWidth 
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginBtn}
            />
          )}
        </AppCard>
        
        <AppCard style={styles.menuCard}>
          <AppText weight="medium">Settings</AppText>
        </AppCard>
        <AppCard style={styles.menuCard}>
          <AppText weight="medium">Help & Support</AppText>
        </AppCard>
        <AppCard style={styles.menuCard}>
          <AppText weight="medium">About Farmket</AppText>
        </AppCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  name: {
    marginBottom: spacing.xxs,
  },
  email: {
    marginBottom: spacing.xl,
  },
  loginBtn: {
    marginTop: spacing.md,
  },
  menuCard: {
    paddingVertical: spacing.lg,
  }
});
