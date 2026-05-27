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
    onSuccess: async (data) => {
      // API chỉ trả về accessToken và refreshToken
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      try {
        // Fetch user profile immediately after getting the token
        const { profileApi } = await import('../api/profile.api');
        const userProfile = await profileApi.getMe();
        
        // Save user profile
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
        setUser(userProfile as any); // Type cast if necessary, since AuthUser in types/auth might slightly differ but has the same role.name

        message.success('Đăng nhập thành công');
        if (userProfile.role?.name?.toUpperCase() === 'ADMIN') navigate('/admin/dashboard');
        else navigate('/');
      } catch (error) {
        message.error('Lấy thông tin người dùng thất bại, vui lòng thử lại');
        clearAuth();
      }
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
      isAdmin: user?.role?.name?.toUpperCase() === 'ADMIN',
      login,
      logout,
      loginMutation,
      logoutMutation,
    }),
    [login, loginMutation, logout, logoutMutation, user],
  );
}
