import { create } from 'zustand';
import { authApi } from '@/lib/api-client';
import { setToken, removeToken, getToken } from '@/lib/auth';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
  sendOtp: (email: string) => Promise<{ cooldown_remaining: number }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
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

  sendOtp: async (email: string) => {
    return authApi.sendOtp(email);
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await authApi.verifyOtp(email, otp);
      setToken(response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        needsOnboarding: computeNeedsOnboarding(response.user),
      });
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  },

  googleLogin: async (idToken: string) => {
    try {
      const response = await authApi.googleLogin(idToken);
      setToken(response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        needsOnboarding: computeNeedsOnboarding(response.user),
      });
    } catch (error) {
      console.error('Google login failed:', error);
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
