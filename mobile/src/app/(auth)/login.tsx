import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // TODO: Implement actual login via context/api
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to tabs after successful login
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xxxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="display" weight="bold" color={colors.brand.primary} style={styles.brandText}>
            Farmket
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Welcome back! Please enter your details.
          </AppText>
        </View>

        <AppCard padding="xl" elevated>
          <AppInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.text.muted} />}
          />
          
          <AppInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.text.muted} />}
          />

          <View style={styles.forgotPassword}>
            <Link href="/(auth)/forgot-password" asChild>
              <AppText variant="small" weight="medium" color={colors.brand.primary}>
                Forgot Password?
              </AppText>
            </Link>
          </View>

          <AppButton 
            title="Sign In" 
            onPress={handleLogin} 
            loading={loading}
            fullWidth 
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <AppText variant="small" color={colors.text.secondary}>
              Don't have an account?{' '}
            </AppText>
            <Link href="/(auth)/register" asChild>
              <AppText variant="small" weight="semibold" color={colors.brand.primary}>
                Sign up
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
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  brandText: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
