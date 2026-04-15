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

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/google",
      { idToken }
    );
    return data.data;
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

  regenerate: async (id: string): Promise<void> => {
    await apiClient.post(`/api/content/${id}/regenerate`, {});
  },

  listImages: async (id: string): Promise<{ images: ContentImage[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ images: ContentImage[] }>>(
      `/api/content/${id}/images`
    );
    return data.data;
  },

  uploadImage: async (id: string, file: File): Promise<{ image: ContentImage }> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<ApiResponse<{ image: ContentImage }>>(
      `/api/content/${id}/images`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  setCover: async (id: string, imageId: string): Promise<void> => {
    await apiClient.patch(`/api/content/${id}/cover`, { imageId });
  },
};

export interface ContentImage {
  id: string;
  content_item_id: string;
  image_url: string;
  thumbnail_url: string | null;
  source: "upload" | "generated";
  created_at: string;
}

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
    recentActivity: (data.recent_activity || []).map((e: any) => ({
      id: e.id,
      type: e.type,
      contentItemId: e.content_item_id,
      topicText: e.topic_text,
      actor: e.actor,
      metadata: e.metadata,
      timestamp: e.created_at,
    })),
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

  getGoogleAuthUrl: async (): Promise<{ url: string }> => {
    const { data } = await apiClient.get<ApiResponse<{ url: string }>>(
      "/api/integrations/google/auth-url"
    );
    return data.data;
  },

  getGoogleDetails: async (): Promise<{ details: any }> => {
    const { data } = await apiClient.get<ApiResponse<{ details: any }>>(
      "/api/integrations/google/details"
    );
    return data.data;
  },

  getGoogleAnalytics: async (params: { siteUrl: string; startDate?: string; endDate?: string }): Promise<{ analytics: any }> => {
    const { data } = await apiClient.get<ApiResponse<{ analytics: any }>>(
      "/api/integrations/google/analytics",
      { params }
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
    await apiClient.delete(`/api/integrations/${encodeURIComponent(platform)}`);
  },
};

// ==========================================
// Reddit Bot API
// ==========================================

export interface RedditKeyword {
  id: string;
  keyword: string;
  is_active: boolean;
  crawled_at: string | null;
  crawl_count: number;
  last_result: { posts_matched?: number; subreddits_scanned?: number } | null;
  created_at: string;
  updated_at: string;
}

export interface RedditSubreddit {
  id: string;
  subreddit_name: string;
  is_active: boolean;
  crawled_at: string | null;
  crawl_count: number;
  last_result: { relevant?: number; posts_found?: number } | null;
  created_at: string;
  updated_at: string;
}

export interface RedditPost {
  id: string;
  reddit_post_id: string;
  subreddit: string;
  title: string;
  body: string;
  author: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: string;
  matched_keyword: string | null;
  relevance_score: number;
  is_processed: boolean;
  discovered_at: string;
  created_at: string;
}

