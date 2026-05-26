import React, { useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { 
  setPageLoading as setPageLoadingAction, 
  setSidebarOpen as setSidebarOpenAction, 
  toggleSidebar as toggleSidebarAction 
} from '@/features/app/appSlice';

interface AppContextType {
  /** Full-page loading overlay (e.g. during initial data fetch) */
  isPageLoading: boolean;
  setPageLoading: (v: boolean) => void;

  /** Sidebar open state for dashboard */
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useApp = (): AppContextType => {
  const isPageLoading = useAppSelector((state) => state.app.isPageLoading);
  const isSidebarOpen = useAppSelector((state) => state.app.isSidebarOpen);
  const dispatch = useAppDispatch();

  const setPageLoading = useCallback((v: boolean) => dispatch(setPageLoadingAction(v)), [dispatch]);
  const setSidebarOpen = useCallback((v: boolean) => dispatch(setSidebarOpenAction(v)), [dispatch]);
  const toggleSidebar = useCallback(() => dispatch(toggleSidebarAction()), [dispatch]);

  return useMemo(
    () => ({
      isPageLoading,
      setPageLoading,
      isSidebarOpen,
      toggleSidebar,
      setSidebarOpen,
    }),
    [isPageLoading, setPageLoading, isSidebarOpen, toggleSidebar, setSidebarOpen]
  );
};
