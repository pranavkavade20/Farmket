import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/context';
import { Avatar, Badge, Button } from '@/components/ui';
import {
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
  Home,
  Users,
  X,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavMobileMenu = ({ isOpen, onClose }: NavMobileMenuProps) => {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const publicLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/marketplace', label: 'Marketplace', icon: Store },
    { to: '/feed', label: 'Social Feed', icon: Compass },
    { to: '/about', label: 'About', icon: Users },
  ];

  const displayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : user.username
    : '';

  const roleLabel =
    user?.user_type === 'farmer'
      ? 'Farmer'
      : user?.user_type === 'admin'
      ? 'Admin'
      : 'Buyer';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 bg-surface border-b border-border-strong shadow-2xl z-50 lg:hidden max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="p-4 flex flex-col gap-4">
              {/* Header with close button */}
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-state-hover focus-ring"
                  aria-label="Close mobile menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User profile card if authenticated */}
              {user ? (
                <div className="p-3.5 bg-surface-elevated/60 border border-border-subtle rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={user.profile_picture || undefined}
                      alt={displayName}
                      fallback={displayName.charAt(0)}
                      size="md"
                      className="border border-brand/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate font-display">
                        {displayName}
                      </p>
                      <p className="text-xs text-foreground-secondary truncate">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.user_type === 'farmer' ? 'brand' : 'default'} size="sm">
                    {roleLabel}
                  </Badge>
                </div>
              ) : null}

              {/* Public Exploration Links */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-1">
                  Explore
                </span>
                {publicLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                      isActive(to)
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <Icon className="h-4 w-4 text-foreground-secondary" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              {/* Authenticated Dashboard Quick Links */}
              {user ? (
                <div className="flex flex-col gap-1 pt-2 border-t border-border-subtle">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-1">
                    Your Workspace
                  </span>

                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                      isActive('/dashboard')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 text-foreground-secondary" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/messages"
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                      isActive('/messages')
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-foreground hover:bg-state-hover'
                    )}
                  >
                    <MessageSquare className="h-4 w-4 text-foreground-secondary" />
                    <span>Messages</span>
                  </Link>

                  {user.user_type === 'farmer' && (
                    <>
                      <Link
                        to="/dashboard/profile"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-foreground-secondary" />
                        <span>Farm Profile</span>
                      </Link>
                      <Link
                        to="/dashboard/products"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <Store className="h-4 w-4 text-foreground-secondary" />
                        <span>My Products</span>
                      </Link>
                      <Link
                        to="/farmer/crops"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <Sprout className="h-4 w-4 text-foreground-secondary" />
                        <span>Crop Tracking</span>
                      </Link>
                      <Link
                        to="/farmer/orders"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 text-foreground-secondary" />
                        <span>Received Orders</span>
                      </Link>
                      <Link
                        to="/farmer/posts"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <Newspaper className="h-4 w-4 text-foreground-secondary" />
                        <span>My Posts</span>
                      </Link>
                      <Link
                        to="/dashboard/analytics"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <BarChart3 className="h-4 w-4 text-foreground-secondary" />
                        <span>Sales Analytics</span>
                      </Link>
                    </>
                  )}

                  {user.user_type === 'buyer' && (
                    <>
                      <Link
                        to="/dashboard/profile"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-foreground-secondary" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/dashboard/orders"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 text-foreground-secondary" />
                        <span>My Orders</span>
                      </Link>
                    </>
                  )}

                  {user.user_type === 'admin' && (
                    <>
                      <Link
                        to="/dashboard/admin/executive"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <Activity className="h-4 w-4 text-foreground-secondary" />
                        <span>Executive Analytics</span>
                      </Link>
                      <Link
                        to="/dashboard/admin/marketplace"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 text-foreground-secondary" />
                        <span>Marketplace Analytics</span>
                      </Link>
                    </>
                  )}
                </div>
              ) : null}

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-border-subtle flex flex-col gap-2">
                <button
                  type="button"
                  onClick={toggleDark}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-state-hover transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isDark ? (
                      <Sun className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-foreground-secondary" />
                    )}
                    <span>Appearance</span>
                  </div>
                  <span className="text-xs font-medium text-foreground-secondary">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </button>

                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-danger hover:bg-danger/10 transition-colors w-full text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      fullWidth
                      onClick={() => {
                        onClose();
                        navigate('/login');
                      }}
                      className="font-bold"
                    >
                      Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="brand"
                      size="md"
                      fullWidth
                      onClick={() => {
                        onClose();
                        navigate('/register');
                      }}
                      className="font-bold shadow-brand/20"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NavMobileMenu;