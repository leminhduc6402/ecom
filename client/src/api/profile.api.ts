import { fetchWithAuth } from './auth.api';
import type { Profile } from '../types/user';

export type UpdateProfileInput = {
  name: string;
  phoneNumber?: string;
  avatar?: string;
};

export type ChangePasswordInput = {
  currentPassword?: string;
  newPassword?: string;
};

export const profileApi = {
  getMe: () => fetchWithAuth<Profile>(`/profile`),

  update: (data: UpdateProfileInput) =>
    fetchWithAuth<Profile>(`/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordInput) =>
    fetchWithAuth<{ message: string }>(`/profile/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
