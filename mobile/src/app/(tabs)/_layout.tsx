import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
import { 
  Home, 
  Search, 
  ShoppingBag, 
  MessageSquare, 
  User, 
  Sprout, 
  LayoutDashboard, 
  Compass, 
  Users 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';

  return (
    <Tabs
      initialRouteName={isFarmer ? 'farmer-dashboard' : 'index'}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background.surface,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + spacing.xs,
          paddingTop: spacing.sm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.03,
          shadowRadius: 6,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontFamily: typography.family.sansMedium,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      {/* 1. BUYER: HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          href: isFarmer ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <Home size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 2. BUYER: EXPLORE */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Explore',
          href: isFarmer ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <Compass size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 3. FARMER: OPERATIONS DASHBOARD */}
      <Tabs.Screen
        name="farmer-dashboard"
        options={{
          title: 'Operations',
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <LayoutDashboard size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 4. FARMER: CROPS HUB */}
      <Tabs.Screen
        name="farmer-crops"
        options={{
          title: 'Crops Hub',
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <Sprout size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 5. ORDERS (BOTH BUYER & FARMER) */}
      <Tabs.Screen
        name="orders"
        options={{
          title: isFarmer ? 'Fulfillment' : 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <ShoppingBag size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 6. COMMUNITY FEED (BOTH BUYER & FARMER) */}
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <Users size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />

      {/* 7. CHAT (Hidden from tab bar; accessed via TopBarActions / Product Cards / Order Details) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messages',
          href: null,
          tabBarIcon: ({ color, focused }) => (
            <MessageSquare size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />

      {/* 8. PROFILE / ACCOUNT (BOTH BUYER & FARMER) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: isFarmer ? 'Farm Studio' : user ? 'Account' : 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <User size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
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
    paddingHorizontal: 8,
    borderRadius: radii.pill,
  },
  activeIconWrapper: {
    backgroundColor: colors.brand.tint,
  },
});
