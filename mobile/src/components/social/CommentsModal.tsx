import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AppText, AppButton, AppCard } from '../ui';
import { colors, spacing, radii } from '../../theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, addComment, Comment } from '../../api/social';
import { formatDate } from '../../utils/format';
import { X, Send, MessageSquare } from 'lucide-react-native';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  postId,
}) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
    enabled: visible && !!postId,
  });

  const handleSend = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await addComment(postId, content.trim());
      setContent('');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['feed'] });
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
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MessageSquare size={18} color={colors.brand.primary} style={{ marginRight: 8 }} />
              <AppText variant="subheading" weight="bold">
                Comments ({comments.length})
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={colors.brand.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.centerContent}>
              <AppText color={colors.text.muted}>No comments yet. Start the conversation!</AppText>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.avatar}>
                    <AppText weight="bold" color={colors.brand.primary}>
                      {(item.user.first_name?.[0] || item.user.username?.[0] || 'U').toUpperCase()}
                    </AppText>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                      <AppText weight="bold" style={{ fontSize: 13 }}>
                        {item.user.first_name ? `${item.user.first_name} ${item.user.last_name || ''}` : item.user.username}
                      </AppText>
                      <AppText variant="small" color={colors.text.muted} style={{ fontSize: 11 }}>
                        {formatDate(item.created_at)}
                      </AppText>
                    </View>
                    <AppText variant="small" color={colors.text.primary} style={{ marginTop: 2 }}>
                      {item.content}
                    </AppText>
                  </View>
                </View>
              )}
            />
          )}

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              placeholder="Add a comment..."
              placeholderTextColor={colors.text.muted}
              value={content}
              onChangeText={setContent}
              style={styles.textInput}
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!content.trim() || submitting}
              style={[styles.sendBtn, (!content.trim() || submitting) && styles.sendBtnDisabled]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    height: '75%',
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  commentBody: {
    flex: 1,
    backgroundColor: colors.background.elevated,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text.primary,
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendBtnDisabled: {
    backgroundColor: colors.border.strong,
  },
});
