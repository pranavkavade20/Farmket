import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/context';
import { useCart } from '@/features/buyer';
import {
  Menu,
  Sun,
  Moon,
  ShoppingCart,
  Search,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import NotificationCenter from './NotificationCenter';
import NavUserDropdown from './NavUserDropdown';

export interface DashboardNavbarProps {
  onToggleMobileSidebar?: () => void;
  className?: string;
}

export const DashboardNavbar = ({
  onToggleMobileSidebar,
  className,
}: DashboardNavbarProps) => {
  const { user } = useAuth();
  const { isDark, toggle: toggleDark } = useTheme();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        'h-14 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 bg-surface/90 backdrop-blur-md border-b border-border-subtle shrink-0 z-30 transition-colors',
        className
      )}
    >
      {/* Left: Mobile Sidebar Toggle & Search Bar */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation sidebar"
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface hover:bg-state-hover text-foreground transition-colors focus-ring cursor-pointer shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crops, produce, orders..."
            className="w-full pl-9 pr-12 py-1.5 text-xs sm:text-sm bg-background border border-border-subtle rounded-xl text-foreground placeholder:text-muted/70 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 hidden sm:flex items-center pointer-events-none">
            <kbd className="text-[10px] font-semibold text-muted bg-surface-elevated border border-border-subtle px-1.5 py-0.5 rounded-md">
              ↵
            </kbd>
          </div>
        </form>
      </div>

      {/* Right: Quick actions, Theme, Cart, Notifications, User */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick link to public marketplace */}
        <Link
          to="/marketplace"
          title="Browse Public Marketplace"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-foreground-secondary hover:text-foreground hover:bg-state-hover border border-transparent hover:border-border-subtle transition-all"
        >
          <Store className="h-3.5 w-3.5 text-brand" />
          <span>Marketplace</span>
        </Link>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:text-foreground border border-transparent hover:border-border-subtle focus-ring cursor-pointer"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
        </button>

        {user && (
          <>
            {/* Notification Center */}
            <NotificationCenter />

            {/* Cart Icon for Buyers */}
            {user.user_type === 'buyer' && (
              <Link
                to="/cart"
                aria-label={`Shopping cart with ${itemCount} items`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:text-foreground relative border border-transparent hover:border-border-subtle focus-ring"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand shadow-xs">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Dropdown */}
            <div className="pl-1 sm:pl-2 ml-1 border-l border-border-subtle">
              <NavUserDropdown />
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default DashboardNavbar;
