import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/store/AuthContext';
import { AppProvider } from '@/store/AppContext';
import { ThemeProvider } from '@/store/ThemeContext';
import { CartProvider } from '@/store/CartContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import PrivateRoute from '@/components/PrivateRoute';
import { Sprout } from 'lucide-react';

// ── Lazy pages ────────────────────────────────────────────────────────────────
const Home        = lazy(() => import('@/pages/Home'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const Login       = lazy(() => import('@/pages/Login'));
const Register    = lazy(() => import('@/pages/Register'));
const Dashboard   = lazy(() => import('@/pages/Dashboard'));
const Cart        = lazy(() => import('@/pages/Cart'));
const Orders      = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const Chat        = lazy(() => import('@/pages/Chat'));
const Profile     = lazy(() => import('@/pages/Profile'));
const Analytics   = lazy(() => import('@/pages/Analytics'));
const MyProducts  = lazy(() => import('@/pages/MyProducts'));
const AddProduct  = lazy(() => import('@/pages/AddProduct'));
const NotFound    = lazy(() => import('@/pages/NotFound'));

const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <Sprout className="h-10 w-10 animate-pulse text-green-600 dark:text-green-500" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* ThemeProvider outermost so .dark class is on <html> before any paint */}
      <ThemeProvider>
        <AuthProvider>
          {/* CartProvider needs AuthProvider (reads user to load cart) */}
          <CartProvider>
            <AppProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,.1)',
                  },
                  success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                  error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* ── Public routes ── */}
                    <Route element={<MainLayout />}>
                      <Route index element={<Home />} />
                      <Route path="marketplace" element={<Marketplace />} />
                      <Route path="marketplace/:id" element={<ProductDetails />} />
                    </Route>

                    {/* ── Auth routes ── */}
                    <Route element={<AuthLayout />}>
                      <Route path="login"    element={<Login />} />
                      <Route path="register" element={<Register />} />
                    </Route>

                    {/* ── Protected routes ── */}
                    <Route element={<PrivateRoute />}>
                      <Route element={<DashboardLayout />}>
                        {/* Dashboard home */}
                        <Route path="dashboard" element={<Dashboard />} />

                        {/* Orders */}
                        <Route path="dashboard/orders"     element={<Orders />} />
                        <Route path="dashboard/orders/:id" element={<OrderDetail />} />

                        {/* Profile */}
                        <Route path="dashboard/profile" element={<Profile />} />

                        {/* Analytics (farmer) */}
                        <Route path="dashboard/analytics" element={<Analytics />} />

                        {/* Farmer Products */}
                        <Route path="dashboard/products"     element={<MyProducts />} />
                        <Route path="dashboard/products/new" element={<AddProduct />} />

                        {/* Messages / Chat */}
                        <Route path="messages" element={<Chat />} />
                      </Route>
                      <Route element={<MainLayout />}>
                        {/* Cart (needs auth to fetch/modify) */}
                        <Route path="cart" element={<Cart />} />
                      </Route>
                    </Route>

                    {/* ── Fallbacks ── */}
                    <Route path="404" element={<NotFound />} />
                    <Route path="*"   element={<Navigate to="/404" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </AppProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
