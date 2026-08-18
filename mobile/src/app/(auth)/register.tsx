import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard, AppHeader } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { User, Mail, Lock, Phone } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'farmer'>('buyer');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const username = email.split('@')[0];
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        password,
        confirm_password: confirmPassword,
        user_type: userType,
        username,
        gender: '', // matching web implementation
      };

      const response = await apiClient.post('accounts/register/', payload);
      await login(response.data.token, response.data.refresh_token);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
        // Just extract the first error message
        const firstKey = Object.keys(err.response.data)[0];
        const msg = Array.isArray(err.response.data[firstKey]) 
          ? err.response.data[firstKey][0] 
          : err.response.data[firstKey];
        setError(typeof msg === 'string' ? msg : 'Registration failed');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Create Account" showBack />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="heading" weight="bold" style={styles.title}>
            Join Farmket Today
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Buy and sell directly with the agricultural community.
          </AppText>
        </View>

        <AppCard padding="xl" elevated>
          {error && (
            <View style={styles.errorContainer}>
              <AppText variant="small" color={colors.status.danger}>{error}</AppText>
            </View>
          )}

          <View style={styles.roleContainer}>
            <AppText variant="small" weight="bold" color={colors.text.secondary} style={styles.roleLabel}>I AM A...</AppText>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleButton, userType === 'buyer' && styles.roleButtonActive]}
                onPress={() => setUserType('buyer')}
              >
                <AppText weight="bold" color={userType === 'buyer' ? colors.brand.primary : colors.text.secondary}>Buyer</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, userType === 'farmer' && styles.roleButtonActive]}
                onPress={() => setUserType('farmer')}
              >
                <AppText weight="bold" color={userType === 'farmer' ? colors.brand.primary : colors.text.secondary}>Farmer</AppText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <AppInput
                label="First Name"
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.flexHalf}>
              <AppInput
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <AppInput
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.text.muted} />}
          />

          <AppInput
            label="Phone Number"
            placeholder="+91 9876543210"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={colors.text.muted} />}
          />
          
          <AppInput
            label="Password"
            placeholder="Create a secure password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.text.muted} />}
          />

          <AppInput
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.text.muted} />}
          />

          <AppButton 
            title="Sign Up" 
            onPress={handleRegister} 
            loading={loading}
            fullWidth 
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <AppText variant="small" color={colors.text.secondary}>
              Already have an account?{' '}
            </AppText>
            <Link href="/(auth)/login" asChild>
              <AppText variant="small" weight="semibold" color={colors.brand.primary}>
                Sign in
              </AppText>
            </Link>
          </View>
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flexHalf: {
    flex: 1,
  },
  roleContainer: {
    marginBottom: spacing.md,
  },
  roleLabel: {
    marginBottom: spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background.surface,
  },
  roleButtonActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.muted,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.status.dangerMuted,
    borderRadius: radii.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
