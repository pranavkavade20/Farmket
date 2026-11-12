import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/context';
import { Avatar, Badge } from '@/components/ui';
import {
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  User as UserIcon,
  Store,
  ShoppingBag,
  Sprout,
  Newspaper,
  BarChart3,
  Activity,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavUserDropdownProps {
  className?: string;
}

export const NavUserDropdown = ({ className }: NavUserDropdownProps) => {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const displayName = user.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.username;

  const roleLabel =
    user.user_type === 'farmer'
      ? 'Farmer'
      : user.user_type === 'admin'
      ? 'Admin'
      : 'Buyer';

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User navigation menu"
        className={cn(
          'flex items-center gap-2 py-1 px-1.5 sm:px-2.5 rounded-full transition-all duration-200 cursor-pointer',
          'border border-transparent hover:border-border-subtle hover:bg-state-hover focus-ring',
          isOpen && 'bg-state-hover border-border-subtle shadow-xs'
        )}
      >
        <Avatar
          src={user.profile_picture || undefined}
          alt={displayName}
          fallback={displayName.charAt(0)}
          size="sm"
          className="border border-brand/20 shadow-xs"
        />

        <div className="hidden lg:flex flex-col items-start leading-tight pr-1">
          <span className="text-xs font-bold text-foreground max-w-[120px] truncate">
            {displayName}
          </span>
          <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider">
            {roleLabel}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-foreground-secondary transition-transform duration-200 ml-0.5',
            isOpen && 'rotate-180 text-brand'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-2xl shadow-xl border border-border-strong overflow-hidden z-50 origin-top-right focus:outline-none"
          >
            {/* Header info */}
            <div className="p-3.5 border-b border-border-subtle bg-surface-elevated/40">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-foreground truncate font-display">
                  {displayName}
                </p>
                <Badge variant={user.user_type === 'farmer' ? 'brand' : 'default'} size="sm">
                  {roleLabel}
                </Badge>
              </div>
              <p className="text-xs text-foreground-secondary truncate">{user.email}</p>
            </div>

            {/* Menu Links */}
            <div className="p-1.5 flex flex-col gap-0.5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                  isLinkActive('/dashboard')
                    ? 'bg-brand/10 text-brand font-bold'
                    : 'text-foreground hover:bg-state-hover'
                )}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0 text-foreground-secondary" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/messages"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                  isLinkActive('/messages')
                    ? 'bg-brand/10 text-brand font-bold'
                    : 'text-foreground hover:bg-state-hover'
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-foreground-secondary" />
                <span>Messages</span>
              </Link>

              {/* Role specific navigation */}
              {user.user_type === 'admin' && (
                <>
                  <div className="h-px bg-border-subtle my-1 mx-2" />
                  <Link
                    to="/dashboard/admin/executive"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/dashboard/admin/executive')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <Activity className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>Executive Analytics</span>
                  </Link>
                  <Link
                    to="/dashboard/admin/marketplace"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/dashboard/admin/marketplace')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>Marketplace Analytics</span>
                  </Link>
                </>
              )}

              {user.user_type === 'farmer' && (
                <>
                  <div className="h-px bg-border-subtle my-1 mx-2" />
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/dashboard/profile')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <UserIcon className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>Farm Profile</span>
                  </Link>
                  <Link
                    to="/dashboard/products"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/dashboard/products')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <Store className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>My Products</span>
                  </Link>
                  <Link
                    to="/farmer/crops"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/farmer/crops')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <Sprout className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>Crop Tracking</span>
                  </Link>
                  <Link
                    to="/farmer/orders"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/farmer/orders')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>Received Orders</span>
                  </Link>
                  <Link
                    to="/farmer/posts"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/farmer/posts')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <Newspaper className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>My Posts</span>
                  </Link>
                  <Link
                    to="/dashboard/analytics"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/dashboard/analytics')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <BarChart3 className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>Analytics</span>
                  </Link>
                </>
              )}

              {user.user_type === 'buyer' && (
                <>
                  <div className="h-px bg-border-subtle my-1 mx-2" />
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/dashboard/profile')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <UserIcon className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/dashboard/orders"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors',
                      isLinkActive('/dashboard/orders')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0 text-foreground-secondary" />
                    <span>My Orders</span>
                  </Link>
                </>
              )}

              <div className="h-px bg-border-subtle my-1 mx-2" />

              {/* Theme toggle row */}
              <button
                type="button"
                onClick={toggleDark}
                role="menuitem"
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-xl text-foreground hover:bg-state-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-foreground-secondary" />
                  )}
                  <span>Appearance</span>
                </div>
                <span className="text-[11px] font-medium text-foreground-secondary">
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={handleLogout}
                role="menuitem"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-danger rounded-xl hover:bg-danger/10 transition-colors w-full text-left mt-0.5 cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavUserDropdown;