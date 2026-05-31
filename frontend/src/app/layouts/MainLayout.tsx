import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components/common';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-green-50 dark:bg-[#0A0A0A]">
      <Navbar />
      <main >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
