import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

interface AppContextType {
  /** Full-page loading overlay (e.g. during initial data fetch) */
  isPageLoading: boolean;
  setPageLoading: (v: boolean) => void;

  /** Sidebar open state for dashboard */
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPageLoading, setPageLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({
      isPageLoading,
      setPageLoading,
      isSidebarOpen,
      toggleSidebar,
      setSidebarOpen,
    }),
    [isPageLoading, isSidebarOpen, toggleSidebar]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};
