import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard, AppHeader } from '../../components/ui';
import { colors, spacing } from '../../theme';
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
      Alert.alert('Required', 'Please paste the reset token/code from your email.');
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
      <AppHeader title="Set New Password" showBack />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="heading" weight="bold" style={styles.title}>
            {success ? 'Password Reset!' : 'Create New Password'}
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            {success
              ? 'Your password has been changed. You can now log in with your updated credentials.'
              : 'Enter the reset code sent to your email and your new password.'}
          </AppText>
        </View>

        <AppCard padding="xl" elevated>
          {success ? (
            <View style={styles.successContainer}>
              <CheckCircle2 size={48} color={colors.status.success} style={{ marginBottom: spacing.md }} />
              <AppText variant="subheading" weight="semibold" color={colors.status.success} style={styles.successTitle}>
                Success
              </AppText>
              <AppText variant="body" color={colors.text.secondary} align="center" style={styles.successSubtitle}>
                All previous sessions have been signed out for security.
              </AppText>
              <AppButton
                title="Sign In with New Password"
                onPress={() => router.replace('/(auth)/login')}
                fullWidth
              />
            </View>
          ) : (
            <>
              <AppInput
                label="Reset Code / Token"
                placeholder="Paste token from email"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                leftIcon={<KeyRound size={20} color={colors.text.muted} />}
              />

              <AppInput
                label="New Password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                leftIcon={<Lock size={20} color={colors.text.muted} />}
              />

              <AppInput
                label="Confirm New Password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon={<Lock size={20} color={colors.text.muted} />}
              />

              <AppButton
                title="Update Password"
                onPress={handleReset}
                loading={loading}
                fullWidth
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successTitle: {
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    marginBottom: spacing.xl,
  },
});