export interface RedditResponse {
  id: string;
  post_id: string;
  generated_text: string;
  final_text: string | null;
  status: string;
  reddit_comment_id: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RedditQuery {
  id: string;
  query_text: string;
  query_type: 'pain' | 'solution';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  workspace_id: string;
  company_description: string;
  ideal_customer_profile: string;
  value_propositions: string[];
  negative_signals: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RedditStats {
  opportunities: number;
  replied: number;
  estimatedTraffic: number;
}

export interface RawPost {
  id: string;
  post_id: string;
  subreddit: string;
  title: string;
  body: string;
  author: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: string;
  source_channel: 'listing' | 'search';
  matched_query: string | null;
  status: string;
  discovered_at: string;
}

export interface Lead {
  id: string;
  raw_post_id: string;
  workspace_id: string;
  similarity_score: number;
  matched_keywords: string[];
  source_channel: string;
  status: 'new' | 'reviewed' | 'engaged' | 'dismissed';
  created_at: string;
  updated_at: string;
  raw_posts: RawPost;
}

export interface LeadStats {
  total: number;
  new: number;
  reviewed: number;
  engaged: number;
  dismissed: number;
}

export const redditApi = {
  // Keywords
  listKeywords: async (): Promise<{ keywords: RedditKeyword[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ keywords: RedditKeyword[] }>>(
      "/api/reddit/keywords"
    );
    return data.data;
  },

  addKeyword: async (keyword: string): Promise<{ keyword: RedditKeyword }> => {
    const { data } = await apiClient.post<ApiResponse<{ keyword: RedditKeyword }>>(
      "/api/reddit/keywords",
      { keyword }
    );
    return data.data;
  },

  removeKeyword: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/reddit/keywords/${id}`);
  },

  toggleKeyword: async (id: string, is_active: boolean): Promise<{ keyword: RedditKeyword }> => {
    const { data } = await apiClient.patch<ApiResponse<{ keyword: RedditKeyword }>>(
      `/api/reddit/keywords/${id}/toggle`,
      { is_active }
    );
    return data.data;
  },

  syncKeywords: async (): Promise<{ synced: number; total: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ synced: number; total: number }>>(
      "/api/reddit/keywords/sync"
    );
    return data.data;
  },

  editKeyword: async (id: string, keyword: string): Promise<{ keyword: RedditKeyword }> => {
    const { data } = await apiClient.put<ApiResponse<{ keyword: RedditKeyword }>>(
      `/api/reddit/keywords/${id}`,
      { keyword }
    );
    return data.data;
  },

  generateKeywords: async (max_keywords?: number): Promise<{ keywords: string[]; total: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ keywords: string[]; total: number }>>(
      "/api/reddit/keywords/generate",
      { max_keywords: max_keywords || 10 }
    );
    return data.data;
  },

  bulkAddKeywords: async (keywords: string[]): Promise<{ inserted: number; total: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ inserted: number; total: number }>>(
      "/api/reddit/keywords/bulk",
      { keywords }
    );
    return data.data;
  },

  // Subreddits
  listSubreddits: async (): Promise<{ subreddits: RedditSubreddit[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ subreddits: RedditSubreddit[] }>>(
      "/api/reddit/subreddits"
    );
    return data.data;
  },

  addSubreddit: async (subreddit_name: string): Promise<{ subreddit: RedditSubreddit }> => {
    const { data } = await apiClient.post<ApiResponse<{ subreddit: RedditSubreddit }>>(
      "/api/reddit/subreddits",
      { subreddit_name }
    );
    return data.data;
  },

  removeSubreddit: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/reddit/subreddits/${id}`);
  },

  toggleSubreddit: async (id: string, is_active: boolean): Promise<{ subreddit: RedditSubreddit }> => {
    const { data } = await apiClient.patch<ApiResponse<{ subreddit: RedditSubreddit }>>(
      `/api/reddit/subreddits/${id}/toggle`,
      { is_active }
    );
    return data.data;
  },

  editSubreddit: async (id: string, subreddit_name: string): Promise<{ subreddit: RedditSubreddit }> => {
    const { data } = await apiClient.put<ApiResponse<{ subreddit: RedditSubreddit }>>(
      `/api/reddit/subreddits/${id}`,
      { subreddit_name }
    );
    return data.data;
  },

  generateSubreddits: async (maxSubreddits: number = 10): Promise<{
    subreddits: Array<{ name: string; subscribers: number; description: string; active_users: number }>;
    total: number;
    rejected: number;
  }> => {
    const { data } = await apiClient.post<ApiResponse<{
      subreddits: Array<{ name: string; subscribers: number; description: string; active_users: number }>;
      total: number;
      rejected: number;
    }>>("/api/reddit/subreddits/generate", { max_subreddits: maxSubreddits });
    return data.data;
  },

