import { create } from "zustand";
import { authApi } from "@/lib/api-client";
import { setToken, removeToken, getToken } from "@/lib/auth";
import type { User, LoginCredentials } from "@/types";

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  get needsOnboarding() {
    const user = get().user;
    return !!user && !user.workspace_id;
  },

  reauthenticate: async () => {
    try {
      const token = getToken();
      if (token) {
        const user = await authApi.getMe(token);
        set({ user });
      }
    } catch (error) {
      console.error("Re-authentication failed:", error);
      // Don't log out, just fail gracefully
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      setToken(response.token);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  register: async (data: LoginCredentials & { name: string }) => {
    try {
      const response = await authApi.register(data);
      setToken(response.token);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      console.error("Registration failed:", error);
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
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const user = await authApi.getMe(token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token invalid or API error - log out
      removeToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User) => set({ user }),
}));
