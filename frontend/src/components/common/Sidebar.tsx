import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  TrendingUp,
  User,
  MessageSquare,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';
  const isAdmin = user?.user_type === 'admin';

  const links = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, exact: true },
    { to: '/dashboard/orders', label: 'Orders', icon: <ShoppingBag className="h-5 w-5" /> },
    ...(isFarmer ? [
      { to: '/dashboard/products', label: 'My Products', icon: <Package className="h-5 w-5" /> },
      { to: '/dashboard/analytics', label: 'Analytics', icon: <TrendingUp className="h-5 w-5" /> },
    ] : []),
    ...(isAdmin ? [
      { to: '/dashboard/admin/executive', label: 'Executive Dashboard', icon: <TrendingUp className="h-5 w-5" /> },
      { to: '/dashboard/admin/users', label: 'User Analytics', icon: <User className="h-5 w-5" /> },
      { to: '/dashboard/admin/marketplace', label: 'Marketplace Analytics', icon: <ShoppingBag className="h-5 w-5" /> },
      { to: '/dashboard/admin/crops', label: 'Crop Intelligence', icon: <Package className="h-5 w-5" /> },
      { to: '/dashboard/admin/revenue', label: 'Revenue Analytics', icon: <TrendingUp className="h-5 w-5" /> },
    ] : []),
    { to: '/messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" /> },
    { to: '/dashboard/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <aside className="hidden w-[280px] flex-col bg-[#F5F5F5] dark:bg-[#0A0A0A] lg:flex px-4 py-8">
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-4 rounded-full px-5 py-4 text-[13px] font-black uppercase tracking-widest transition-all duration-300',
                  isActive
                    ? 'bg-gray-900 text-white shadow-xl dark:bg-white dark:text-gray-900 scale-[1.02]'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white'
                )
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
