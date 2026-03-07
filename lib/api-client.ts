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
  title: data.query || data.title,
  workspace_id: data.workspace_id,
  status: data.status,
  volume: data.volume,
  difficulty: data.difficulty,
  contentType: content?.content_type,
  priority: content?.priority,
  keywords: data.target_keywords || [],
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  contentItemId: data.content_items?.[0]?.id || content?.id,
});

export const topicsApi = {
  create: async (payload: CreateTopicPayload): Promise<Topic> => {
    let apiPayload: any = { ...payload };
    if (apiPayload.createdAt) {
      apiPayload.created_at = apiPayload.createdAt;
      delete apiPayload.createdAt;
    }
    const { data } = await apiClient.post<ApiResponse<any>>(
      "/api/topics",
      apiPayload
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
    const apiPayload: any = { ...payload };
    if (apiPayload.createdAt) {
      apiPayload.created_at = apiPayload.createdAt;
      delete apiPayload.createdAt;
    }
    const { data } = await apiClient.put<ApiResponse<any>>(
      `/api/topics/${id}`,
      apiPayload
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
  generate: async (topic_id: string): Promise<any> => {
    const { data } = await apiClient.post<ApiResponse<any>>("/api/content/generate", {
      topic_id,
    });
    return data.data;
  },

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
        children: node.subsections?.map((sub: any) => mapOutlineNode(sub, "h3")) || [],
      });

      const mappedOutline = raw.outline.sections?.map((section: any) => mapOutlineNode(section, "h2")) || [];

      return {
        id: raw.content.id,
        title: raw.outline.title || raw.content.title || "Untitled",
        status: status,
        workspace_id: raw.content.workspace_id,
        created_at: raw.content.created_at,
        updated_at: raw.content.updated_at,
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
    await apiClient.post(`/api/content/${id}/approve`, {});
  },

  reject: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/api/content/${id}/reject`, { feedback: reason });
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

// Helper to map backend analytics to frontend interface
const mapAnalytics = (data: any): AnalyticsOverview => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysLeft = daysInMonth - currentDate.getDate();

  const statusColors: Record<string, string> = {
    "draft": "#94a3b8", // slate-400
    "review": "#f59e0b", // amber-500
    "approved": "#22c55e", // green-500
    "published": "#3b82f6", // blue-500
    "rejected": "#ef4444", // red-500
  };

  return {
    totalContent: data.total_content || 0,
    totalContentChange: 0,
    inReviewQueue: data.in_review || 0,
    highPriorityCount: 0,
    approvalRate: data.approval_rate || 0,
    approvalRateChange: 0,
    monthlyGoalPercent: 0,
    daysLeft: daysLeft,
    statusDistribution: (data.content_by_status || []).map((s: any) => ({
      status: s.status,
      count: s.count,
      color: statusColors[s.status.toLowerCase()] || "#cbd5e1",
    })),
    recentActivity: [],
  };
};

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const { data } = await apiClient.get<ApiResponse<any>>(
      "/api/analytics/overview"
    );
    return mapAnalytics(data.data);
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

// ==========================================
// Onboarding API
// ==========================================

import type { ScrapedData, WorkspaceProfile, Competitor } from "@/types";

export const onboardingApi = {
  scrapeUrl: async (url: string): Promise<{ scraped_data: ScrapedData }> => {
    const { data } = await apiClient.post<ApiResponse<{ scraped_data: ScrapedData }>>(
      "/api/onboarding/scrape",
      { url }
    );
    return data.data;
  },

  generateDescription: async (
    scraped_data: Record<string, any>,
    company_url: string
  ): Promise<{ description: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ description: string }>>(
      "/api/onboarding/generate-description",
      { scraped_data, company_url }
    );
    return data.data;
  },

  getProfile: async (): Promise<{ profile: WorkspaceProfile | null }> => {
    const { data } = await apiClient.get<ApiResponse<{ profile: WorkspaceProfile | null }>>(
      "/api/onboarding/profile"
    );
    return data.data;
  },

  upsertProfile: async (
    payload: Partial<Omit<WorkspaceProfile, "id" | "workspace_id" | "created_at" | "updated_at" | "onboarding_completed">> & { onboarding_step?: string }
  ): Promise<{ profile: WorkspaceProfile }> => {
    const { data } = await apiClient.post<ApiResponse<{ profile: WorkspaceProfile }>>(
      "/api/onboarding/profile",
      payload
    );
    return data.data;
  },

  completeOnboarding: async (): Promise<{ profile: WorkspaceProfile }> => {
    const { data } = await apiClient.post<ApiResponse<{ profile: WorkspaceProfile }>>(
      "/api/onboarding/complete"
    );
    return data.data;
  },

  identifyCompetitors: async (
    company_url: string,
    company_name: string,
    description: string
  ): Promise<{ competitors: Array<{ name: string; url: string; description: string }> }> => {
    const { data } = await apiClient.post<
      ApiResponse<{ competitors: Array<{ name: string; url: string; description: string }> }>
    >("/api/onboarding/identify-competitors", {
      company_url,
      company_name,
      description,
    });
    return data.data;
  },
};

// ==========================================
// Competitors API
// ==========================================

export const competitorsApi = {
  create: async (payload: { name: string; url?: string; notes?: string }): Promise<{ competitor: Competitor }> => {
    const { data } = await apiClient.post<ApiResponse<{ competitor: Competitor }>>(
      "/api/competitors",
      payload
    );
    return data.data;
  },

  list: async (): Promise<{ competitors: Competitor[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ competitors: Competitor[] }>>(
      "/api/competitors"
    );
    return data.data;
  },

  update: async (id: string, payload: { name?: string; url?: string; notes?: string }): Promise<{ competitor: Competitor }> => {
    const { data } = await apiClient.put<ApiResponse<{ competitor: Competitor }>>(
      `/api/competitors/${id}`,
      payload
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/competitors/${id}`);
  },
};

// ==========================================
// Integrations API
// ==========================================

export const integrationsApi = {
  get: async (): Promise<{ integrations: any[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ integrations: any[] }>>(
      "/api/integrations"
    );
    return data.data;
  },

  verify: async (payload: { platform: string; credentials: any }): Promise<{ valid: boolean }> => {
    const { data } = await apiClient.post<ApiResponse<{ valid: boolean }>>(
      "/api/integrations/verify",
      payload
    );
    return data.data;
  },

  save: async (payload: { platform: string; credentials: any }): Promise<{ integration: any }> => {
    const { data } = await apiClient.post<ApiResponse<{ integration: any }>>(
      "/api/integrations/save",
      payload
    );
    return data.data;
  },

  delete: async (platform: string): Promise<void> => {
    await apiClient.delete(`/api/integrations/${platform}`);
  },
};

export default apiClient;
