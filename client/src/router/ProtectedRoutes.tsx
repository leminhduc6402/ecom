import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser, hasToken } from '../hooks/useAuth';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ClientRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  if (!hasToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AdminRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const user = getStoredUser();

  if (!hasToken() || user?.role?.name?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
