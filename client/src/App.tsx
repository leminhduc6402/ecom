import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import TwoFactorSetupPage from './pages/admin/TwoFactorSetupPage';
import UsersPage from './pages/admin/UsersPage';
import UserCreatePage from './pages/admin/UserCreatePage';
import UserEditPage from './pages/admin/UserEditPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ForgotPasswordPage from './pages/client/ForgotPasswordPage';
import GoogleCallbackPage from './pages/client/GoogleCallbackPage';
import LoginPage from './pages/client/LoginPage';
import OtpVerifyPage from './pages/client/OtpVerifyPage';
import ProfileSecurityPage from './pages/client/ProfileSecurityPage';
import ClientProfilePage from './pages/client/ClientProfilePage';
import RegisterPage from './pages/client/RegisterPage';
import { AdminRoute, ClientRoute } from './router/ProtectedRoutes';

import HomePage from './pages/client/HomePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/otp" element={<OtpVerifyPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route
        path="/profile/security"
        element={
          <ClientRoute>
            <ProfileSecurityPage />
          </ClientRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <AdminRoute>
            <UserCreatePage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users/:userId/edit"
        element={
          <AdminRoute>
            <UserEditPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <AdminRoute>
            <AdminProfilePage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings/2fa"
        element={
          <AdminRoute>
            <TwoFactorSetupPage />
          </AdminRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ClientRoute>
            <ClientProfilePage />
          </ClientRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
