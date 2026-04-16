"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Zap,
  Crown,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RazorpayCheckoutModal,
  type RazorpayPlan,
} from "@/components/billing/razorpay-checkout-modal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Subscription {
  id: string;
  workspace_id: string;
  plan: string;
  status: string;
  content_quota: number;
  content_used: number;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  trial_started: boolean;
  trial_ends_at: string | null;
  is_in_trial: boolean;
  trial_days_left: number;
  razorpay_status: string | null;
  has_active_subscription: boolean;
}

const TRIAL_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  trialing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  past_due: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

// ---------------------------------------------------------------------------
// Single paid plan — Pro at ₹1,000/month
// Replace razorpayPlanId with the real plan_id from your Razorpay dashboard.
// ---------------------------------------------------------------------------
const PRO_PLAN: RazorpayPlan & {
  price: string;
  period: string;
  highlight: boolean;
  icon: React.ElementType;
} = {
  id: "PRO",
  name: "Pro",
  razorpayPlanId: "plan_SKlZpRCHYxiLXq",
  // razorpayPlanId: "plan_SKkuFghjFMc6u6", // ← replace with real Razorpay plan_id
  price: "₹1,000",
  period: "/month",
  monthlyPrice: 1000,
  annualPrice: 10000, // ₹10,000/yr (~17% saving vs 12×₹1,000)
  icon: Crown,
  description:
    "Everything you need to scale your content pipeline with full analytics and priority support.",
  features: [
    "Unlimited content items/month",
    "All verticals",
    "Full analytics suite",
    "Priority support",
    "All distribution channels",
    "Custom prompts",
  ],
  highlight: true,
};

const freePlan = {
  id: "FREE",
  name: "Free",
  price: "₹0",
  period: "forever",
  icon: Zap,
  features: [
    "10 content items/month",
    "1 vertical",
    "Basic analytics",
    "Community support",
  ],
  highlight: false,
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function BillingPage() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [modalPlan, setModalPlan] = useState<typeof PRO_PLAN | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Redirect results (kept for compatibility)
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

  const currentPlan = subData?.has_active_subscription ? "PRO" : subData?.plan || "FREE";
  const usagePercent = subData
    ? Math.round((subData.content_used / subData.content_quota) * 100)
    : 0;

  const displayStatus = subData?.razorpay_status || subData?.status || "ACTIVE";

  // ── Razorpay handlers ────────────────────────────────────────────────────

  const handleCreateSubscription = async (
    planId: string,
    billingCycle: "monthly" | "annual"
  ): Promise<{ subscription_id: string; key_id: string }> => {
    const { data } = await apiClient.post("/api/subscriptions/create", {
      plan_id: planId,
      billing_cycle: billingCycle,
      workspace_id: workspaceId,
    });
    return data.data; // { subscription_id, key_id }
  };

  const handleVerifyPayment = async (paymentData: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => {
    await apiClient.post("/api/subscriptions/verify", {
      ...paymentData,
      workspace_id: workspaceId,
    });
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
    toast.success("🎉 Subscription activated! Welcome aboard.");
    setModalPlan(null);
  };

  const handlePaymentError = (error: unknown) => {
    console.error("Razorpay payment error:", error);
    toast.error("Payment failed. Please try again or contact support.");
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await apiClient.post("/api/subscriptions/cancel", {
        workspace_id: workspaceId,
      });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription will cancel at end of billing period.");
    } catch {
      toast.error("Failed to cancel subscription.");
    } finally {
      setCancelling(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const allDisplayPlans = [
    {
      ...freePlan,
      razorpayPlanId: "",
      monthlyPrice: 0,
      annualPrice: 0,
      description: "Get started with core features, no credit card required.",
    },
    PRO_PLAN,
  ];

  return (
    <>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Billing &amp; Subscription
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
                  className={TRIAL_STATUS_COLORS[displayStatus.toLowerCase()] || TRIAL_STATUS_COLORS.active}
                >
                  {displayStatus.toUpperCase()}
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
                {currentPlan === "PRO" && subData?.is_in_trial ? "Pro (Trial)" : (allDisplayPlans.find((p) => p.id === currentPlan)?.name || "Free")}
              </p>
              {subData?.is_in_trial ? (
                <p className="text-sm text-blue-400 mt-1">
                  Trial ends on {subData.trial_ends_at ? new Date(subData.trial_ends_at).toLocaleDateString() : ''} · {subData.trial_days_left} day{subData.trial_days_left !== 1 ? 's' : ''} left
                </p>
              ) : subData?.current_period_end && (
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
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel Subscription"}
              </Button>
            </div>
          )}
        </div>

        {/* Plan Selection Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Choose a Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allDisplayPlans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const PlanIcon = plan.icon;
            const isPaid = plan.id !== "FREE";

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
                        plan.highlight ? "bg-primary/20" : "bg-accent"
                      }`}
                    >
                      <PlanIcon
                        className={`h-5 w-5 ${
                          plan.highlight
                            ? "text-primary"
                            : "text-muted-foreground"
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
                      plan.highlight ? "shadow-lg shadow-primary/20" : ""
                    }`}
                    variant={
                      isCurrent
                        ? "outline"
                        : plan.highlight
                        ? "default"
                        : "outline"
                    }
                    disabled={isCurrent || !isPaid}
                    onClick={() => {
                      if (isPaid) setModalPlan(PRO_PLAN);
                    }}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : !isPaid
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

      {/* ── Razorpay Checkout Modal ── */}
      {modalPlan && (
        <RazorpayCheckoutModal
          open={!!modalPlan}
          onClose={() => setModalPlan(null)}
          plan={modalPlan}
          userEmail={(user as any)?.email}
          userName={(user as any)?.full_name || (user as any)?.name}
          onCreateSubscription={handleCreateSubscription}
          onVerifyPayment={handleVerifyPayment}
          onPaymentError={handlePaymentError}
        />
      )}
    </>
  );
}
