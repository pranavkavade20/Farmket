import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import logo from '@/assets/images/logo.png';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC] dark:bg-gray-950">
        <img src={logo} alt="Farmket Logo" className="h-12 w-12 animate-pulse" />
      </div>
    );
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen relative items-center justify-center bg-[#F8F9FA] dark:bg-[#111] p-4 md:p-8 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-60 dark:opacity-30"
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80"
          alt="Farming landscape"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA]/50 to-[#F8F9FA] dark:from-[#111]/50 dark:to-[#111]" />
        <div className="absolute inset-0 backdrop-blur-[80px]" />
      </div>

      {/* Floating Glass Card */}
      <div className="relative z-10 w-full max-w-[520px] bg-white/60 dark:bg-[#111]/60 backdrop-blur-3xl border border-white/50 dark:border-gray-800 p-8 md:p-12 rounded-[3rem] shadow-2xl">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-16 w-16 bg-white dark:bg-gray-900 rounded-[1.5rem] flex items-center justify-center shadow-sm">
             <img src={logo} alt="Farmket Logo" className="h-10 w-10 object-contain" />
          </div>
          <span className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Farmket
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
