import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Avatar, Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  TrendingUp,
  User as UserIcon,
  MessageSquare,
  Sprout,
  Newspaper,
  BarChart3,
  Users,
  Store,
  PlusCircle,
  LogOut,
  X,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import farmketLogo from '@/assets/images/farmket_logo.png';
import farmketLogoDark from '@/assets/images/farmket_logo_dark.png';

export interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
  className,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isFarmer = user?.user_type === 'farmer';
  const isAdmin = user?.user_type === 'admin';
  const isBuyer = user?.user_type === 'buyer';

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    if (isMobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    navigate('/login');
  };

  const displayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : user.username
    : '';

  const roleLabel = isFarmer
    ? 'Farmer'
    : isAdmin
    ? 'Admin'
    : isBuyer
    ? 'Buyer'
    : 'Member';

  // Role-specific navigation groups
  const navigationGroups: NavGroup[] = [
    // Main Overview
    {
      title: 'Workspace',
      items: [
        {
          to: isAdmin ? '/dashboard/admin/executive' : '/dashboard',
          label: isAdmin ? 'Executive Overview' : 'Dashboard Overview',
          icon: LayoutDashboard,
          exact: true,
        },
        {
          to: '/messages',
          label: 'Messages',
          icon: MessageSquare,
        },
      ],
    },

    // Farmer Operations
    ...(isFarmer
      ? [
          {
            title: 'Farm Operations',
            items: [
              {
                to: '/dashboard/products',
                label: 'My Products',
                icon: Package,
                exact: true,
              },
              {
                to: '/dashboard/products/new',
                label: 'Add Product',
                icon: PlusCircle,
              },
              {
                to: '/farmer/crops',
                label: 'Crop Lifecycle',
                icon: Sprout,
              },
              {
                to: '/farmer/orders',
                label: 'Received Orders',
                icon: ShoppingBag,
              },
            ],
          },
          {
            title: 'Growth & Reach',
            items: [
              {
                to: '/dashboard/analytics',
                label: 'Sales Analytics',
                icon: BarChart3,
              },
              {
                to: '/farmer/posts',
                label: 'Community Posts',
                icon: Newspaper,
              },
              {
                to: '/dashboard/profile',
                label: 'Farm Profile',
                icon: UserIcon,
              },
            ],
          },
        ]
      : []),

    // Buyer Exploration & Orders
    ...(isBuyer
      ? [
          {
            title: 'Marketplace',
            items: [
              {
                to: '/marketplace',
                label: 'Explore Marketplace',
                icon: Store,
              },
              {
                to: '/dashboard/orders',
                label: 'My Orders',
                icon: ShoppingBag,
              },
              {
                to: '/feed',
                label: 'Farmer Community',
                icon: Compass,
              },
              {
                to: '/dashboard/profile',
                label: 'Buyer Profile',
                icon: UserIcon,
              },
            ],
          },
        ]
      : []),

    // Admin Intelligence Suite
    ...(isAdmin
      ? [
          {
            title: 'Management & Analytics',
            items: [
              {
                to: '/dashboard/admin/users',
                label: 'User Management',
                icon: Users,
              },
              {
                to: '/dashboard/admin/marketplace',
                label: 'Marketplace Analytics',
                icon: ShoppingBag,
              },
              {
                to: '/dashboard/admin/crops',
                label: 'Crop Intelligence',
                icon: Sprout,
              },
              {
                to: '/dashboard/admin/revenue',
                label: 'Revenue Analytics',
                icon: TrendingUp,
              },
            ],
          },
        ]
      : []),
  ];

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.exact}
        onClick={onCloseMobile}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 focus-ring',
            isActive
              ? 'bg-brand/10 text-brand font-bold shadow-xs'
              : 'text-foreground-secondary hover:text-foreground hover:bg-state-hover'
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand" />
            )}
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                isActive
                  ? 'text-brand'
                  : 'text-foreground-secondary group-hover:text-foreground'
              )}
            />
            <span className="truncate flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand/15 text-brand shrink-0">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface text-foreground select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 sm:px-5 shrink-0 border-b border-border-subtle">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2 group py-1 focus-ring rounded-lg"
          aria-label="Farmket Home"
        >
          <img
            src={farmketLogo}
            alt="Farmket"
            className="h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105 dark:hidden"
          />
          <img
            src={farmketLogoDark}
            alt="Farmket"
            className="h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105 hidden dark:block"
          />
        </Link>

        <div className="flex items-center gap-1.5">
          <Badge
            variant={isFarmer ? 'brand' : isAdmin ? 'warning' : 'default'}
            size="sm"
            className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider"
          >
            {roleLabel}
          </Badge>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-state-hover transition-colors focus-ring"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grouped Navigation Links */}
      <nav
        className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-5"
        aria-label="Sidebar Navigation"
      >
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted">
              {group.title}
            </p>
            <div className="space-y-0.5">{group.items.map(renderNavLink)}</div>
          </div>
        ))}
      </nav>

      {/* User Footer Profile & Quick Logout */}
      {user && (
        <div className="p-3 border-t border-border-subtle bg-surface-elevated/30 shrink-0">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl">
            <Link
              to="/dashboard/profile"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity focus-ring rounded-lg"
              title="View profile"
            >
              <Avatar
                src={user.profile_picture || undefined}
                alt={displayName}
                fallback={displayName.charAt(0)}
                size="sm"
                className="border border-brand/20 shrink-0 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate font-display">
                  {displayName}
                </p>
                <p className="text-[10px] font-medium text-foreground-secondary truncate capitalize">
                  {roleLabel} Workspace
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-foreground-secondary hover:text-danger hover:bg-danger/10 transition-colors focus-ring cursor-pointer shrink-0"
              aria-label="Log Out"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col w-[260px] h-full bg-surface border-r border-border-subtle shrink-0 relative z-20',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-50 flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation sidebar drawer"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm"
              onClick={onCloseMobile}
            />

            {/* Slide-out drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-[85vw] h-full bg-surface shadow-2xl border-r border-border-strong z-10"
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