import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, AppButton, AppCard } from '../ui';
import { colors, spacing, radii } from '../../theme';
import { Lock, LogIn, UserPlus, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

interface AuthGateModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  visible,
  onClose,
  title = 'Sign In to Continue',
  description = 'You need a Farmket account to perform this action and interact directly with farmers.',
}) => {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    onClose();
    router.push('/(auth)/register');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <AppCard elevated padding="xl" style={styles.modalCard}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color={colors.text.muted} />
              </TouchableOpacity>

              <View style={styles.iconCircle}>
                <Lock size={28} color={colors.brand.primary} />
              </View>

              <AppText variant="heading" weight="bold" style={styles.title}>
                {title}
              </AppText>

              <AppText color={colors.text.secondary} style={styles.description}>
                {description}
              </AppText>

              <View style={styles.actionsContainer}>
                <AppButton
                  title="Sign In"
                  fullWidth
                  leftIcon={<LogIn size={18} color={colors.text.inverse} />}
                  onPress={handleLogin}
                  style={{ marginBottom: spacing.sm }}
                />

                <AppButton
                  title="Create an Account"
                  variant="outline"
                  fullWidth
                  leftIcon={<UserPlus size={18} color={colors.brand.primary} />}
                  onPress={handleRegister}
                  style={{ marginBottom: spacing.sm }}
                />

                <TouchableOpacity style={styles.notNowBtn} onPress={onClose}>
                  <AppText variant="small" weight="medium" color={colors.text.muted}>
                    Not Now
                  </AppText>
                </TouchableOpacity>
              </View>
            </AppCard>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const useRequireAuth = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{ title?: string; description?: string }>({});

  const requireAuth = useCallback(
    (title?: string, description?: string): boolean => {
      if (user) {
        return true;
      }
      setPromptConfig({ title, description });
      setModalVisible(true);
      return false;
    },
    [user]
  );

  const AuthGateModalComponent = (
    <AuthGateModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      title={promptConfig.title}
      description={promptConfig.description}
    />
  );

  return {
    isAuthenticated: !!user,
    user,
    requireAuth,
    AuthGateModalComponent,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.background.surface,
    borderRadius: radii.xxl,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
    zIndex: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  actionsContainer: {
    width: '100%',
  },
  notNowBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
