import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Sprout } from 'lucide-react';
import type { UserType } from '@/types';

interface RoleRouteProps {
  allowedRoles: UserType[];
  redirectTo?: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, redirectTo = '/dashboard' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Sprout className="h-12 w-12 animate-pulse text-green-600 dark:text-green-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.user_type)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
