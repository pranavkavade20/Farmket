import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Sidebar } from '@/components/common';
import { cn } from '@/lib/utils/cn';

const DashboardLayout = () => {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/messages');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto pt-4 px-4 sm:px-6 lg:px-8 gap-6">
        <Sidebar />
        <main className={cn(
          "flex-1 bg-surface/90 backdrop-blur-xl rounded-[2.5rem] shadow-xl ring-1 ring-border-subtle mb-6 relative flex flex-col transition-all duration-300",
          isChat ? "p-0 h-[calc(100vh-120px)] overflow-hidden" : "p-6 lg:p-10 min-h-[calc(100vh-120px)]"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
