import { NavLink, Link } from 'react-router-dom';
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
import logo from "@/assets/images/logo.png";

const Sidebar = () => {
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';
  const isAdmin = user?.user_type === 'admin';
  const isBuyer = user?.user_type === 'buyer';

  const links = [
    ...(!isAdmin ? [{ to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, exact: true }] : []),
    ...(isBuyer ? [
      { to: '/dashboard/orders', label: 'Orders', icon: <ShoppingBag className="h-4 w-4" /> },
    ] : []),
    ...(isFarmer ? [
      { to: '/dashboard/products', label: 'My Products', icon: <Package className="h-4 w-4" /> },
      { to: '/farmer/crops', label: 'Crop Tracking', icon: <Sprout className="h-4 w-4" /> },
      { to: '/farmer/posts', label: 'My Posts', icon: <Newspaper className="h-4 w-4" /> },
      { to: '/farmer/orders', label: 'Received Orders', icon: <ShoppingBag className="h-4 w-4" /> },
      { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    ] : []),
    ...(isAdmin ? [
      { to: '/dashboard/admin/executive', label: 'Executive Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: '/dashboard/admin/users', label: 'User Analytics', icon: <Users className="h-4 w-4" /> },
      { to: '/dashboard/admin/marketplace', label: 'Marketplace Analytics', icon: <ShoppingBag className="h-4 w-4" /> },
      { to: '/dashboard/admin/crops', label: 'Crop Intelligence', icon: <Sprout className="h-4 w-4" /> },
      { to: '/dashboard/admin/revenue', label: 'Revenue Analytics', icon: <TrendingUp className="h-4 w-4" /> },
    ] : []),
  ];

  const bottomLinks = [
    { to: '/messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
    { to: '/dashboard/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  ];

  const renderNavLink = (link: any) => (
    <NavLink
      key={link.to}
      to={link.to}
      end={link.exact}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus-ring',
          isActive
            ? 'bg-brand/10 text-brand dark:bg-brand/20'
            : 'text-foreground-secondary hover:text-foreground hover:bg-state-hover'
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn("shrink-0", isActive ? "text-brand" : "text-foreground-secondary")}>
            {link.icon}
          </div>
          <span className="truncate">{link.label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-full bg-surface border-r border-border-subtle flex-shrink-0 relative">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-6 shrink-0 border-b border-border-subtle">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Farmket Logo" className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="text-lg font-display font-bold tracking-tight text-foreground transition-colors duration-300">
            Farmket
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
        <div className="space-y-1">
          {links.map(renderNavLink)}
        </div>
        
        {/* Pinned / Bottom Area */}
        <div className="mt-auto space-y-1 pt-4 border-t border-border-subtle">
           {bottomLinks.map(renderNavLink)}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
