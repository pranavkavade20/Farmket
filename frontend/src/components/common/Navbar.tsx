import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/context";
import { useCart } from "@/features/buyer";
import { Button, Avatar } from "@/components/ui";
import {
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ShoppingCart,
  ChevronDown,
  Search,
  MapPin,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import logo from "@/assets/images/logo.png";
import NotificationCenter from "./NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleDark } = useTheme();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMobile = () => setIsMobileMenuOpen(false);
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    closeMobile();
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={closeMobile}
      className={cn(
        "flex items-center gap-1.5 text-[15px] font-medium transition-all duration-300 ease-out px-3 py-2 rounded-lg",
        isActive(to)
          ? "text-brand bg-brand/10 dark:bg-brand/20"
          : "text-foreground-secondary hover:text-foreground hover:bg-state-hover"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 border-b",
      isScrolled ? "bg-surface/90 backdrop-blur-xl border-border-subtle shadow-sm py-2" : "bg-background border-transparent py-4"
    )}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Left: Logo & Main Navigation */}
          <div className="flex items-center gap-6 xl:gap-10 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                <img src={logo} alt="Farmket Logo" className="h-8 w-8 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-foreground">
                Farm<span className="text-brand">ket</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLink("/", "Home")}
              {navLink("/marketplace", "Marketplace")}
              {navLink("/farmers", "Farmers")}
              {navLink("/how-it-works", "How It Works")}
            </div>
          </div>

          {/* Center: Search & Location */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="flex w-full items-center bg-surface border border-border-subtle rounded-full overflow-hidden shadow-sm transition-all focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20">
              <div className="flex-1 flex items-center px-4 py-2 border-r border-border-subtle group">
                <Search className="h-4 w-4 text-muted group-focus-within:text-brand transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search fresh products..." 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm px-2 text-foreground placeholder:text-muted"
                />
              </div>
              <div className="flex-[0.7] hidden lg:flex items-center px-4 py-2 group">
                <MapPin className="h-4 w-4 text-muted group-focus-within:text-brand transition-colors" />
                <input 
                  type="text" 
                  placeholder="Location" 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm px-2 text-foreground placeholder:text-muted"
                />
              </div>
              <button className="bg-brand text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-hover transition-colors rounded-r-full">
                Search
              </button>
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center justify-end gap-2 xl:gap-3 shrink-0">
            
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:text-foreground"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/favorites"
                  className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:text-danger"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                
                <NotificationCenter />
                
                {user.user_type === 'buyer' && (
                  <Link
                    to="/cart"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:text-foreground relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-surface">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    )}
                  </Link>
                )}

                <div className="hidden lg:flex items-center gap-3 pl-3 ml-1 border-l border-border-subtle">
                  <Link to="/dashboard" className="flex items-center gap-2 hover:bg-state-hover py-1.5 px-3 rounded-full transition-colors group">
                    <Avatar 
                      src={user.profile_picture || undefined} 
                      alt={user.first_name || user.username} 
                      size="sm" 
                    />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
                        {user.first_name || user.username}
                      </span>
                      <span className="text-[11px] font-medium text-foreground-secondary uppercase tracking-wider">
                        {user.user_type}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted ml-1 group-hover:text-foreground transition-colors" />
                  </Link>
                  
                  {user.user_type === 'farmer' ? (
                    <Button variant="primary" size="sm" className="hidden xl:flex">Sell Products</Button>
                  ) : (
                    <Button variant="outline" size="sm" className="hidden xl:flex border-brand text-brand hover:bg-brand hover:text-white">Browse Market</Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3 pl-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="font-semibold rounded-full shadow-sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-state-hover text-foreground transition-colors focus-ring"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border-subtle bg-surface lg:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              <div className="mb-4">
                <div className="flex items-center bg-background border border-border-subtle rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-muted mr-2" />
                  <input type="text" placeholder="Search products..." className="w-full bg-transparent border-none text-sm text-foreground focus:ring-0" />
                </div>
              </div>

              {[
                { to: "/", label: "Home" },
                { to: "/marketplace", label: "Marketplace" },
                { to: "/farmers", label: "Farmers" },
                { to: "/how-it-works", label: "How It Works" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMobile}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-brand/10 hover:text-brand transition-colors"
                >
                  {label}
                </Link>
              ))}

              <div className="my-2 h-px bg-border-subtle" />

              {user ? (
                <>
                  <Link to="/dashboard" onClick={closeMobile} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors">
                    <Avatar src={user.profile_picture || undefined} alt={user.first_name || user.username} size="sm" />
                    Dashboard
                  </Link>
                  <Link to="/favorites" onClick={closeMobile} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors">
                    <Heart className="h-4 w-4" /> Favorites
                  </Link>
                  <button
                    onClick={() => { toggleDark(); closeMobile(); }}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors text-left"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Theme
                  </button>
                  <button
                    onClick={() => void handleLogout()}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors text-left mt-2"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  <Link to="/login" onClick={closeMobile}>
                    <Button variant="outline" className="w-full justify-center rounded-lg">Log In</Button>
                  </Link>
                  <Link to="/register" onClick={closeMobile}>
                    <Button variant="primary" className="w-full justify-center rounded-lg">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;