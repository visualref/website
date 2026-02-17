"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Check,
  Zap,
  Crown,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Subscription {
  id: string;
  workspace_id: string;
  plan: string;
  status: string;
  content_quota: number;
  content_used: number;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Zap,
    features: [
      "10 content items/month",
      "1 vertical",
      "Basic analytics",
      "Community support",
    ],
    highlight: false,
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "$29",
    period: "/month",
    icon: CreditCard,
    features: [
      "50 content items/month",
      "5 verticals",
      "Advanced analytics",
      "Email support",
      "WordPress distribution",
    ],
    highlight: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$79",
    period: "/month",
    icon: Crown,
    features: [
      "200 content items/month",
      "Unlimited verticals",
      "Full analytics suite",
      "Priority support",
      "All distribution channels",
      "Custom prompts",
    ],
    highlight: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "$249",
    period: "/month",
    icon: Building2,
    features: [
      "1,000 content items/month",
      "Unlimited everything",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
      "White-label options",
    ],
    highlight: false,
  },
];

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  PAST_DUE: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  TRIALING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  // Show toast for Stripe redirect results
  if (searchParams.get("success") === "true") {
    toast.success("Subscription activated successfully!");
  }
  if (searchParams.get("cancelled") === "true") {
    toast.info("Checkout cancelled.");
  }

  const workspaceId = (user as any)?.workspace_id;

  const { data: subData, isLoading } = useQuery({
    queryKey: ["subscription", workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/subscriptions", {
        params: { workspace_id: workspaceId },
      });
      return data.data.subscription as Subscription;
    },
    enabled: !!workspaceId,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (plan: string) => {
      const { data } = await apiClient.post("/api/subscriptions/checkout", {
        plan,
        workspace_id: workspaceId,
      });
      return data.data;
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Failed to start checkout. Please try again.");
      setUpgrading(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/api/subscriptions/cancel", {
        workspace_id: workspaceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription will cancel at end of billing period.");
    },
    onError: () => {
      toast.error("Failed to cancel subscription.");
    },
  });

  const currentPlan = subData?.plan || "FREE";
  const usagePercent = subData
    ? Math.round((subData.content_used / subData.content_quota) * 100)
    : 0;

  const handleUpgrade = (planId: string) => {
    if (planId === "FREE") return;
    setUpgrading(planId);
    checkoutMutation.mutate(planId);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your plan, view usage, and update payment details.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold">Current Plan</h2>
              <Badge
                variant="outline"
                className={statusColors[subData?.status || "ACTIVE"]}
              >
                {subData?.status || "ACTIVE"}
              </Badge>
              {subData?.cancel_at_period_end && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/20"
                >
                  Cancelling
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold">
              {plans.find((p) => p.id === currentPlan)?.name || "Free"}
            </p>
            {subData?.current_period_end && (
              <p className="text-sm text-muted-foreground mt-1">
                Next billing date:{" "}
                {new Date(subData.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">
              Content Usage
            </p>
            <p className="text-2xl font-bold">
              {subData?.content_used || 0}{" "}
              <span className="text-sm text-muted-foreground font-normal">
                / {subData?.content_quota || 10}
              </span>
            </p>
            <div className="w-48 bg-secondary rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  usagePercent > 80
                    ? "bg-red-500"
                    : usagePercent > 50
                    ? "bg-amber-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {currentPlan !== "FREE" && !subData?.cancel_at_period_end && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending
                ? "Cancelling..."
                : "Cancel Subscription"}
            </Button>
          </div>
        )}
      </div>

      {/* Plan Selection Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const PlanIcon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`bg-card rounded-xl border p-6 flex flex-col transition-all ${
                  plan.highlight
                    ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/30"
                } ${isCurrent ? "ring-2 ring-primary/50" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      plan.highlight
                        ? "bg-primary/20"
                        : "bg-accent"
                    }`}
                  >
                    <PlanIcon
                      className={`h-5 w-5 ${
                        plan.highlight ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  {plan.highlight && (
                    <Badge className="bg-primary text-white text-xs">
                      Popular
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-400 border-green-500/20 text-xs"
                    >
                      Current
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`mt-6 w-full ${
                    plan.highlight
                      ? "shadow-lg shadow-primary/20"
                      : ""
                  }`}
                  variant={isCurrent ? "outline" : plan.highlight ? "default" : "outline"}
                  disabled={isCurrent || plan.id === "FREE" || upgrading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrent
                    ? "Current Plan"
                    : upgrading === plan.id
                    ? "Redirecting..."
                    : plan.id === "FREE"
                    ? "Free Forever"
                    : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Warning */}
      {usagePercent > 80 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-400">
              Approaching content limit
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;ve used {usagePercent}% of your monthly content quota.
              Consider upgrading your plan to avoid interruptions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
