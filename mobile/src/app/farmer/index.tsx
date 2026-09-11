import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function FarmerIndexRedirect() {
  const { user } = useAuth();
  
  if (user?.user_type === 'farmer') {
    return <Redirect href={`/farmer/${user.id}` as any} />;
  }

  return <Redirect href="/(tabs)/profile" />;
}
