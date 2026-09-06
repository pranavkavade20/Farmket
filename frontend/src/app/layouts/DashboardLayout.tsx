import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Sidebar } from '@/components/common';

const DashboardLayout = () => {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/messages');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        <Navbar
          isDashboard
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto relative transition-all duration-300 custom-scrollbar bg-background">
          {isChat ? (
            <div className="h-full w-full">
              <Outlet />
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
