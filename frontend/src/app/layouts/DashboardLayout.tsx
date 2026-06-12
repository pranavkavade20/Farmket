import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Sidebar } from '@/components/common';
import { cn } from '@/lib/utils/cn';

const DashboardLayout = () => {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/messages');

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] dark:bg-[#050505]">
      <Navbar />
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto pt-4 px-4 sm:px-6 lg:px-8 gap-6">
        <Sidebar />
        <main className={cn(
          "flex-1 bg-white/90 backdrop-blur-xl dark:bg-[#111]/90 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-1 ring-gray-100/50 dark:ring-gray-800/50 mb-6 relative flex flex-col",
          isChat ? "p-0 h-[calc(100vh-120px)] overflow-hidden" : "p-6 lg:p-10 min-h-[calc(100vh-120px)]"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
