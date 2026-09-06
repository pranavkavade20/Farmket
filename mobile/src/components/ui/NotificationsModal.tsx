import React from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { colors, spacing, radii, shadows } from '../../theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { AppEmptyState } from './AppEmptyState';
import { 
  fetchNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead, 
  type Notification 
} from '../../api/notifications';
import { formatDate } from '../../utils/format';
import { 
  X, 
  Bell, 
  Package, 
  Calendar, 
  Sprout, 
  Tag, 
  CheckCheck 
} from 'lucide-react-native';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: visible,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleNotificationPress = (item: Notification) => {
    if (!item.is_read) {
      markReadMutation.mutate(item.id);
    }
    onClose();
    if (item.notification_type === 'ORDER') {
      router.push('/(tabs)/orders');
    } else if (item.notification_type === 'STAGE_UPDATE' || item.notification_type === 'RESERVATION') {
      router.push('/(tabs)/farmer-crops');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package size={18} color={colors.accent.terracotta} />;
      case 'RESERVATION':
        return <Calendar size={18} color={colors.brand.primary} />;
      case 'STAGE_UPDATE':
        return <Sprout size={18} color={colors.status.success} />;
      case 'PRICE_ALERT':
        return <Tag size={18} color={colors.accent.amber} />;
      default:
        return <Bell size={18} color={colors.brand.primary} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Bell size={20} color={colors.brand.primary} />
              <AppText variant="h2" weight="bold" style={{ marginLeft: spacing.sm }}>
                Notifications
              </AppText>
              {unreadCount > 0 && (
                <View style={styles.unreadPill}>
                  <AppText variant="label" weight="bold" color="#FFFFFF">
                    {unreadCount} new
                  </AppText>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity 
                  onPress={() => markAllMutation.mutate()} 
                  style={styles.markAllButton}
                  activeOpacity={0.7}
                  disabled={markAllMutation.isPending}
                >
                  <CheckCheck size={16} color={colors.brand.primary} />
                  <AppText variant="caption" weight="semibold" color={colors.brand.primary} style={{ marginLeft: 4 }}>
                    Read all
                  </AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand.primary} />
            </View>
          ) : notifications.length === 0 ? (
            <AppEmptyState
              icon={<Bell size={40} color={colors.brand.primary} />}
              title="All Caught Up"
              description="You have no notifications at the moment. We'll alert you on order updates and harvests."
              actionTitle="Back to App"
              onAction={onClose}
            />
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.notificationItem,
                    !item.is_read && styles.unreadItem
                  ]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: !item.is_read ? colors.brand.tint : colors.background.elevated }]}>
                    {getNotificationIcon(item.notification_type)}
                  </View>

                  <View style={styles.contentWrapper}>
                    <View style={styles.itemHeader}>
                      <AppText variant="h3" weight={!item.is_read ? 'bold' : 'medium'} numberOfLines={1} style={{ flex: 1 }}>
                        {item.title}
                      </AppText>
                      <AppText variant="label" color={colors.text.muted} style={{ marginLeft: spacing.xs }}>
                        {formatDate(item.created_at)}
                      </AppText>
                    </View>

                    <AppText variant="caption" color={colors.text.secondary} numberOfLines={2} style={styles.message}>
                      {item.message}
                    </AppText>
                  </View>

                  {!item.is_read && (
                    <View style={styles.unreadDot} />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    height: '85%',
    ...shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadPill: {
    backgroundColor: colors.brand.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
    backgroundColor: colors.brand.tint,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  unreadItem: {
    backgroundColor: 'rgba(240, 253, 250, 0.6)',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    marginTop: 3,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
  }
});
