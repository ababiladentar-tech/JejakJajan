import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './context/store';
import { authService } from './services/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BuyerMapPage from './pages/BuyerMapPage';
import VendorDetailPage from './pages/VendorDetailPage';
import VendorDashboard from './pages/VendorDashboard';
import VendorMenuPage from './pages/VendorMenuPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendorsPage from './pages/AdminVendorsPage';
import AdminBuyersPage from './pages/AdminBuyersPage';
import Toast from './components/Toast';
import './index.css';

export default function App() {
  const { isAuthenticated, user, setUser } = useAuthStore();

  useEffect(() => {
    // Check auth status on mount
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      useAuthStore.setState({ token, isAuthenticated: true });
    }
  }, []);

  // fetch profile when token is set but user missing
  useEffect(() => {
    if (isAuthenticated && !user) {
      authService
        .getProfile()
        .then((res) => setUser(res.data.user))
        .catch((err) => console.error('Failed to fetch profile', err));
    }
  }, [isAuthenticated, user, setUser]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Toast />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Buyer Routes */}
        <Route
          path="/buyer/map"
          element={isAuthenticated && user?.role === 'BUYER' ? <BuyerMapPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/vendor/:vendorId"
          element={isAuthenticated ? <VendorDetailPage /> : <Navigate to="/login" />}
        />

        {/* Vendor Routes */}
        {isAuthenticated && user?.role === 'VENDOR' && (
          <>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/menus" element={<VendorMenuPage />} />
          </>
        )}

        {/* Admin Routes */}
        {isAuthenticated && user?.role === 'ADMIN' && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vendors" element={<AdminVendorsPage />} />
            <Route path="/admin/buyers" element={<AdminBuyersPage />} />
          </>
        )}

        {/* Fallback */}
        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? user?.role === 'VENDOR'
                    ? '/vendor/dashboard'
                    : user?.role === 'ADMIN'
                    ? '/admin/dashboard'
                    : '/buyer/map'
                  : '/login'
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}
