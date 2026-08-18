import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { apiClient } from '../api/client';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        // Fetch user profile from the backend
        const response = await apiClient.get('/accounts/profile/');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      await storage.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (access: string, refresh: string) => {
    await storage.setToken(access);
    await storage.setRefreshToken(refresh);
    await loadUser();
  };

  const logout = async () => {
    await storage.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
