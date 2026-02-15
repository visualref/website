import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken } from "./auth";
import type {
  AuthResponse,
  LoginCredentials,
  User,
  Topic,
  CreateTopicPayload,
  UpdateTopicPayload,
  ContentItem,
  ContentDetail,
  AnalyticsOverview,
  ApiResponse,
  PaginatedResponse,
  QueryFilters,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Auth API
// ==========================================

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>("/api/auth/me");
    return data.data;
  },
};

// ==========================================
// Topics API
// ==========================================

export const topicsApi = {
  create: async (payload: CreateTopicPayload): Promise<Topic> => {
    const { data } = await apiClient.post<ApiResponse<Topic>>(
      "/api/topics",
      payload
    );
    return data.data;
  },

  list: async (
    filters?: QueryFilters
  ): Promise<PaginatedResponse<Topic>> => {
    const { data } = await apiClient.get<PaginatedResponse<Topic>>(
      "/api/topics",
      { params: filters }
    );
    return data;
  },

  get: async (id: string): Promise<Topic> => {
    const { data } = await apiClient.get<ApiResponse<Topic>>(
      `/api/topics/${id}`
    );
    return data.data;
  },

  update: async (id: string, payload: UpdateTopicPayload): Promise<Topic> => {
    const { data } = await apiClient.put<ApiResponse<Topic>>(
      `/api/topics/${id}`,
      payload
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/topics/${id}`);
  },
};

// ==========================================
// Content API
// ==========================================

export const contentApi = {
  list: async (
    filters?: QueryFilters
  ): Promise<PaginatedResponse<ContentItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<ContentItem>>(
      "/api/content",
      { params: filters }
    );
    return data;
  },

  get: async (id: string): Promise<ContentDetail> => {
    const { data } = await apiClient.get<ApiResponse<ContentDetail>>(
      `/api/content/${id}`
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: Partial<ContentDetail>
  ): Promise<ContentDetail> => {
    const { data } = await apiClient.put<ApiResponse<ContentDetail>>(
      `/api/content/${id}`,
      payload
    );
    return data.data;
  },

  approve: async (id: string): Promise<void> => {
    await apiClient.post(`/api/content/${id}/approve`);
  },

  reject: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/api/content/${id}/reject`, { reason });
  },

  requestChanges: async (id: string, feedback: string): Promise<void> => {
    await apiClient.post(`/api/content/${id}/request-changes`, { feedback });
  },
};

// ==========================================
// Analytics API
// ==========================================

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const { data } = await apiClient.get<ApiResponse<AnalyticsOverview>>(
      "/api/analytics/overview"
    );
    return data.data;
  },
};

export default apiClient;
