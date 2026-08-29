import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AppText, AppButton, AppCard } from '../ui';
import { colors, spacing, radii } from '../../theme';
import { createPost } from '../../api/social';
import { X, Image as ImageIcon, Send, Sparkles } from 'lucide-react-native';

interface PostComposerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePost = async () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter a description for your update.');
      return;
    }

    setSubmitting(true);
    try {
      await createPost({
        description: description.trim(),
      });
      setDescription('');
      Alert.alert('Posted! 🌱', 'Your farm update is now live on the community feed.');
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Sparkles size={18} color={colors.brand.primary} style={{ marginRight: 8 }} />
              <AppText variant="subheading" weight="bold">Share Farm Update</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TextInput
              placeholder="What's growing in your farm today? Share weather, crop growth, or harvest news with buyers..."
              placeholderTextColor={colors.text.muted}
              value={description}
              onChangeText={setDescription}
              style={styles.textArea}
              multiline
              autoFocus
            />
          </View>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <AppButton
              title={submitting ? 'Publishing...' : 'Publish Update'}
              onPress={handlePost}
              loading={submitting}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    minHeight: 320,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  closeBtn: {
    padding: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.background.elevated,
  },
  content: {
    padding: spacing.xl,
  },
  textArea: {
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
});
