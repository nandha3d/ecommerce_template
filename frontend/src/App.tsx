import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
const AdminLayout = React.lazy(() => import('./features/admin/AdminLayout'));
const StorefrontLayout = React.lazy(() => import('./features/storefront/StorefrontLayout'));

// Admin Pages
const Dashboard = React.lazy(() => import('./features/admin/pages/Dashboard'));
const ProductList = React.lazy(() => import('./features/admin/pages/ProductList'));
const ProductCreate = React.lazy(() => import('./features/admin/pages/ProductCreate'));
const AttributeList = React.lazy(() => import('./features/admin/pages/AttributeList'));
const OrderList = React.lazy(() => import('./features/admin/pages/OrderList'));
const OrderDetail = React.lazy(() => import('./features/admin/pages/OrderDetail'));
const RefundManagement = React.lazy(() => import('./features/admin/pages/RefundManagement'));
const ReviewModeration = React.lazy(() => import('./features/admin/pages/ReviewModeration'));

const CustomerList = React.lazy(() => import('./features/admin/pages/CustomerList'));
const CustomerProfile = React.lazy(() => import('./features/admin/pages/CustomerProfile'));
const UsersList = React.lazy(() => import('./features/admin/pages/UsersList'));
const UserDetail = React.lazy(() => import('./features/admin/pages/UserDetail'));
const UserCreate = React.lazy(() => import('./features/admin/pages/UserCreate'));
const CouponManagement = React.lazy(() => import('./features/admin/pages/CouponManagement'));
const Settings = React.lazy(() => import('./features/admin/pages/Settings'));
const InventoryManagement = React.lazy(() => import('./features/admin/pages/InventoryManagement'));
const AnalyticsPage = React.lazy(() => import('./features/admin/pages/AnalyticsPage'));
const PricingPage = React.lazy(() => import('./features/admin/pages/PricingPage'));
const GlobalizationPage = React.lazy(() => import('./features/admin/pages/GlobalizationPage'));
const ModulesPage = React.lazy(() => import('./features/admin/pages/ModulesPage'));
const SecurityPage = React.lazy(() => import('./features/admin/pages/SecurityPage'));





const Login = React.lazy(() => import('./features/admin/pages/Login'));

// Storefront Pages
const Home = React.lazy(() => import('./features/storefront/pages/Home'));
const ProductCatalog = React.lazy(() => import('./features/storefront/pages/ProductCatalog'));
const ProductDetail = React.lazy(() => import('./features/storefront/pages/ProductDetail'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex-center" style={{ height: '100vh', backgroundColor: 'var(--bg-main)' }}>Loading...</div>}>
        <Routes>
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/:id/edit" element={<ProductCreate />} />
            <Route path="attributes" element={<AttributeList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="refunds" element={<RefundManagement />} />
            <Route path="reviews" element={<ReviewModeration />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/create" element={<UserCreate />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="marketing" element={<CouponManagement />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="globalization" element={<GlobalizationPage />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="inventory" element={<InventoryManagement />} />
          </Route>

          {/* Storefront Routes */}
          <Route path="/" element={<StorefrontLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<ProductCatalog />} />
            <Route path="products/:slug" element={<ProductDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
};

export default App;
