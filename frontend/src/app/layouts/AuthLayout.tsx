import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import logo from '@/assets/images/logo.png';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <img src={logo} alt="Farmket Logo" className="h-12 w-12 animate-pulse-subtle" />
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
      <div className="relative z-10 w-full max-w-[520px] bg-surface/80 dark:bg-surface/50 backdrop-blur-xl border border-border-subtle p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-16 w-16 bg-surface rounded-2xl flex items-center justify-center shadow-sm border border-border-subtle">
             <img src={logo} alt="Farmket Logo" className="h-10 w-10 object-contain" />
          </div>
          <span className="text-4xl font-display font-bold tracking-tight text-foreground">
            Farmket
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
