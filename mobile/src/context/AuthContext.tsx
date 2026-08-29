import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { getCurrentUserApi, logoutApi, User } from '../api/auth';
import { resolveMediaUrl } from '../api/config';
import { useQueryClient } from '@tanstack/react-query';

export { User };

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        const userData = await getCurrentUserApi();
        if (userData.profile_picture) {
          userData.profile_picture = resolveMediaUrl(userData.profile_picture) || userData.profile_picture;
        }
        setUser(userData);
        setAuthStatus('authenticated');
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        await storage.clearTokens();
        setUser(null);
        setAuthStatus('unauthenticated');
      } else {
        // Network error during startup: keep tokens for offline mode or retry
        setUser(null);
        setAuthStatus('unauthenticated');
      }
      console.log('[Auth] Load user notice:', error?.message || error);
    }
  };

  const login = async (access: string, refresh: string) => {
    await storage.setToken(access);
    await storage.setRefreshToken(refresh);
    await loadUser();
  };

  const logout = async () => {
    const refreshToken = await storage.getRefreshToken();
    await logoutApi(refreshToken);
    await storage.clearTokens();
    queryClient.clear(); // Clear all user cached data to prevent cache leakage across users
    setUser(null);
    setAuthStatus('unauthenticated');
  };

  const refreshProfile = async () => {
    await loadUser();
  };

  const isLoading = authStatus === 'initializing';

  return (
    <AuthContext.Provider value={{ user, authStatus, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
