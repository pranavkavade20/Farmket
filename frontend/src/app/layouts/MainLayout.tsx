import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components/common';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F5] dark:bg-gray-950 font-sans selection:bg-green-200 dark:selection:bg-green-900">
      <Navbar />
      <main className="flex-1 w-full mx-auto max-w-[1600px] overflow-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
