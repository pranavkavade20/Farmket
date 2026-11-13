import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import farmketLogoDark from '@/assets/images/farmket_logo_dark.png';
import farmketLogoOrig from '@/assets/images/farmket_logo_orig.png';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <img
          src="/logo.png"
          alt="Farmket Logo"
          className="h-14 w-14 sm:h-16 sm:w-16 object-contain animate-pulse-subtle"
        />
      </div>
    );
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen relative items-center justify-center bg-background p-4 md:p-8 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-30 dark:opacity-20"
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80"
          alt="Farming landscape"
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 backdrop-blur-[60px]" />
      </div>

      {/* Floating Glass Card */}
      <div className="relative z-10 w-full max-w-[520px] bg-surface/80 dark:bg-surface/50 backdrop-blur-xl border border-border-subtle p-5 sm:p-8 md:p-12 rounded-3xl sm:rounded-[2.5rem] shadow-2xl">
        <Link
          to="/"
          className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl p-1 transition-all"
          aria-label="Farmket Home"
        >
          {/* Logo icon covering full area */}
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 transition-all shrink-0">
            <img
              src="/logo.png"
              alt="Farmket Icon"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Wordmark logo according to theme */}
          <div className="relative h-9 sm:h-11 flex items-center">
            <img
              src={farmketLogoOrig}
              alt="Farmket"
              className="h-9 sm:h-11 w-auto object-contain dark:hidden"
            />
            <img
              src={farmketLogoDark}
              alt="Farmket"
              className="h-9 sm:h-11 w-auto object-contain hidden dark:block"
            />
          </div>
        </Link>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
