import { create } from 'zustand';
import { tokenStorage } from '@/lib/token';
import type { UserProfile } from '../types/auth.types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  // ─── Actions ─────────────────────────────────────────────────────────────────
  setTokens: (accessToken, refreshToken) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    tokenStorage.clearTokens();
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  /** Hydrate store from localStorage on app mount */
  initFromStorage: () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, isAuthenticated: true });
    }
  },
}));
