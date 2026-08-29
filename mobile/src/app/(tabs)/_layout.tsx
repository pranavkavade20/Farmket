import React from 'react';
import { Tabs } from 'expo-router';
import { colors, typography, spacing } from '../../theme';
import { Home, Search, ShoppingBag, MessageSquare, User, Sprout, LayoutDashboard, Newspaper } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background.surface,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + spacing.xs,
          paddingTop: spacing.xs,
        },
        tabBarLabelStyle: {
          fontFamily: typography.family.sansMedium,
          fontSize: typography.size.xs,
          marginTop: spacing.xxs,
        },
      }}
    >
      {/* Farmer Specific Tabs */}
      <Tabs.Screen
        name="farmer-dashboard"
        options={{
          title: 'Dashboard',
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="farmer-crops"
        options={{
          title: 'Crops',
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color }) => <Sprout size={22} color={color} />,
        }}
      />

      {/* Buyer Specific Tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          href: !isFarmer ? undefined : null,
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Explore',
          href: !isFarmer ? undefined : null,
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />

      {/* Community Feed (Both Roles) */}
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Newspaper size={22} color={color} />,
        }}
      />

      {/* Orders (Both Roles) */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} />,
        }}
      />

      {/* Chat (Both Roles) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
        }}
      />

      {/* Profile (Both Roles) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
