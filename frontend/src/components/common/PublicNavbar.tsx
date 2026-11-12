import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/context';
import { useCart } from '@/features/buyer';
import { Container, Button } from '@/components/ui';
import {
  Menu,
  X,
  Sun,
  Moon,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import farmketLogo from '@/assets/images/farmket_logo.png';
import farmketLogoDark from '@/assets/images/farmket_logo_dark.png';
import NotificationCenter from './NotificationCenter';
import NavUserDropdown from './NavUserDropdown';
import NavMobileMenu from './NavMobileMenu';

export interface PublicNavbarProps {
  className?: string;
}

export const PublicNavbar = ({ className }: PublicNavbarProps) => {
  const { user } = useAuth();
  const { isDark, toggle: toggleDark } = useTheme();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/feed', label: 'Social' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 ease-out',
        isScrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border-subtle shadow-xs py-2 sm:py-2.5'
          : 'bg-background/60 backdrop-blur-md border-b border-transparent py-3 sm:py-3.5',
        className
      )}
    >
      <Container className="flex h-11 items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-6 lg:gap-8 shrink-0">
          <Link
            to="/"
            className="flex items-center group py-1 focus-ring rounded-lg"
            aria-label="Farmket Home"
          >
            <img
              src={farmketLogo}
              alt="Farmket"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 dark:hidden"
            />
            <img
              src={farmketLogoDark}
              alt="Farmket"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 hidden dark:block"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map(({ to, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200',
                    active
                      ? 'font-bold text-brand bg-brand/10 shadow-xs'
                      : 'font-medium text-foreground-secondary hover:text-foreground hover:bg-state-hover'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions, Theme, Cart, User Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleDark}
            aria-label="Toggle theme appearance"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:text-foreground border border-transparent hover:border-border-subtle focus-ring cursor-pointer"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <>
              {/* Notification Center */}
              <NotificationCenter />

              {/* Cart for Buyers */}
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
          ) : (
            <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border-subtle">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="brand" size="sm" className="font-bold shadow-brand/20">
                  Join Farmket
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-colors focus-ring lg:hidden ml-1 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu Overlay */}
      <NavMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default PublicNavbar;
