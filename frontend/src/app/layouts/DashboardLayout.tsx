import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Sidebar } from '@/components/common';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F5] dark:bg-[#0A0A0A]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-[1600px] w-full mx-auto mt-4">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#111] rounded-[2.5rem] shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 mb-6 mr-4 p-6 lg:p-10 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
