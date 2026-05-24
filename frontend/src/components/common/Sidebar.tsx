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

  const links = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, exact: true },
    { to: '/dashboard/orders', label: 'Orders', icon: <ShoppingBag className="h-5 w-5" /> },
    ...(isFarmer ? [
      { to: '/dashboard/products', label: 'My Products', icon: <Package className="h-5 w-5" /> },
      { to: '/dashboard/analytics', label: 'Analytics', icon: <TrendingUp className="h-5 w-5" /> },
    ] : []),
    { to: '/messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" /> },
    { to: '/dashboard/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0c1110] lg:flex">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100'
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
