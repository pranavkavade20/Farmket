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
  Sprout,
  Newspaper,
  BarChart3,
  Users
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';
  const isAdmin = user?.user_type === 'admin';
  const isBuyer = user?.user_type === 'buyer';

  const links = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, exact: true },
    ...(isBuyer ? [
      { to: '/dashboard/orders', label: 'Orders', icon: <ShoppingBag className="h-5 w-5" /> },
    ] : []),
    ...(isFarmer ? [
      { to: '/dashboard/products', label: 'My Products', icon: <Package className="h-5 w-5" /> },
      { to: '/farmer/crops', label: 'Crop Tracking', icon: <Sprout className="h-5 w-5" /> },
      { to: '/farmer/posts', label: 'My Posts', icon: <Newspaper className="h-5 w-5" /> },
      { to: '/farmer/orders', label: 'Received Orders', icon: <ShoppingBag className="h-5 w-5" /> },
      { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    ] : []),
    ...(isAdmin ? [
      { to: '/dashboard/admin/executive', label: 'Executive Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { to: '/dashboard/admin/users', label: 'User Analytics', icon: <Users className="h-5 w-5" /> },
      { to: '/dashboard/admin/marketplace', label: 'Marketplace Analytics', icon: <ShoppingBag className="h-5 w-5" /> },
      { to: '/dashboard/admin/crops', label: 'Crop Intelligence', icon: <Sprout className="h-5 w-5" /> },
      { to: '/dashboard/admin/revenue', label: 'Revenue Analytics', icon: <TrendingUp className="h-5 w-5" /> },
    ] : []),
    { to: '/messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" /> },
    { to: '/dashboard/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <aside className="hidden w-[260px] flex-col bg-transparent lg:flex py-2 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        <nav className="space-y-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 ease-out relative overflow-hidden',
                  isActive
                    ? 'text-brand bg-brand/10 dark:bg-brand/20 shadow-sm'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-gray-100/50 dark:hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand rounded-r-full shadow-[0_0_10px_rgba(var(--brand),0.5)]" />
                  )}
                  <div className={cn(
                    "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                    isActive ? "text-brand" : "text-foreground-secondary group-hover:text-foreground"
                  )}>
                    {link.icon}
                  </div>
                  <span className="font-semibold tracking-wide z-10">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
