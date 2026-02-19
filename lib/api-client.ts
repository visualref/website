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

import { ContentStatus } from "@/types";

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

  if (!config.headers) {
    config.headers = {} as any;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("API Call without token:", config.url);
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
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/login",
      credentials
    );
    return data.data;
  },

  register: async (credentials: LoginCredentials & { name: string }): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/register",
      credentials
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  getMe: async (token?: string): Promise<User> => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>("/api/auth/me", config);
    return data.data.user;
  },
};

// ==========================================
// Topics API
// ==========================================

// Helper to map backend topic to frontend interface
const mapTopic = (data: any, content?: any): Topic => ({
  id: data.id,
  title: data.query || data.title, // Map query to title
  vertical_id: data.vertical_id,
  vertical: data.verticals, // Map verticals to vertical
  status: data.status,
  volume: data.volume,
  difficulty: data.difficulty,
  // Map content-related fields if available
  contentType: content?.content_type,
  priority: content?.priority, // If available in content
  keywords: data.target_keywords || [], // If available
  createdAt: data.created_at, // Map snake_case to camelCase
  updatedAt: data.updated_at,
});

export const topicsApi = {
  create: async (payload: CreateTopicPayload): Promise<Topic> => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      "/api/topics",
      payload
    );
    return mapTopic(data.data.topic || data.data);
  },

  list: async (
    filters?: QueryFilters
  ): Promise<PaginatedResponse<Topic>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<any>>>(
      "/api/topics",
      { params: filters }
    );
    return {
      ...data.data,
      data: data.data.data.map((t) => mapTopic(t)),
    };
  },

  get: async (id: string): Promise<Topic> => {
    const { data } = await apiClient.get<ApiResponse<any>>(
      `/api/topics/${id}`
    );
    // Handle { topic: ..., content: ... } response structure
    if (data.data.topic) {
      return mapTopic(data.data.topic, data.data.content);
    }
    return mapTopic(data.data);
  },

  update: async (id: string, payload: UpdateTopicPayload): Promise<Topic> => {
    const { data } = await apiClient.put<ApiResponse<any>>(
      `/api/topics/${id}`,
      payload
    );
    return mapTopic(data.data);
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
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ContentItem>>>(
      "/api/content",
      { params: filters }
    );
    return data.data;
  },



  get: async (id: string): Promise<ContentDetail> => {
    const { data } = await apiClient.get<ApiResponse<any>>(
      `/api/content/${id}`
    );

    const raw = data.data;

    // Handle nested response from backend
    if (raw.content && raw.outline) {
      // Map backend status to frontend enum
      let status = raw.content.status;
      if (status === "REVIEW") status = ContentStatus.IN_REVIEW;
      if (status === "DRAFT") status = ContentStatus.DRAFT_READY;
      if (status === "OUTLINE") status = ContentStatus.OUTLINE_READY;

      const mapOutlineNode = (node: any, level: "h2" | "h3" = "h2"): any => ({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        level,
        title: node.heading || node.title,
        children: node.subsections?.map((sub: any) => mapOutlineNode(sub, "h3")) || []
      });

      const mappedOutline = raw.outline.sections?.map((section: any) => mapOutlineNode(section, "h2")) || [];

      return {
        id: raw.content.id,
        title: raw.outline.title || raw.content.title || "Untitled",
        status: status,
        vertical_id: raw.content.vertical_id,
        vertical: raw.vertical,
        created_at: raw.content.created_at,
        updated_at: raw.content.updated_at,
        // Detailed fields
        outline: mappedOutline,
        draft: raw.draft || raw.content.draft,
        quality_score: raw.content.quality_score,
        comments: raw.content.comments || [],
        versions: raw.content.versions || [],
        coverImage: raw.content.cover_image,
      } as ContentDetail;
    }

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

  distribute: async (
    id: string,
    payload: { platforms: string[]; settings?: Record<string, any> }
  ): Promise<void> => {
    await apiClient.post(`/api/content/${id}/distribute`, payload);
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

// ==========================================
// Workspaces API
// ==========================================

export const workspacesApi = {
  create: async (payload: { name: string; description?: string }): Promise<any> => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      "/api/workspaces",
      payload
    );
    return data.data;
  },

  get: async (id: string): Promise<any> => {
    const { data } = await apiClient.get<ApiResponse<any>>(
      `/api/workspaces/${id}`
    );
    return data.data;
  },

  update: async (id: string, payload: { name?: string; description?: string }): Promise<any> => {
    const { data } = await apiClient.put<ApiResponse<any>>(
      `/api/workspaces/${id}`,
      payload
    );
    return data.data;
  },

  listContent: async (
    id: string,
    filters?: QueryFilters
  ): Promise<PaginatedResponse<ContentItem>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ContentItem>>>(
      `/api/workspaces/${id}/content`,
      { params: filters }
    );
    return data.data;
  },

  listTopics: async (
    id: string,
    filters?: QueryFilters
  ): Promise<PaginatedResponse<Topic>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Topic>>>(
      `/api/workspaces/${id}/topics`,
      { params: filters }
    );
    return data.data;
  },
};

// ==========================================
// Subscription API
// ==========================================

export const subscriptionApi = {
  get: async (workspaceId: string): Promise<any> => {
    const { data } = await apiClient.get<ApiResponse<any>>(
      "/api/subscriptions",
      { params: { workspace_id: workspaceId } }
    );
    return data.data;
  },

  createCheckout: async (payload: { workspace_id: string; plan: string; interval?: string }): Promise<any> => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      "/api/subscriptions/checkout",
      payload
    );
    return data.data;
  },

  cancel: async (workspaceId: string): Promise<void> => {
    await apiClient.post("/api/subscriptions/cancel", { workspace_id: workspaceId });
  },
};

export default apiClient;
