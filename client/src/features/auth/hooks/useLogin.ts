import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { LoginRequest } from '../types/auth.types';
import type { ApiFieldError } from '../types/auth.types';

export interface LoginError {
  fieldErrors: Record<string, string>;
  message: string;
}

function parseLoginError(error: unknown): LoginError {
  const result: LoginError = { fieldErrors: {}, message: 'Đăng nhập thất bại. Vui lòng thử lại.' };

  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (!data) return result;

    // Server trả mảng field errors: [{ message, path }]
    if (Array.isArray(data)) {
      (data as ApiFieldError[]).forEach(({ path, message }) => {
        result.fieldErrors[path] = message;
      });
      result.message = 'Vui lòng kiểm tra lại thông tin đã nhập.';
      return result;
    }

    // Server trả object: { message: string }
    if (typeof data.message === 'string') {
      result.message = data.message;
    }
  }

  return result;
}

export function useLogin() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),

    onSuccess: async ({ accessToken, refreshToken }) => {
      setTokens(accessToken, refreshToken);

      try {
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch {
        // profile fetch failing shouldn't block login
      }

      router.push('/dashboard');
    },

    onError: (error: unknown) => parseLoginError(error),
  });
}
