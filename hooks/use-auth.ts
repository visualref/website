import { create } from 'zustand';
import { authApi } from '@/lib/api-client';
import { setToken, removeToken, getToken } from '@/lib/auth';
import type { User, LoginCredentials } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: LoginCredentials & { name: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
  reauthenticate: () => Promise<void>;
}

/**
 * Derive whether the user needs onboarding from the user object.
 * A user needs onboarding if they have no workspace OR haven't completed onboarding.
 */
function computeNeedsOnboarding(user: User | null): boolean {
  if (!user) return false;
  return !user.workspace_id || !user.onboarding_completed;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  needsOnboarding: false,

  reauthenticate: async () => {
    try {
      const token = getToken();
      if (token) {
        const user = await authApi.getMe(token);
        set({ user, needsOnboarding: computeNeedsOnboarding(user) });
      }
    } catch (error) {
      console.error('Re-authentication failed:', error);
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      setToken(response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        needsOnboarding: computeNeedsOnboarding(response.user),
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (data: LoginCredentials & { name: string }) => {
    try {
      const response = await authApi.register(data);
      setToken(response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        needsOnboarding: computeNeedsOnboarding(response.user),
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API errors on logout
    }
    removeToken();
    set({ user: null, isAuthenticated: false, needsOnboarding: false });
  },

  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ isAuthenticated: false, isLoading: false, needsOnboarding: false });
      return;
    }
    try {
      const user = await authApi.getMe(token);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        needsOnboarding: computeNeedsOnboarding(user),
      });
    } catch {
      removeToken();
      set({ user: null, isAuthenticated: false, isLoading: false, needsOnboarding: false });
    }
  },

  setUser: (user: User) => set({
    user,
    needsOnboarding: computeNeedsOnboarding(user),
  }),
}));

