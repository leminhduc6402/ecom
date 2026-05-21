// ─── Request Types ────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
  code?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phoneNumber: string | null;
  avatar: string | null;
  roleId: number;
  createdAt: string;
  updatedAt: string;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiFieldError {
  message: string;
  path: string;
}

export type ApiErrorResponse =
  | { message: string; errors?: Record<string, string> }
  | ApiFieldError[];
