import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components/common';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-on-brand focus:rounded-xl focus:shadow-lg focus:font-bold focus:outline-none"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" role="main" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
