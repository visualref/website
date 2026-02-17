// ==========================================
// Enums
// ==========================================

export enum ContentStatus {
  OUTLINE_READY = "outline_ready",
  DRAFT_READY = "draft_ready",
  IN_REVIEW = "REVIEW",
  APPROVED = "approved",
  REJECTED = "rejected",
  PUBLISHED = "published",
  NEEDS_REVISION = "needs_revision",
}

export enum Priority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum ContentType {
  ARTICLE = "article",
  GUIDE = "guide",
  COMPARISON = "comparison",
}

// ==========================================
// User / Auth
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  workspace_id?: string;
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ==========================================
// Verticals
// ==========================================

export interface Vertical {
  id: string;
  name: string;
  domain?: string;
  content_style?: Record<string, any>;
  posting_schedule?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateVerticalPayload {
  name: string;
  domain?: string;
  content_style?: Record<string, any>;
  posting_schedule?: Record<string, any>;
}

export interface UpdateVerticalPayload extends Partial<CreateVerticalPayload> {}

// ==========================================
// Topics
// ==========================================

export interface Topic {
  id: string;
  title: string; // Mapped from query
  vertical_id: string;
  vertical?: Vertical;
  status: string; // 'new', 'processing', 'completed'
  volume?: number;
  difficulty?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicPayload {
  client_id: string;
  title: string;
  target_keywords: string[];
  content_type: ContentType;
  priority: Priority;
}

export interface UpdateTopicPayload extends Partial<CreateTopicPayload> {}

// ==========================================
// Content
// ==========================================

export interface ContentItem {
  id: string;
  title: string; // topic_text
  status: string; // ContentStatus enum or string from backend
  vertical_id: string;
  vertical?: Vertical;
  // wordCount: number; // Removed from backend? checking schema... ContentItem does not have wordCount. Draft string has length.
  // createdAt: string;
  // updatedAt: string;
  // assignee?: User;
  // priority: Priority; // Not in ContentItem schema? Topic has priority?
  // I will leave them for now but optional if they are not in backend response.
  created_at: string;
  updated_at: string;
  word_count?: number;
}

export interface ContentDetail extends ContentItem {
  outline?: OutlineSection[];
  draft?: string;
  comments?: Comment[];
  quality_score?: number;
  versions?: VersionEntry[];
  coverImage?: string;
}

export interface OutlineSection {
  id: string;
  level: "h1" | "h2" | "h3";
  title: string;
  children?: OutlineSection[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  resolved: boolean;
  replies?: Comment[];
}

export interface VersionEntry {
  id: string;
  version: number;
  updatedAt: string;
  updatedBy: User;
  summary: string;
}

// ==========================================
// Analytics
// ==========================================

export interface AnalyticsOverview {
  totalContent: number;
  totalContentChange: number;
  inReviewQueue: number;
  highPriorityCount: number;
  approvalRate: number;
  approvalRateChange: number;
  monthlyGoalPercent: number;
  daysLeft: number;
  statusDistribution: StatusDistributionItem[];
  recentActivity: ActivityItem[];
}

// ==========================================
// Entities
// ==========================================

export interface Entity {
  id: string;
  name: string;
  type?: string;
  vertical_id?: string;
  vertical?: Vertical;
  aliases?: string[];
  properties?: Record<string, any>;
  citation_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEntityPayload {
  name: string;
  type: string;
  vertical_id?: string;
  aliases?: string[];
  properties?: Record<string, any>;
}

export interface UpdateEntityPayload extends Partial<CreateEntityPayload> {}

// ==========================================
// Distributions
// ==========================================

export interface Distribution {
  id: string;
  content_item_id: string;
  platform: string;
  credentials_id?: string;
  platform_id?: string;
  url?: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
  metrics?: Record<string, any>;
  result?: Record<string, any>;
  settings?: Record<string, any>;
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDistributionPayload {
  content_item_id: string;
  platform: string;
  credentials_id?: string;
  settings?: Record<string, any>;
  scheduled_at?: string;
}

export interface UpdateDistributionPayload {
  status?: string;
  result?: Record<string, any>;
  scheduled_at?: string;
  settings?: Record<string, any>;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: "update" | "flag" | "approve" | "import" | "comment";
  message: string;
  highlightText?: string;
  highlightColor?: string;
  user?: User;
  timestamp: string;
}

// ==========================================
// API Generic
// ==========================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryFilters {
  status?: ContentStatus;
  vertical?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}
