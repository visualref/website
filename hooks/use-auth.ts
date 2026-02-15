import { create } from "zustand";
import { authApi } from "@/lib/api-client";
import { setToken, removeToken, getToken } from "@/lib/auth";
import type { User, LoginCredentials } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

// Mock user for demo purposes (no backend)
const MOCK_USER: User = {
  id: "1",
  name: "Alex Morgan",
  email: "alex@contentiq.io",
  role: "admin",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2PlZl1e1qSvavYP8LTJ2IaBZ7ywBAfoVy5LD1X5ZR2hpQ-UUZgjysJnYSoSrr3-CSDblJ715_1iG80omiB49ez744JtmOG8g80PtLq78ozQwpVwqD-WjLBCmREs1x41eynIinZaPJzVMwBhL0Q6tfed7-tLEYl1DFLzTB0lDFy4YHS0TQxxtSTnH9mOaMFZQiq8M6Auz4fSLPb5dHtw8s1a708E-WCieDhUSoov6aOC2LZ9vCJhvkttsid5r8ylXdNUPQwayW80w",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials: LoginCredentials) => {
    try {
      // Try real API first, fallback to mock
      try {
        const response = await authApi.login(credentials);
        setToken(response.token);
        set({ user: response.user, isAuthenticated: true });
      } catch {
        // Mock login for demo
        if (
          credentials.email === "admin@geo.com" &&
          credentials.password === "password123"
        ) {
          setToken("mock-jwt-token-" + Date.now());
          set({ user: MOCK_USER, isAuthenticated: true });
        } else {
          throw new Error("Invalid credentials");
        }
      }
    } catch (error) {
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
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token exists but API unavailable, use mock
      set({ user: MOCK_USER, isAuthenticated: true, isLoading: false });
    }
  },

  setUser: (user: User) => set({ user }),
}));
