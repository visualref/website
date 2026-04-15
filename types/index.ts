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
  onboarding_status?: string;
  onboarding_completed?: boolean;
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
// Topics
// ==========================================

export interface Topic {
  id: string;
  title: string; // Mapped from query
  workspace_id: string;
  status: string; // 'new', 'processing', 'completed'
  volume?: number;
  difficulty?: number;
  keywords?: string[];
  contentType?: ContentType;
  priority?: Priority;
  createdAt: string;
  updatedAt: string;
  contentItemId?: string;
}

export interface CreateTopicPayload {
  title: string;
  target_keywords: string[];
  content_type: ContentType;
  priority: Priority;
  createdAt?: string;
}

export interface UpdateTopicPayload extends Partial<CreateTopicPayload> {
  createdAt?: string; // ISO string 
}

// ==========================================
// Calendar Blog
// ==========================================

export type CalendarBlogStatus = 'scheduled' | 'generating' | 'in_review' | 'published' | 'new' | 'failed';

export interface CalendarBlog {
  id: string;
  title: string;
  scheduledDate: string; // ISO date string (YYYY-MM-DD)
  status: CalendarBlogStatus;
  contentItemId?: string; // link to ContentItem once generated
}

// ==========================================
// Content
// ==========================================

export interface ContentItem {
  id: string;
  title: string; // topic_text
  status: string; // ContentStatus enum or string from backend
  workspace_id: string;
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
  workspace_id?: string;
  aliases?: string[];
  properties?: Record<string, any>;
  citation_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEntityPayload {
  name: string;
  type: string;
  workspace_id?: string;
  aliases?: string[];
  properties?: Record<string, any>;
}

export interface UpdateEntityPayload extends Partial<CreateEntityPayload> { }

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

export type ActivityType =
  | "blog_generated"
  | "blog_published"
  | "blog_generation_failed"
  | "cover_updated"
  // legacy types still supported
  | "update"
  | "flag"
  | "approve"
  | "import"
  | "comment";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message?: string;
  contentItemId?: string | null;
  topicText?: string | null;
  highlightText?: string;
  highlightColor?: string;
  actor?: { id: string; name: string | null; avatar: string | null } | null;
  user?: User;
  metadata?: Record<string, any> | null;
  timestamp: string;
}

// ==========================================
// Onboarding / Workspace Profile
// ==========================================

export interface ScrapedData {
  company_name: string;
  description: string;
  colors: string[];
  favicon_url: string;
  og_image: string;
  meta: {
    title: string;
    og_title: string;
    og_description: string;
    meta_description: string;
  };
}

export interface WorkspaceProfile {
  id: string;
  workspace_id: string;
  company_url?: string;
  scraped_data?: ScrapedData;
  language: string;
  description?: string;
  target_audience: string[];
  brand_colors?: Record<string, string>;
  example_article?: string;
  onboarding_completed: boolean;
  onboarding_step?: string;
  created_at: string;
  updated_at: string;
}

export interface Competitor {
  id: string;
  workspace_id: string;
  name: string;
  url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SuggestedCompetitor {
  name: string;
  url: string;
  description: string;
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
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}
