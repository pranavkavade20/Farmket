import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import FarmerDashboard from './FarmerDashboard';
import BuyerDashboard from './BuyerDashboard';
import { Sprout } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Sprout className="h-10 w-10 animate-pulse text-brand" />
      </div>
    );
  }

  if (user?.user_type === 'farmer') {
    return <FarmerDashboard />;
  }

  if (user?.user_type === 'buyer') {
    return <BuyerDashboard />;
  }

  if (user?.user_type === 'admin') {
    return <Navigate to="/dashboard/admin/executive" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Dashboard;
