import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Sidebar } from '@/components/common';

const DashboardLayout = () => {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/messages');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Accessibility Skip Link */}
      <a
        href="#dashboard-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-on-brand focus:rounded-xl focus:shadow-lg focus:font-bold focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Role-Based Dashboard Sidebar */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Workspace Top Navigation Bar */}
        <Navbar
          isDashboard
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Scrollable Content Viewport */}
        <main
          id="dashboard-main-content"
          role="main"
          tabIndex={-1}
          className="flex-1 overflow-y-auto relative transition-all duration-300 custom-scrollbar bg-background focus:outline-none"
        >
          {isChat ? (
            <div className="h-full w-full">
              <Outlet />
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
