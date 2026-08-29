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
      initialRouteName="index"
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
      {/* 1. PUBLIC HOME (ALWAYS DEFAULT INITIAL SCREEN) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />

      {/* 2. PUBLIC EXPLORE / MARKETPLACE */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />

      {/* 3. COMMUNITY FEED */}
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Newspaper size={22} color={color} />,
        }}
      />

      {/* 4. FARMER DASHBOARD (ONLY VISIBLE FOR AUTHENTICATED FARMERS) */}
      <Tabs.Screen
        name="farmer-dashboard"
        options={{
          title: 'Operations',
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />

      {/* 5. FARMER CROPS HUB (ONLY VISIBLE FOR AUTHENTICATED FARMERS) */}
      <Tabs.Screen
        name="farmer-crops"
        options={{
          title: 'Crops Hub',
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color }) => <Sprout size={22} color={color} />,
        }}
      />

      {/* 6. ORDERS */}
      <Tabs.Screen
        name="orders"
        options={{
          title: isFarmer ? 'Store Orders' : 'Orders',
          tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} />,
        }}
      />

      {/* 7. CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
        }}
      />

      {/* 8. PROFILE / ACCOUNT */}
      <Tabs.Screen
        name="profile"
        options={{
          title: user ? 'Account' : 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
