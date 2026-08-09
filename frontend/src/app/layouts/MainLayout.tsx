import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components/common';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
