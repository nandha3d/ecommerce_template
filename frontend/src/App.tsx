import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { checkAuth } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import StoreLayoutProvider from './storeLayout/StoreLayoutProvider';

// Layouts
import { MainLayout } from './components/layout';

// Config Provider
import { ConfigProvider } from './core/config/ConfigContext';

// Pages
import { HomePage, ProductsPage, ProductDetailPage } from './features/products';
import { CartPage } from './features/cart';
import { CheckoutPage } from './features/checkout';
import { LoginPage, RegisterPage } from './features/auth';
import { ProfilePage } from './features/user';
import { OrderHistoryPage } from './features/orders';
import { WishlistPage } from './features/wishlist';
import AdminThemeProvider from './features/admin/theme/AdminThemeProvider';

// Admin Pages (lazy loaded)
const AdminDashboard = React.lazy(() => import('./features/admin/pages/DashboardPage'));
const AdminProducts = React.lazy(() => import('./features/admin/pages/ProductsPage'));
const AdminOrders = React.lazy(() => import('./features/admin/pages/OrdersPage'));
const AdminLicense = React.lazy(() => import('./features/admin/pages/LicenseActivation'));
const AdminProductEdit = React.lazy(() => import('./features/admin/pages/ProductEditPage'));
const AdminCategories = React.lazy(() => import('./features/admin/pages/CategoriesPage'));
const AdminAttributes = React.lazy(() => import('./features/admin/pages/AttributesPage'));
const AdminCustomers = React.lazy(() => import('./features/admin/pages/CustomersPage'));
const AdminAnalytics = React.lazy(() => import('./features/admin/pages/AnalyticsPage'));
const AdminSettings = React.lazy(() => import('./features/admin/pages/SettingsPage'));

// Loading fallback
import { Loader } from './components/ui';

// Route Guards
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false
}) => {
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App Initializer Component
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
    dispatch(fetchCart());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Initializing..." />
      </div>
    );
  }

  return <>{children}</>;
};

import { Toaster } from 'react-hot-toast';

// ...

// Main App Component
const AppRoutes: React.FC = () => {
  return (
    <HelmetProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <StoreLayoutProvider>
        <BrowserRouter>
          <ConfigProvider>
            <AppInitializer>
              <Routes>
                {/* Public Routes with Main Layout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />


                  {/* Protected Customer Routes */}
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute requireAuth>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute requireAuth>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/wishlist"
                    element={
                      <ProtectedRoute requireAuth>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute requireAuth>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout/success"
                    element={
                      <ProtectedRoute requireAuth>
                        <div className="container mx-auto px-4 py-16 text-center">
                          <div className="text-6xl mb-4">✅</div>
                          <h1 className="text-3xl font-bold text-primary-900 mb-4">Order Placed Successfully!</h1>
                          <p className="text-neutral-600">Thank you for your order. You will receive a confirmation email shortly.</p>
                        </div>
                      </ProtectedRoute>
                    }
                  />

                  {/* Static Pages */}
                  <Route path="/pages/:slug" element={<div className="container mx-auto py-16">Static Page Content</div>} />
                </Route>

                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminThemeProvider>
                      <Routes>
                        <Route
                          path="/" // Corresponds to /admin
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading admin..." />}>
                                <AdminDashboard />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="products"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminProducts />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="products/new"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminProductEdit />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="products/:id/edit"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminProductEdit />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="orders"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminOrders />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="license"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminLicense />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="categories"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminCategories />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="attributes"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminAttributes />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="customers"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminCustomers />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="analytics"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminAnalytics />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="settings"
                          element={
                            <ProtectedRoute requireAuth requireAdmin>
                              <React.Suspense fallback={<Loader fullScreen text="Loading..." />}>
                                <AdminSettings />
                              </React.Suspense>
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </AdminThemeProvider>
                  }
                />

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-primary-900 mb-4">404</h1>
                        <p className="text-neutral-600 mb-8">Page not found</p>
                        <a href="/" className="btn-primary">Go Home</a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </AppInitializer>
          </ConfigProvider>
        </BrowserRouter>
      </StoreLayoutProvider>
    </HelmetProvider>
  );
};

const App: React.FC = () => {
  return (
    <AppRoutes />
  );
};

export default App;

