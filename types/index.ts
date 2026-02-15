// ==========================================
// Enums
// ==========================================

export enum ContentStatus {
  OUTLINE_READY = "outline_ready",
  DRAFT_READY = "draft_ready",
  IN_REVIEW = "in_review",
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
  title: string;
  vertical: string;
  keywords: string[];
  contentType: ContentType;
  priority: Priority;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
}

export interface CreateTopicPayload {
  title: string;
  vertical: string;
  keywords: string[];
  contentType: ContentType;
  priority: Priority;
}

export interface UpdateTopicPayload extends Partial<CreateTopicPayload> {}

// ==========================================
// Content
// ==========================================

export interface ContentItem {
  id: string;
  title: string;
  status: ContentStatus;
  vertical: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  priority: Priority;
}

export interface ContentDetail extends ContentItem {
  outline: OutlineSection[];
  body: string;
  comments: Comment[];
  versions: VersionEntry[];
  contentScore: number;
  seoNotes: string[];
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
