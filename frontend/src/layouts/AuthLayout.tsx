import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import logo from '../assets/logo.png';

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
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-3 mb-10">
            <img src={logo} alt="Farmket Logo" className="h-12 w-12 object-contain" />
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Farmket
            </span>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80"
          alt="Farming landscape"
        />
        <div className="absolute inset-0 bg-green-900/40 mix-blend-multiply" />
      </div>
    </div>
  );
};

export default AuthLayout;
