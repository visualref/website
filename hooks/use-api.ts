"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topicsApi, contentApi, analyticsApi, workspacesApi } from "@/lib/api-client";
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
