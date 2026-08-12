import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Sidebar } from '@/components/common';
import { cn } from '@/lib/utils/cn';

const DashboardLayout = () => {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/messages');

  return (
    <div className="flex h-screen bg-main text-foreground overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-main">
        <Navbar isDashboard />
        <main className={cn(
          "flex-1 overflow-y-auto relative transition-all duration-300 custom-scrollbar",
          isChat ? "p-0" : "p-4 md:p-6 lg:p-8"
        )}>
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
