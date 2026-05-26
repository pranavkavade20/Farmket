import React, { useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/types';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { 
  initAuth, 
  loginThunk, 
  registerThunk, 
  logoutThunk, 
  clearAuth, 
  updateUser as updateUserAction 
} from './authSlice';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: import('@/types').RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: User) => void;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  // Initialise from persisted token
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  // Listen for forced-logout event from API interceptor
  useEffect(() => {
    const handleForcedLogout = () => {
      dispatch(clearAuth());
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [dispatch]);

  return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
  const user = useAppSelector(state => state.auth.user);
  const loading = useAppSelector(state => state.auth.loading);
  const dispatch = useAppDispatch();

  const login = useCallback(async (email: string, password: string) => {
    await dispatch(loginThunk({ email, password })).unwrap();
  }, [dispatch]);

  const register = useCallback(async (data: import('@/types').RegisterData) => {
    await dispatch(registerThunk(data)).unwrap();
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutThunk()).unwrap();
  }, [dispatch]);

  const updateUser = useCallback((updated: User) => {
    dispatch(updateUserAction(updated));
  }, [dispatch]);

  return useMemo(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser]
  );
};
