import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, authStatus } = useAuth();

  if (authStatus === 'initializing') {
    return null;
  }

  // If already signed in, go directly to Home tabs
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Showcase Welcome / Onboarding (Screen 1 in reference design) for new/guest visitors
  return <Redirect href={'/(auth)/welcome' as any} />;
}
