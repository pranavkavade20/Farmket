import React from 'react';
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
  Users,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from "@/assets/images/logo.png";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
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

  const renderNavLink = (link: { to: string; label: string; icon: React.ReactNode; exact?: boolean }) => (
    <NavLink
      key={link.to}
      to={link.to}
      end={link.exact}
      onClick={onCloseMobile}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 focus-ring',
          isActive
            ? 'bg-brand/10 text-brand dark:bg-brand/20 font-semibold'
            : 'text-foreground-secondary hover:text-foreground hover:bg-state-hover'
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn("shrink-0 transition-colors", isActive ? "text-brand" : "text-foreground-secondary")}>
            {link.icon}
          </div>
          <span className="truncate">{link.label}</span>
        </>
      )}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-5 shrink-0 border-b border-border-subtle">
        <Link to="/" onClick={onCloseMobile} className="flex items-center gap-2 group">
          <img src={logo} alt="Farmket Logo" className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="text-lg font-display font-bold tracking-tight text-foreground transition-colors duration-300">
            Farmket
          </span>
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-state-hover transition-colors focus-ring"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col justify-between gap-6">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
            Main Menu
          </p>
          {links.map(renderNavLink)}
        </div>

        {/* Pinned / Bottom Area */}
        <div className="space-y-1 pt-4 border-t border-border-subtle">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
            Account & Support
          </p>
          {bottomLinks.map(renderNavLink)}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] h-full bg-surface border-r border-border-subtle flex-shrink-0 relative">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onCloseMobile}
            />

            {/* Slide-out drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-[85vw] h-full bg-surface shadow-2xl border-r border-border-subtle z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