  bulkAddSubreddits: async (subreddits: string[]): Promise<{ inserted: number; total: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ inserted: number; total: number }>>(
      "/api/reddit/subreddits/bulk",
      { subreddits }
    );
    return data.data;
  },

  // Search Queries
  listQueries: async (): Promise<{ queries: RedditQuery[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ queries: RedditQuery[] }>>(
      "/api/reddit/queries"
    );
    return data.data;
  },

  addQuery: async (query_text: string, query_type: 'pain' | 'solution'): Promise<{ query: RedditQuery }> => {
    const { data } = await apiClient.post<ApiResponse<{ query: RedditQuery }>>(
      "/api/reddit/queries",
      { query_text, query_type }
    );
    return data.data;
  },

  removeQuery: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/reddit/queries/${id}`);
  },

  toggleQuery: async (id: string, is_active: boolean): Promise<{ query: RedditQuery }> => {
    const { data } = await apiClient.patch<ApiResponse<{ query: RedditQuery }>>(
      `/api/reddit/queries/${id}/toggle`,
      { is_active }
    );
    return data.data;
  },

  editQuery: async (id: string, query_text: string): Promise<{ query: RedditQuery }> => {
    const { data } = await apiClient.put<ApiResponse<{ query: RedditQuery }>>(
      `/api/reddit/queries/${id}`,
      { query_text }
    );
    return data.data;
  },

  generateQueries: async (max_queries: number = 20): Promise<{
    pain_queries: string[];
    solution_queries: string[];
    total: number;
  }> => {
    const { data } = await apiClient.post<ApiResponse<{
      pain_queries: string[];
      solution_queries: string[];
      total: number;
    }>>("/api/reddit/queries/generate", { max_queries });
    return data.data;
  },

  bulkAddQueries: async (queries: Array<{ text: string; type: 'pain' | 'solution' }>): Promise<{ inserted: number; total: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ inserted: number; total: number }>>(
      "/api/reddit/queries/bulk",
      { queries }
    );
    return data.data;
  },

  // Client Profile
  getProfile: async (): Promise<{ profile: ClientProfile | null }> => {
    const { data } = await apiClient.get<ApiResponse<{ profile: ClientProfile | null }>>(
      "/api/reddit/profile"
    );
    return data.data;
  },

  generateProfile: async (): Promise<{
    ideal_customer_profile: string;
    value_propositions: string[];
    negative_signals: string[];
    embedding_dims: number;
  }> => {
    const { data } = await apiClient.post<ApiResponse<{
      ideal_customer_profile: string;
      value_propositions: string[];
      negative_signals: string[];
      embedding_dims: number;
    }>>("/api/reddit/profile/generate");
    return data.data;
  },

  updateProfile: async (updates: {
    ideal_customer_profile?: string;
    value_propositions?: string[];
    negative_signals?: string[];
  }): Promise<{ profile: ClientProfile }> => {
    const { data } = await apiClient.put<ApiResponse<{ profile: ClientProfile }>>(
      "/api/reddit/profile",
      updates
    );
    return data.data;
  },

  // Posts
  listPosts: async (params: {
    page?: number;
    limit?: number;
    tab?: string;
    search?: string;
  }): Promise<PaginatedResponse<RedditPost>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<RedditPost>>>(
      "/api/reddit/posts",
      { params }
    );
    return data.data;
  },

  getStats: async (): Promise<RedditStats> => {
    const { data } = await apiClient.get<ApiResponse<RedditStats>>(
      "/api/reddit/posts/stats"
    );
    return data.data;
  },

  // Responses
  getResponses: async (postId: string): Promise<{ responses: RedditResponse[] }> => {
    const { data } = await apiClient.get<ApiResponse<{ responses: RedditResponse[] }>>(
      `/api/reddit/posts/${postId}/responses`
    );
    return data.data;
  },

  updateResponse: async (responseId: string, final_text: string): Promise<{ response: RedditResponse }> => {
    const { data } = await apiClient.put<ApiResponse<{ response: RedditResponse }>>(
      `/api/reddit/responses/${responseId}`,
      { final_text }
    );
    return data.data;
  },

  approveResponse: async (responseId: string): Promise<{ response: RedditResponse }> => {
    const { data } = await apiClient.post<ApiResponse<{ response: RedditResponse }>>(
      `/api/reddit/responses/${responseId}/approve`
    );
    return data.data;
  },

  rejectResponse: async (responseId: string): Promise<{ response: RedditResponse }> => {
    const { data } = await apiClient.post<ApiResponse<{ response: RedditResponse }>>(
      `/api/reddit/responses/${responseId}/reject`
    );
    return data.data;
  },

  // Leads
  listLeads: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Lead>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Lead>>>(
      "/api/reddit/leads",
      { params }
    );
    return data.data;
  },

  getLeadStats: async (): Promise<LeadStats> => {
    const { data } = await apiClient.get<ApiResponse<LeadStats>>(
      "/api/reddit/leads/stats"
    );
    return data.data;
  },

  updateLeadStatus: async (leadId: string, status: string): Promise<{ lead: Lead }> => {
    const { data } = await apiClient.patch<ApiResponse<{ lead: Lead }>>(
      `/api/reddit/leads/${leadId}/status`,
      { status }
    );
    return data.data;
  },

  dismissLead: async (leadId: string): Promise<{ lead: Lead }> => {
    const { data } = await apiClient.post<ApiResponse<{ lead: Lead }>>(
      `/api/reddit/leads/${leadId}/dismiss`
    );
    return data.data;
  },

  // Processor + Search Scan triggers
  triggerProcess: async (): Promise<{ processed: number; leads_created: number; dismissed: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ processed: number; leads_created: number; dismissed: number }>>(
      "/api/reddit/process"
    );
    return data.data;
  },

  triggerSearchScan: async (): Promise<{ queriesSearched: number; postsInserted: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ queriesSearched: number; postsInserted: number }>>(
      "/api/reddit/search-scan"
    );
    return data.data;
  },
};

export default apiClient;
