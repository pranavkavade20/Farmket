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
  Heart,
  Search,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import logo from "@/assets/images/logo.png";

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
        "flex items-center gap-1.5 text-sm font-bold transition-all hover:text-green-600 dark:hover:text-green-400",
        isActive(to)
          ? "text-gray-900 dark:text-white"
          : "text-gray-500 dark:text-gray-400",
      )}
    >
      {label}
      {hasDropdown && <ChevronDown className="h-4 w-4 opacity-50" />}
    </Link>
  );

  return (
    <div className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "bg-white/95 backdrop-blur-xl shadow-sm dark:bg-[#0A0A0A]/95" : "bg-white dark:bg-[#0A0A0A]"
    )}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* TOP TIER */}
        <div className="flex h-[88px] items-center justify-between border-b border-gray-100 dark:border-gray-800">
          
          {/* Left: Language & Search */}
          <div className="hidden lg:flex flex-1 items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900">
              🇺🇸 EN <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            <div className="flex w-full max-w-[280px] items-center rounded-full bg-gray-50 px-5 py-3 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus-within:border-green-500/30 focus-within:ring-2 focus-within:ring-green-500/10 transition-all">
              <Search className="h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Grocery Items..." 
                className="ml-3 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex flex-1 justify-start lg:justify-center">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Farmket Logo" className="h-10 w-10 object-contain" />
              <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                Farmket
              </span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-1 items-center justify-end gap-2 lg:gap-4">
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button className="hidden lg:flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900">
              <Heart className="h-5 w-5" /> Loved
            </button>

            {user ? (
              <>
                <Link
                  to="/cart"
                  className="group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-[#0A0A0A]">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    )}
                  </div>
                  Cart <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{itemCount}</span>
                </Link>

                <div className="hidden lg:flex items-center gap-3 pl-4">
                  <Link to="/dashboard">
                    <Button variant="outline" className="rounded-full h-11 px-5 border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                      <UserIcon className="h-4 w-4 mr-2" />
                      {user.first_name || user.username}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => void handleLogout()}
                    className="rounded-full h-11 w-11 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-3 pl-4">
                <Link to="/login">
                  <Button variant="outline" className="rounded-full h-11 px-6 border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <UserIcon className="h-4 w-4 mr-2" /> Login/Signup
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM TIER */}
        <div className="hidden lg:flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {navLink("/", "Shop")}
            {navLink("/marketplace", "Categories", true)}
            {navLink("/deals", "Deals")}
            {navLink("/marketplace?category=fresh-produce", "Fresh Produce")}
            {navLink("/about", "About")}
          </div>
          <div className="flex items-center gap-8">
            {navLink("/policy", "Policy")}
            {navLink("/faq", "FAQ's")}
            <Link to="/support" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
               Help & Support
            </Link>
          </div>
        </div>

      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-gray-100 bg-white px-4 py-6 shadow-xl dark:border-gray-800 dark:bg-[#0A0A0A] lg:hidden">
          <div className="flex flex-col gap-2">
             {/* Mobile Search */}
             <div className="mb-4 flex w-full items-center rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <Search className="h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="ml-3 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
              />
            </div>

             {[
              { to: "/", label: "Shop" },
              { to: "/marketplace", label: "Categories" },
              { to: "/deals", label: "Deals" },
              ...(user
                ? [
                    { to: "/dashboard", label: "Dashboard" },
                    { to: "/dashboard/orders", label: "My Orders" },
                  ]
                : []),
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobile}
                className="rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                {label}
              </Link>
            ))}
            
            <div className="my-4 h-px bg-gray-100 dark:bg-gray-800" />
            
            <button
              onClick={() => { toggleDark(); closeMobile(); }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            {user ? (
              <button
                onClick={() => void handleLogout()}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <Link to="/login" onClick={closeMobile}>
                  <Button variant="outline" className="w-full rounded-xl h-12 font-bold">Login</Button>
                </Link>
                <Link to="/register" onClick={closeMobile}>
                  <Button className="w-full rounded-xl h-12 bg-gray-900 font-bold hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;