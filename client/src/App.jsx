import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { FavouriteProvider } from './context/FavouriteContext';
import { CartProvider } from './context/CartContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Components & Guards
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import ProductDetails from './pages/ProductDetails';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Dashboard from './pages/Dashboard';
import MyProducts from './pages/MyProducts';
import Favourites from './pages/Favourites';
import Inquiries from './pages/Inquiries';
import InquiryDetails from './pages/InquiryDetails';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <FavouriteProvider>
        <CartProvider>
          <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#292D32',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                border: '1px solid #E5E0D7',
              },
              success: {
                iconTheme: {
                  primary: '#B9A58A',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />

          <Routes>
            {/* Dedicated Auth Routes (No Navbar, No Marketplace Content) */}
            <Route element={<AuthLayout />}>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />
            </Route>

            {/* Protected Marketplace Routes with MainLayout (Navbar + Footer) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="browse" element={<Browse />} />
              <Route path="cart" element={<Cart />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="edit-product/:id" element={<EditProduct />} />
            </Route>

            {/* Student Dashboard Routes (Protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="my-products" element={<MyProducts />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="inquiries/:id" element={<InquiryDetails />} />
            </Route>

            {/* Standalone Dashboard Layout items also mapped to root paths */}
            <Route
              path="/favourites"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Favourites />} />
            </Route>

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Profile />} />
            </Route>

            {/* Inquiries and products direct path aliases (Protected) */}
            <Route path="/inquiries" element={<Navigate to="/dashboard/inquiries" replace />} />
            <Route path="/inquiries/:id" element={<Navigate to="/dashboard/inquiries/:id" replace />} />
            <Route path="/my-products" element={<Navigate to="/dashboard/my-products" replace />} />

            {/* Redirect any legacy admin path attempts to home */}
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="/admin/*" element={<Navigate to="/" replace />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </CartProvider>
      </FavouriteProvider>
    </AuthProvider>
  );
}

export default App;
