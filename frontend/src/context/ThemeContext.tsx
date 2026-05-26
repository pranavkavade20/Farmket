import React, { useEffect, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { toggleTheme } from '@/features/theme/themeSlice';

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useAppSelector(state => state.theme.isDark);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return <>{children}</>;
};

export const useTheme = (): ThemeContextType => {
  const isDark = useAppSelector(state => state.theme.isDark);
  const dispatch = useAppDispatch();
  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);

  return useMemo(() => ({ isDark, toggle }), [isDark, toggle]);
};
