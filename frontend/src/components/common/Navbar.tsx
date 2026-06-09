import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/context";
import { useCart } from "@/features/buyer";
import { Button } from "@/components/ui";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  ShoppingCart,
  ChevronDown,
  MessageSquare
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLink = (to: string, label: string, hasDropdown = false) => (
    <Link
      to={to}
      onClick={closeMobile}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-all duration-300 ease-out px-3 py-2 rounded-xl",
        isActive(to)
          ? "text-brand bg-brand-muted"
          : "text-foreground-secondary hover:text-foreground hover:bg-state-hover dark:hover:bg-state-hover"
      )}
    >
      {label}
      {hasDropdown && <ChevronDown className="h-4 w-4 opacity-50" />}
    </Link>
  );

  return (
    <div className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 border-b",
      isScrolled ? "glass border-border-subtle py-2" : "bg-transparent border-transparent py-4"
    )}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Left: Logo */}
          <div className="flex items-center shrink-0 mr-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                <img src={logo} alt="Farmket Logo" className="h-10 w-10 object-contain relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight text-foreground">
                Farm<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">ket</span>
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-10">
            {navLink("/", "Home")}
            {(!user || user.user_type === 'buyer' || user.user_type === 'farmer' || user.user_type === 'admin') && (
              <>
                {navLink("/marketplace", "Marketplace")}
                {navLink("/feed", "Community")}
              </>
            )}
            {navLink("/about", "About")}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="hidden lg:flex h-10 w-10 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:scale-105 active:scale-95"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/messages"
                  title="Messages"
                  className="flex items-center justify-center h-10 w-10 rounded-full transition-all hover:bg-state-hover hover:scale-105 active:scale-95 text-foreground-secondary"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <NotificationCenter />
                {user.user_type === 'buyer' && (
                  <Link
                    to="/cart"
                    className="group flex items-center justify-center h-10 w-10 rounded-full transition-all hover:bg-state-hover hover:scale-105 active:scale-95 text-foreground-secondary"
                  >
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-surface">
                          {itemCount > 9 ? "9+" : itemCount}
                        </span>
                      )}
                    </div>
                  </Link>
                )}

                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-border-subtle ml-2">
                  <Link to="/dashboard">
                    <Button variant="outline" className="rounded-full h-10 pl-1 pr-4 bg-surface text-sm font-medium hover:bg-state-hover flex items-center gap-2 transition-all shadow-none">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover border border-border-subtle"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-brand-muted flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-brand" />
                        </div>
                      )}
                      <span>{user.first_name || user.username}</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => void handleLogout()}
                    className="rounded-full h-10 w-10 p-0 text-foreground-secondary hover:text-danger hover:bg-danger-muted transition-all hover:scale-105 active:scale-95"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3 pl-2">
                <Link to="/login">
                  <Button variant="ghost">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-state-hover text-foreground transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full w-full bg-surface/95 backdrop-blur-xl border-b border-border-subtle shadow-xl lg:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-6">
              {[
                { to: "/", label: "Home" },
                ...(!user || user.user_type === 'buyer' || user.user_type === 'farmer' || user.user_type === 'admin' ? [
                  { to: "/marketplace", label: "Marketplace" },
                  { to: "/feed", label: "Community" },
                ] : []),
                ...(user?.user_type === 'farmer' ? [
                  { to: "/dashboard/products", label: "My Products" },
                  { to: "/farmer/crops", label: "Crop Tracking" },
                  { to: "/farmer/orders", label: "Received Orders" },
                ] : []),
                { to: "/about", label: "About Platform" },
                ...(user
                  ? [
                    { to: "/dashboard", label: "Dashboard" },
                    ...(user.user_type === 'buyer' ? [{ to: "/dashboard/orders", label: "My Orders" }] : []),
                  ]
                  : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMobile}
                  className="rounded-xl px-4 py-3 text-base font-semibold text-foreground hover:bg-brand-muted hover:text-brand transition-colors"
                >
                  {label}
                </Link>
              ))}

              <div className="my-4 h-px bg-border-subtle" />

              <button
                onClick={() => { toggleDark(); closeMobile(); }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-foreground hover:bg-state-hover transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>

              {user ? (
                <button
                  onClick={() => void handleLogout()}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-danger hover:bg-danger-muted transition-colors"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <Link to="/login" onClick={closeMobile}>
                    <Button variant="outline" className="w-full rounded-xl h-12 font-bold">Login</Button>
                  </Link>
                  <Link to="/register" onClick={closeMobile}>
                    <Button variant="primary" className="w-full rounded-xl h-12 font-bold">Sign Up</Button>
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