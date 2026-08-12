import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/context";
import { useCart } from "@/features/buyer";
import { Avatar } from "@/components/ui";
import {
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ShoppingCart,
  ChevronDown,
  User,
  LayoutDashboard,
  ShoppingBag,
  Store,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import logo from "@/assets/images/logo.png";
import NotificationCenter from "./NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  isDashboard?: boolean;
}

const Navbar = ({ isDashboard = false }: NavbarProps) => {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleDark } = useTheme();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const closeMobile = () => setIsMobileMenuOpen(false);
  const isActive = (path: string) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    closeMobile();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    if (isDashboard) return; // No scroll effect needed in dashboard flex layout
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={closeMobile}
      className={cn(
        "flex items-center gap-1.5 text-sm transition-all duration-300 ease-out px-4 py-2 rounded-full",
        isActive(to)
          ? "font-semibold text-foreground bg-foreground/5"
          : "font-medium text-foreground-secondary hover:text-foreground hover:bg-state-hover border border-transparent"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className={cn(
      isDashboard ? "h-14 flex items-center bg-surface border-b border-border-subtle shrink-0 px-4 md:px-6 lg:px-8" : "sticky top-0 z-50 w-full transition-all duration-300 border-b",
      !isDashboard && isScrolled ? "bg-background/80 backdrop-blur-xl border-border-subtle shadow-sm py-2" : !isDashboard && "bg-background border-transparent py-4"
    )}>
      <div className={cn("w-full flex h-14 items-center justify-between gap-4", !isDashboard && "mx-auto max-w-7xl px-6 lg:px-8")}>

        {/* Left: Logo & Main Navigation (or Search in Dashboard) */}
        <div className="flex items-center gap-8 shrink-0 flex-1">
          {!isDashboard ? (
            <>
              <Link to="/" className="flex items-center gap-3 group">
                <img src={logo} alt="Farmket Logo" className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105" />
                <span className="text-xl font-display font-bold tracking-tight text-foreground group-hover:text-brand transition-colors duration-300">
                  Farmket
                </span>
              </Link>
              <div className="hidden lg:flex items-center gap-1 ml-4">
                {navLink("/", "Home")}
                {navLink("/marketplace", "Marketplace")}
                {navLink("/feed", "Social")}
                {navLink("/about", "About")}
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-1 max-w-md">
               <div className="relative w-full">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-foreground-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                 </div>
                 <input type="text" placeholder="Search..." className="block w-full pl-9 pr-3 py-1.5 border border-border-subtle rounded-md leading-5 bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm transition-colors" />
               </div>
            </div>
          )}
        </div>

          {/* Right: User Actions */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:text-foreground border border-transparent hover:border-border-subtle"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-1 sm:gap-2 pl-2">
                <NotificationCenter />
                
                {user.user_type === 'buyer' && (
                  <Link
                    to="/cart"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-secondary transition-all hover:bg-state-hover hover:text-foreground relative border border-transparent hover:border-border-subtle"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white shadow-sm">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    )}
                  </Link>
                )}

                <div className="hidden lg:flex items-center gap-3 pl-3 ml-1 border-l border-border-subtle relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-state-hover py-1.5 px-3 rounded-full transition-colors group focus-ring border border-transparent hover:border-border-subtle"
                  >
                    <Avatar 
                      src={user.profile_picture || undefined} 
                      alt={user.first_name || user.username} 
                      size="sm" 
                    />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-semibold text-foreground transition-colors">
                        {user.first_name || user.username}
                      </span>
                      <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider">
                        {user.user_type}
                      </span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-foreground-secondary ml-1 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl shadow-md border border-border-strong overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-border-subtle bg-background">
                          <p className="text-sm font-semibold text-foreground truncate">{user.first_name || user.username}</p>
                          <p className="text-xs text-foreground-secondary truncate">{user.email}</p>
                        </div>
                        <div className="p-2 flex flex-col gap-1 bg-surface">
                          <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-state-hover transition-colors">
                            <LayoutDashboard className="h-4 w-4 text-foreground-secondary" /> Dashboard
                          </Link>
                          
                          {/* Role Specific Links */}
                          {user.user_type === 'admin' ? (
                            <Link to="/dashboard/admin/executive" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-state-hover transition-colors">
                              <Activity className="h-4 w-4 text-foreground-secondary" /> Analytics
                            </Link>
                          ) : (
                            <>
                              <Link to="/dashboard/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-state-hover transition-colors">
                                <User className="h-4 w-4 text-foreground-secondary" /> Profile
                              </Link>
                              {user.user_type === 'farmer' && (
                                <>
                                  <Link to="/dashboard/products" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-state-hover transition-colors">
                                    <Store className="h-4 w-4 text-foreground-secondary" /> My Products
                                  </Link>
                                  <Link to="/farmer/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-state-hover transition-colors">
                                    <ShoppingBag className="h-4 w-4 text-foreground-secondary" /> Orders
                                  </Link>
                                </>
                              )}
                              {user.user_type === 'buyer' && (
                                <Link to="/dashboard/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-state-hover transition-colors">
                                  <ShoppingBag className="h-4 w-4 text-foreground-secondary" /> My Orders
                                </Link>
                              )}
                            </>
                          )}
                          
                          <div className="h-px bg-border-subtle my-1" />
                          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-danger rounded-lg hover:bg-danger/10 transition-colors w-full text-left">
                            <LogOut className="h-4 w-4" /> Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2 pl-3 ml-2 border-l border-border-subtle">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden pl-2 border-l border-border-subtle ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-colors focus-ring"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
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
            className="border-t border-border-subtle bg-surface lg:hidden overflow-hidden shadow-md"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {[
                { to: "/", label: "Home" },
                { to: "/marketplace", label: "Marketplace" },
                { to: "/feed", label: "Social" },
                { to: "/about", label: "About" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMobile}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm transition-colors",
                    isActive(to) 
                      ? "bg-background border border-border-strong font-bold text-foreground shadow-sm" 
                      : "font-medium text-foreground hover:bg-state-hover border border-transparent"
                  )}
                >
                  {label}
                </Link>
              ))}

              <div className="my-2 h-px bg-border-subtle" />

              {user ? (
                <>
                  <div className="px-4 py-3 mb-2 bg-background border border-border-subtle rounded-xl flex items-center gap-3 shadow-sm">
                     <Avatar src={user.profile_picture || undefined} alt={user.first_name || user.username} size="sm" />
                     <div>
                       <p className="text-sm font-bold text-foreground">{user.first_name || user.username}</p>
                       <p className="text-[10px] text-foreground-secondary uppercase tracking-wider font-semibold">{user.user_type}</p>
                     </div>
                  </div>
                  
                  <Link to="/dashboard" onClick={closeMobile} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors">
                    <LayoutDashboard className="h-4 w-4 text-foreground-secondary" /> Dashboard
                  </Link>

                  {user.user_type === 'admin' ? (
                     <Link to="/dashboard/admin/executive" onClick={closeMobile} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors">
                       <Activity className="h-4 w-4 text-foreground-secondary" /> Analytics
                     </Link>
                  ) : (
                    <>
                      <Link to="/dashboard/profile" onClick={closeMobile} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors">
                        <User className="h-4 w-4 text-foreground-secondary" /> Profile
                      </Link>
                      {user.user_type === 'farmer' && (
                        <>
                          <Link to="/dashboard/products" onClick={closeMobile} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors">
                            <Store className="h-4 w-4 text-foreground-secondary" /> My Products
                          </Link>
                          <Link to="/farmer/orders" onClick={closeMobile} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors">
                            <ShoppingBag className="h-4 w-4 text-foreground-secondary" /> Orders
                          </Link>
                        </>
                      )}
                      {user.user_type === 'buyer' && (
                        <Link to="/dashboard/orders" onClick={closeMobile} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors">
                          <ShoppingBag className="h-4 w-4 text-foreground-secondary" /> My Orders
                        </Link>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => { toggleDark(); closeMobile(); }}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-state-hover transition-colors text-left"
                  >
                    {isDark ? <Sun className="h-4 w-4 text-foreground-secondary" /> : <Moon className="h-4 w-4 text-foreground-secondary" />} Theme
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
                  <Link to="/login" onClick={closeMobile} className="px-4 py-3 text-sm font-semibold text-foreground border border-border-strong rounded-xl text-center bg-surface hover:bg-state-hover transition-colors">
                    Log In
                  </Link>
                  <Link to="/register" onClick={closeMobile} className="px-4 py-3 text-sm font-semibold text-background bg-foreground rounded-xl text-center hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    Sign Up
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