"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topicsApi, contentApi, analyticsApi, workspacesApi, redditApi } from "@/lib/api-client";
import type { CreateTopicPayload, UpdateTopicPayload, QueryFilters } from "@/types";
import { toast } from "sonner";

// ==========================================
// Topics Hooks
// ==========================================

export function useTopics(filters?: QueryFilters) {
  return useQuery({
    queryKey: ["topics", filters],
    queryFn: () => topicsApi.list(filters),
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ["topics", id],
    queryFn: () => topicsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTopicPayload) => topicsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Topic created successfully");
    },
    onError: () => {
      toast.error("Failed to create topic");
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTopicPayload }) =>
      topicsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Topic updated successfully");
    },
    onError: () => {
      toast.error("Failed to update topic");
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => topicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Topic deleted");
    },
    onError: () => {
      toast.error("Failed to delete topic");
    },
  });
}

// ==========================================
// Content Hooks
// ==========================================

export function useContentList(filters?: QueryFilters) {
  return useQuery({
    queryKey: ["content", filters],
    queryFn: () => contentApi.list(filters),
  });
}

export function useContentDetail(id: string) {
  return useQuery({
    queryKey: ["content", id],
    queryFn: () => contentApi.get(id),
    enabled: !!id,
  });
}

export function useApproveContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content approved!");
    },
    onError: () => {
      toast.error("Failed to approve content");
    },
  });
}

export function useRejectContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      contentApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content rejected");
    },
    onError: () => {
      toast.error("Failed to reject content");
    },
  });
}

export function useGenerateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (topicId: string) => contentApi.generate(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Blog generation started successfully!");
    },
    onError: () => {
      toast.error("Failed to start blog generation");
    },
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: string }) =>
      contentApi.requestChanges(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Changes requested");
    },
    onError: () => {
      toast.error("Failed to request changes");
    },
  });
}

export function useDistributeContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      platforms,
      settings,
    }: {
      id: string;
      platforms: string[];
      settings?: Record<string, any>;
    }) => contentApi.distribute(id, { platforms, settings }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["content", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content published successfully!");
    },
    onError: () => {
      toast.error("Failed to distribute content");
    },
  });
}

// ==========================================
// Analytics Hooks
// ==========================================

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsApi.getOverview(),
  });
}

// ==========================================
// Workspace Hooks
// ==========================================

export function useWorkspaceContent(workspaceId: string, filters?: QueryFilters) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "content", filters],
    queryFn: () => workspacesApi.listContent(workspaceId, filters),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceTopics(workspaceId: string, filters?: QueryFilters) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "topics", filters],
    queryFn: () => workspacesApi.listTopics(workspaceId, filters),
    enabled: !!workspaceId,
  });
}

// ==========================================
// Reddit Bot Hooks
// ==========================================

export function useRedditKeywords() {
  return useQuery({
    queryKey: ["reddit", "keywords"],
    queryFn: () => redditApi.listKeywords(),
  });
}

export function useAddRedditKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyword: string) => redditApi.addKeyword(keyword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "keywords"] });
      toast.success("Keyword added");
    },
    onError: () => {
      toast.error("Failed to add keyword");
    },
  });
}

export function useRemoveRedditKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => redditApi.removeKeyword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "keywords"] });
      toast.success("Keyword removed");
    },
    onError: () => {
      toast.error("Failed to remove keyword");
    },
  });
}

export function useSyncRedditKeywords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => redditApi.syncKeywords(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "keywords"] });
      toast.success(`Synced ${data.synced} keywords from topics`);
    },
    onError: () => {
      toast.error("Failed to sync keywords");
    },
  });
}

export function useEditRedditKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, keyword }: { id: string; keyword: string }) =>
      redditApi.editKeyword(id, keyword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "keywords"] });
      toast.success("Keyword updated");
    },
    onError: () => {
      toast.error("Failed to update keyword");
    },
  });
}

export function useGenerateRedditKeywords() {
  return useMutation({
    mutationFn: (maxKeywords?: number) => redditApi.generateKeywords(maxKeywords),
    onSuccess: (data) => {
      toast.success(`Generated ${data.total} keyword suggestions`);
    },
    onError: () => {
      toast.error("Failed to generate keywords");
    },
  });
}

export function useBulkAddRedditKeywords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keywords: string[]) => redditApi.bulkAddKeywords(keywords),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "keywords"] });
      toast.success(`Saved ${data.inserted} keywords`);
    },
    onError: () => {
      toast.error("Failed to save keywords");
    },
  });
}

export function useRedditSubreddits() {
  return useQuery({
    queryKey: ["reddit", "subreddits"],
    queryFn: () => redditApi.listSubreddits(),
  });
}

export function useAddRedditSubreddit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => redditApi.addSubreddit(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "subreddits"] });
      toast.success("Subreddit added");
    },
    onError: () => {
      toast.error("Failed to add subreddit");
    },
  });
}

export function useRemoveRedditSubreddit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => redditApi.removeSubreddit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "subreddits"] });
      toast.success("Subreddit removed");
    },
    onError: () => {
      toast.error("Failed to remove subreddit");
    },
  });
}

export function useToggleRedditSubreddit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      redditApi.toggleSubreddit(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "subreddits"] });
    },
    onError: () => {
      toast.error("Failed to update subreddit");
    },
  });
}

export function useEditRedditSubreddit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, subredditName }: { id: string; subredditName: string }) =>
      redditApi.editSubreddit(id, subredditName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "subreddits"] });
      toast.success("Subreddit updated");
    },
    onError: () => {
      toast.error("Failed to update subreddit");
    },
  });
}

export function useGenerateRedditSubreddits() {
  return useMutation({
    mutationFn: (maxSubreddits: number = 10) => redditApi.generateSubreddits(maxSubreddits),
    onError: () => {
      toast.error("Failed to generate subreddits");
    },
  });
}

export function useBulkAddRedditSubreddits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subreddits: string[]) => redditApi.bulkAddSubreddits(subreddits),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reddit", "subreddits"] });
      toast.success(`Saved ${data.inserted} subreddits`);
    },
    onError: () => {
      toast.error("Failed to save subreddits");
    },
  });
}

export function useRedditPosts(params: { page?: number; limit?: number; tab?: string; search?: string }) {
  return useQuery({
    queryKey: ["reddit", "posts", params],
    queryFn: () => redditApi.listPosts(params),
  });
}

export function useRedditStats() {
  return useQuery({
    queryKey: ["reddit", "stats"],
    queryFn: () => redditApi.getStats(),
  });
}

export function useRedditResponses(postId: string) {
  return useQuery({
    queryKey: ["reddit", "responses", postId],
    queryFn: () => redditApi.getResponses(postId),
    enabled: !!postId,
  });
}

export function useApproveRedditResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (responseId: string) => redditApi.approveResponse(responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit"] });
      toast.success("Response approved");
    },
    onError: () => {
      toast.error("Failed to approve response");
    },
  });
}

export function useRejectRedditResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (responseId: string) => redditApi.rejectResponse(responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit"] });
      toast.success("Response rejected");
    },
    onError: () => {
      toast.error("Failed to reject response");
    },
  });
}
