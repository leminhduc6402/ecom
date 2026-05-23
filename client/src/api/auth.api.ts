import { omit } from 'lodash';
import type {
  DisableTwoFactorInput,
  ForgotPasswordInput,
  LoginInput,
  OtpInput,
  RegisterInput,
  TwoFactorCodeInput,
} from '../schemas/auth.schema';
import type { AuthResponse, TwoFactorSetupResponse } from '../types/auth';

export const BASE_URL = 'http://localhost:3000';

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, payload?: ApiErrorPayload) {
    const fallback = status ? `Request failed with status ${status}` : 'Request failed';
    const message = Array.isArray(payload?.message)
      ? payload?.message.join(', ')
      : payload?.message || payload?.error || fallback;
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const payload = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, payload);
  }

  return payload as T;
}

function buildHeaders(headers?: HeadersInit, authorized = false): HeadersInit {
  const nextHeaders = new Headers(headers);
  nextHeaders.set('Content-Type', 'application/json');

  if (authorized) {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) nextHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  return nextHeaders;
}

export async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const request = () =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(options.headers, true),
    });

  let res = await request();

  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new ApiError(401, { message: 'Phiên đăng nhập đã hết hạn' });

    const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
    const refreshData = await parseResponse<{ accessToken: string; refreshToken?: string }>(refreshRes);

    localStorage.setItem('accessToken', refreshData.accessToken);
    if (refreshData.refreshToken) localStorage.setItem('refreshToken', refreshData.refreshToken);
    res = await request();
  }

  return parseResponse<T>(res);
}

function publicRequest<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return fetch(`${BASE_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    ...init,
    headers: buildHeaders(init?.headers),
    body: body ? JSON.stringify(body) : undefined,
  }).then(parseResponse<T>);
}

export const authApi = {
  login: (body: LoginInput) => publicRequest<AuthResponse>('/auth/login', body),
  register: (body: RegisterInput) => publicRequest<{ message?: string }>('/auth/register', omit(body, ['confirmPassword'])),
  verifyOtp: (body: OtpInput) => publicRequest<{ message?: string; resetToken?: string }>('/auth/otp', body),
  resendOtp: (body: Pick<OtpInput, 'email' | 'type'>) => publicRequest<{ message?: string }>('/auth/otp/resend', body),
  forgotPassword: (body: ForgotPasswordInput) => publicRequest<{ message?: string }>('/auth/forgot-password', body),
  getGoogleLink: () => publicRequest<{ data?: { url?: string }; url?: string }>('/auth/google-link'),
  refreshToken: (refreshToken: string) => publicRequest<{ accessToken: string; refreshToken?: string }>('/auth/refresh-token', { refreshToken }),
  logout: (refreshToken: string) => publicRequest<{ message?: string }>('/auth/logout', { refreshToken }),
  setupTwoFactor: () =>
    fetchWithAuth<TwoFactorSetupResponse>('/auth/2fa/setup', {
      method: 'POST',
    }),
  confirmTwoFactorSetup: (body: TwoFactorCodeInput) =>
    fetchWithAuth<{ message?: string }>('/auth/2fa/setup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  disableTwoFactor: (body: DisableTwoFactorInput) =>
    fetchWithAuth<{ message?: string }>('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
