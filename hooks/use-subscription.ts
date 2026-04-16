import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/hooks/use-auth";
import apiClient from "@/lib/api-client";

export interface SubscriptionWithTrial {
  id: string;
  workspace_id: string;
  plan: string;
  status: string;
  content_quota: number;
  content_used: number;
  current_period_end?: string | null;
  cancel_at_period_end: boolean;
  // Trial fields
  trial_started: boolean;
  trial_ends_at: string | null;
  is_in_trial: boolean;
  trial_days_left: number;
  razorpay_status: string | null;
  has_active_subscription: boolean;
}

export function useSubscription() {
  const { user } = useAuthStore();
  const workspaceId = (user as any)?.workspace_id;

  return useQuery({
    queryKey: ["subscription", workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/subscriptions", {
        params: { workspace_id: workspaceId },
      });
      return data.data.subscription as SubscriptionWithTrial;
    },
    enabled: !!workspaceId,
    staleTime: 60_000, // 1 minute — trial days don't change every second
  });
}
