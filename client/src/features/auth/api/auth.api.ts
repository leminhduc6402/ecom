import apiClient from '@/lib/axios';
import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserProfile,
} from '../types/auth.types';

export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', data).then((res) => res.data);
  },

  logout(data: LogoutRequest): Promise<void> {
    return apiClient.post('/auth/logout', data).then(() => undefined);
  },

  refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return apiClient
      .post<RefreshTokenResponse>('/auth/refresh-token', data)
      .then((res) => res.data);
  },

  getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/profile').then((res) => res.data);
  },

  getGoogleAuthUrl(): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>('/auth/google-link').then((res) => res.data);
  },
};
