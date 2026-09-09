import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
import {
  Home,
  Leaf,
  Package,
  MessageSquare,
  User,
  Sprout,
  LayoutDashboard,
  Users,
} from 'lucide-react-native';
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
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EAECE7',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontFamily: typography.family.sansMedium,
          fontSize: 10.5,
          marginTop: 2,
        },
      }}
    >
      {/* 1. HOME (Reference Tab 1) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <Home size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 2. PRODUCTS / SEARCH (Reference Tab 2) */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <Leaf size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 3. ORDERS (Reference Tab 3) */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <Package size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 4. CHAT (Reference Tab 4) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <MessageSquare size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 5. PROFILE (Reference Tab 5) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <User size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />

      {/* Background Tab Routes (Preserving functional routes without cluttering the 5-tab bar) */}
      <Tabs.Screen
        name="farmer-dashboard"
        options={{
          title: 'Operations',
          href: null,
        }}
      />

      <Tabs.Screen
        name="farmer-crops"
        options={{
          title: 'Crops Hub',
          href: null,
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: 'Community',
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.pill,
  },
  activeIconWrapper: {
    backgroundColor: '#DCFCE7',
  },
});
