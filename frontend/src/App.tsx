import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, PageSkeleton } from '@/components/ui';
import { AuthProvider } from '@/features/auth';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/features/buyer';
import { ErrorBoundary } from '@/components/feedback';
import MainLayout from '@/app/layouts/MainLayout';
import AuthLayout from '@/app/layouts/AuthLayout';
import DashboardLayout from '@/app/layouts/DashboardLayout';
import { PrivateRoute, RoleRoute } from '@/routes';
import { Sprout } from 'lucide-react';



// ── Lazy pages ────────────────────────────────────────────────────────────────
const Home        = lazy(() => import('@/pages/Home'));
const About       = lazy(() => import('@/pages/About'));
const Marketplace = lazy(() => import('@/features/products/pages/Marketplace'));
const ProductDetails = lazy(() => import('@/features/products/pages/ProductDetails'));
const Login       = lazy(() => import('@/features/auth/pages/Login'));
const Register    = lazy(() => import('@/features/auth/pages/Register'));
const Dashboard   = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Cart        = lazy(() => import('@/features/buyer/pages/Cart'));
const Orders      = lazy(() => import('@/features/orders/pages/Orders'));
const OrderDetail = lazy(() => import('@/features/orders/pages/OrderDetail'));
const Chat        = lazy(() => import('@/features/chat/pages/Chat'));
const Profile     = lazy(() => import('@/features/dashboard/pages/Profile'));
const Analytics   = lazy(() => import('@/features/farmer/pages/Analytics'));
const MyProducts  = lazy(() => import('@/features/products/pages/MyProducts'));
const AddProduct  = lazy(() => import('@/features/products/pages/AddProduct'));

// New Crop Tracking
const FarmerCropDashboard = lazy(() => import('@/features/crops/pages/FarmerCropDashboard'));


// Admin Pages
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const AdminUserAnalytics = lazy(() => import('@/features/admin/pages/UserAnalytics'));
const AdminMarketplaceAnalytics = lazy(() => import('@/features/admin/pages/MarketplaceAnalytics'));
const AdminCropAnalytics = lazy(() => import('@/features/admin/pages/CropAnalytics'));
const AdminRevenueAnalytics = lazy(() => import('@/features/admin/pages/RevenueAnalytics'));

const SocialFeedPage = lazy(() => import('@/features/social/pages/SocialFeedPage'));
const FarmerMyPosts  = lazy(() => import('@/features/social/pages/MyPosts'));

const NotFound    = lazy(() => import('@/pages/NotFound'));

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppProvider>
              <Toaster position="top-center" expand={false} richColors />
              <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    {/* ── Public routes ── */}
                    <Route element={<MainLayout />}>
                      <Route index element={<Home />} />
                      <Route path="about" element={<About />} />
                      <Route path="marketplace" element={<Marketplace />} />
                      <Route path="marketplace/:id" element={<ProductDetails />} />

                      <Route path="feed" element={<SocialFeedPage />} />
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

                        {/* ── Shared Routes ── */}
                        <Route path="dashboard/profile" element={<Profile />} />
                        <Route path="messages" element={<Chat />} />

                        {/* ── Buyer Routes ── */}
                        <Route element={<RoleRoute allowedRoles={['buyer']} />}>
                          <Route path="dashboard/orders"     element={<Orders />} />
                          <Route path="dashboard/orders/:id" element={<OrderDetail />} />
                        </Route>

                        {/* ── Farmer Routes ── */}
                        <Route element={<RoleRoute allowedRoles={['farmer']} />}>
                          <Route path="dashboard/analytics" element={<Analytics />} />
                          <Route path="dashboard/products"     element={<MyProducts />} />
                          <Route path="dashboard/products/new" element={<AddProduct />} />
                          <Route path="farmer/crops" element={<FarmerCropDashboard />} />
                          <Route path="farmer/posts" element={<FarmerMyPosts />} />
                          {/* Farmers also have orders (received) */}
                          <Route path="farmer/orders"     element={<Orders />} />
                          <Route path="farmer/orders/:id" element={<OrderDetail />} />
                        </Route>

                        {/* ── Admin Routes ── */}
                        <Route element={<RoleRoute allowedRoles={['admin']} />}>
                          <Route path="dashboard/admin/executive" element={<AdminDashboard />} />
                          <Route path="dashboard/admin/users" element={<AdminUserAnalytics />} />
                          <Route path="dashboard/admin/marketplace" element={<AdminMarketplaceAnalytics />} />
                          <Route path="dashboard/admin/crops" element={<AdminCropAnalytics />} />
                          <Route path="dashboard/admin/revenue" element={<AdminRevenueAnalytics />} />
                        </Route>
                      </Route>
                      <Route element={<MainLayout />}>
                        {/* Cart (needs auth to fetch/modify) */}
                        <Route element={<RoleRoute allowedRoles={['buyer']} />}>
                          <Route path="cart" element={<Cart />} />
                        </Route>
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
