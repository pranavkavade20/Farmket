import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components/common';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
