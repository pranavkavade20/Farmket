import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard, AppHeader } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { Lock, KeyRound, CheckCircle2 } from 'lucide-react-native';
import { resetPasswordApi } from '../../api/auth';
import { normalizeApiError } from '../../api/client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ token?: string }>();

  const [token, setToken] = useState(params.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!token.trim()) {
      Alert.alert('Required', 'Please paste the reset code or token from your email.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Password Too Short', 'Your new password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({
        token: token.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
    } catch (error) {
      const msg = normalizeApiError(error, 'Failed to reset password. The link or code may have expired.');
      Alert.alert('Reset Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="New Password" showBack />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + spacing.xxl }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="h1" weight="bold" style={styles.title}>
            {success ? 'All Done!' : 'Create New Password'}
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            {success
              ? 'Your password has been changed. You can now sign in with your updated credentials.'
              : 'Enter the reset code sent to your email and your desired new password.'}
          </AppText>
        </View>

        <AppCard variant="elevated" padding="xl" borderRadius={radii.xxl} style={styles.card}>
          {success ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <CheckCircle2 size={36} color={colors.status.success} />
              </View>
              <AppText variant="h2" weight="bold" color={colors.text.primary} style={styles.successTitle}>
                Password Reset Successfully
              </AppText>
              <AppText variant="bodySmall" color={colors.text.secondary} align="center" style={styles.successSubtitle}>
                All other active sessions have been safely terminated.
              </AppText>
              <AppButton
                title="Sign In with New Password"
                onPress={() => router.replace('/(auth)/login')}
                fullWidth
                shape="rounded"
              />
            </View>
          ) : (
            <>
              <AppInput
                label="RESET CODE / TOKEN"
                placeholder="Paste code from email"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                leftIcon={<KeyRound size={18} color={colors.text.muted} />}
              />

              <AppInput
                label="NEW PASSWORD"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.text.muted} />}
              />

              <AppInput
                label="CONFIRM NEW PASSWORD"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.text.muted} />}
              />

              <AppButton
                title="Update Password"
                onPress={handleReset}
                loading={loading}
                fullWidth
                shape="rounded"
                style={styles.submitButton}
              />
            </>
          )}
        </AppCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.background.surface,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.status.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
});
