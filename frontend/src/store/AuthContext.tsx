import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: import('@/types').RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Initialise from persisted token ────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { setLoading(false); return; }

      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch {
        // Token invalid / expired and refresh already attempted by interceptor
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Listen for forced-logout event from API interceptor ────────────────────
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { token, refresh_token, user: userData } = await authService.login({ email, password });
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh_token);
    setUser(userData);
  }, []);

  const register = useCallback(async (data: import('@/types').RegisterData) => {
    const { token, refresh_token, user: userData } = await authService.register(data);
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh_token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
