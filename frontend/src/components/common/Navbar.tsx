import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/context";
import { useCart } from "@/features/buyer";
import { Button } from "@/components/ui";
import {
  Sprout,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  ShoppingCart,
  MessageSquare,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import logo from "@/assets/images/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleDark } = useTheme();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMobile = () => setIsMobileMenuOpen(false);
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    closeMobile();
    navigate("/login");
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={closeMobile}
      className={cn(
        "text-sm font-medium transition-colors hover:text-green-600 dark:hover:text-green-500",
        isActive(to)
          ? "text-green-600 dark:text-green-500"
          : "text-gray-600 dark:text-gray-300",
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-[#F8FAFC]/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Farmket Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Farmket
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLink("/", "Home")}
            {navLink("/marketplace", "Marketplace")}

            <div className="ml-2 flex items-center gap-2">
              {/* Dark mode */}
              <button
                onClick={toggleDark}
                aria-label="Toggle dark mode"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {user ? (
                <>
                  {/* Cart */}
                  <Link
                    to="/cart"
                    aria-label={`Cart (${itemCount} items)`}
                    className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-600 text-[10px] font-bold text-white flex items-center justify-center">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    )}
                  </Link>

                  {/* Messages */}
                  <Link
                    to="/messages"
                    aria-label="Messages"
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Link>

                  {/* Analytics (farmers only) */}
                  {user.user_type === "farmer" && (
                    <Link
                      to="/dashboard/analytics"
                      aria-label="Analytics"
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Link>
                  )}

                  {/* Dashboard */}
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <UserIcon className="h-4 w-4" />
                      {user.first_name || user.username}
                    </Button>
                  </Link>

                  {/* Logout */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleLogout()}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register?type=farmer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:inline-flex border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400"
                    >
                      Sell Produce
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile: cart + burger */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-500 dark:text-gray-400"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:hover:bg-gray-800"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {[
              { to: "/", label: "Home" },
              { to: "/marketplace", label: "Marketplace" },
              ...(user
                ? [
                    { to: "/dashboard", label: "Dashboard" },
                    { to: "/dashboard/orders", label: "My Orders" },
                    { to: "/messages", label: "Messages" },
                    { to: "/dashboard/profile", label: "Profile" },
                    ...(user.user_type === "farmer"
                      ? [{ to: "/dashboard/analytics", label: "Analytics" }]
                      : []),
                  ]
                : []),
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobile}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-500"
              >
                {label}
              </Link>
            ))}

            {/* Dark mode toggle row */}
            <button
              onClick={() => {
                toggleDark();
                closeMobile();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            {user ? (
              <button
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={closeMobile} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMobile} className="flex-1">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
