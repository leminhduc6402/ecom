import { omitBy, isUndefined } from 'lodash';
import { fetchWithAuth, BASE_URL } from './auth.api';
import type { PaginatedResponse, Role, User } from '../types/user';

export type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  status?: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password?: string; // Optional because UI might not strictly force it everywhere, but required on create
  phoneNumber?: string;
  avatar?: string;
  roleId: number;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type UpdateUserInput = {
  name: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  avatar?: string;
  roleId: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
};

export const userApi = {
  getList: (params: GetUsersParams) => {
    // omit undefined values to avoid sending `?search=undefined`
    const searchParams = new URLSearchParams(
      omitBy(params, isUndefined) as Record<string, string>
    );
    return fetchWithAuth<PaginatedResponse<User>>(`/users?${searchParams.toString()}`);
  },

  getById: (id: number) => fetchWithAuth<User>(`/users/${id}`),

  create: (data: CreateUserInput) =>
    fetchWithAuth<User>(`/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateUserInput) =>
    fetchWithAuth<User>(`/users/${id}`, {
      method: 'PUT',
      // omit empty strings or undefined to avoid sending empty passwords
      body: JSON.stringify(omitBy(data, (v) => v === '' || v === undefined)),
    }),

  delete: (id: number) =>
    fetchWithAuth<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),

  getRoles: () => fetchWithAuth<PaginatedResponse<Role>>(`/roles?limit=100`),
};
