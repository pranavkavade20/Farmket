import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, radii, shadows } from '../../theme';
import { AppText } from '../ui/AppText';
import { NotificationsModal } from '../ui/NotificationsModal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { fetchNotifications } from '../../api/notifications';
import { ShoppingBag, Bell, MessageSquare } from 'lucide-react-native';

export interface TopBarActionsProps {
  showCart?: boolean;
  showNotifications?: boolean;
  showChat?: boolean;
}

export function TopBarActions({
  showCart = true,
  showNotifications = true,
  showChat = false,
}: TopBarActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const isBuyer = user?.user_type === 'buyer' || !user;

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: Boolean(user),
    staleTime: 30000,
  });

  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <View style={styles.container}>
        {showChat && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/chat')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.75}
          >
            <MessageSquare size={20} color={colors.text.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {showNotifications && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setNotificationsVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.75}
          >
            <Bell size={20} color={colors.text.primary} strokeWidth={2} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.badge}>
                <AppText variant="label" weight="bold" color="#FFFFFF" style={styles.badgeText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showCart && isBuyer && (
          <TouchableOpacity
            style={[styles.iconButton, styles.cartButton]}
            onPress={() => router.push('/cart')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.75}
          >
            <ShoppingBag size={20} color={colors.brand.primary} strokeWidth={2.2} />
            {itemCount > 0 && (
              <View style={[styles.badge, styles.cartBadge]}>
                <AppText variant="label" weight="bold" color="#FFFFFF" style={styles.badgeText}>
                  {itemCount > 99 ? '99+' : itemCount}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <NotificationsModal 
        visible={notificationsVisible} 
        onClose={() => setNotificationsVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cartButton: {
    backgroundColor: colors.brand.tint,
    borderColor: colors.brand.muted,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.status.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.background.surface,
  },
  cartBadge: {
    backgroundColor: colors.brand.primary,
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 11,
  }
});
