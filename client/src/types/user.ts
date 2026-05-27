export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends Omit<User, 'role'> {
  role: Role;
  isTotpEnabled: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}
