import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import TwoFactorSetupPage from './pages/admin/TwoFactorSetupPage';
import ForgotPasswordPage from './pages/client/ForgotPasswordPage';
import GoogleCallbackPage from './pages/client/GoogleCallbackPage';
import LoginPage from './pages/client/LoginPage';
import OtpVerifyPage from './pages/client/OtpVerifyPage';
import ProfileSecurityPage from './pages/client/ProfileSecurityPage';
import RegisterPage from './pages/client/RegisterPage';
import { AdminRoute, ClientRoute } from './router/ProtectedRoutes';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
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
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboardPage />
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
