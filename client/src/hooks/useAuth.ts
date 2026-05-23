import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { authApi } from '../api/auth.api';
import type { LoginInput } from '../schemas/auth.schema';
import type { AuthResponse, AuthUser } from '../types/auth';

const USER_STORAGE_KEY = 'authUser';

function readUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function persistAuth(data: AuthResponse) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getStoredUser() {
  return readUser();
}

export function hasToken() {
  return Boolean(localStorage.getItem('accessToken'));
}

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => readUser());

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (data) => {
      persistAuth(data);
      setUser(data.user);
      message.success('Đăng nhập thành công');
      if (data.user.role.name === 'Admin') navigate('/admin/dashboard');
      else navigate('/profile/security');
    },
    onError: (err: Error) => {
      message.error(err.message || 'Đăng nhập thất bại');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(localStorage.getItem('refreshToken') || ''),
    onSettled: () => {
      clearAuth();
      setUser(null);
      navigate('/login');
    },
  });

  const login = useCallback((values: LoginInput) => loginMutation.mutate(values), [loginMutation]);
  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: hasToken(),
      isAdmin: user?.role.name === 'Admin',
      login,
      logout,
      loginMutation,
      logoutMutation,
    }),
    [login, loginMutation, logout, logoutMutation, user],
  );
}
