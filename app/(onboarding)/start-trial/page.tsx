"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  RazorpayCheckoutModal,
  type RazorpayPlan,
} from "@/components/billing/razorpay-checkout-modal";

const TRIAL_PLAN: RazorpayPlan & { price: string; period: string } = {
  id: "PRO",
  name: "Pro",
  razorpayPlanId: "plan_SKlZpRCHYxiLXq",
  price: "₹0",
  period: "today",
  monthlyPrice: 1000,
  annualPrice: 10000,
  description: "3 days free, then ₹1,000/month. Cancel anytime.",
  features: [
    "Full Reddit Bot access",
    "Auto topic generation",
    "All distribution channels",
    "Priority support",
    "Cancel anytime",
  ],
};

const FEATURE_LIST = [
  "Full Reddit Promotion Bot",
  "Auto topic generation each month",
  "All distribution channels",
  "Priority support",
  "Cancel anytime, no questions asked",
];

export default function StartTrialPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const workspaceId = (user as any)?.workspace_id;

  const handleCreateSubscription = async (
    planId: string,
    billingCycle: "monthly" | "annual"
  ): Promise<{ subscription_id: string; key_id: string }> => {
    const { data } = await apiClient.post("/api/subscriptions/create", {
      plan_id: planId,
      billing_cycle: billingCycle,
      workspace_id: workspaceId,
    });
    return data.data;
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
    await queryClient.refetchQueries({ queryKey: ["subscription"] });
    toast.success("🎉 Trial started! Welcome to Pro.");
    router.push("/");
  };

  const handlePaymentError = (error: unknown) => {
    console.error("Razorpay error:", error);
    toast.error("Something went wrong. Please try again.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border shadow-lg mx-auto bg-white flex items-center justify-center">
            <Image src="/visualref-logo.png" alt="VisualRef" width={64} height={64} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-4">
            Start your free trial
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            3 days completely free. No charge today.
            <br />
            <span className="text-foreground font-medium">₹1,000/month</span>{" "}
            after the trial ends.
          </p>
        </div>

        {/* Feature card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Included in Pro
            </span>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              3 days free
            </Badge>
          </div>

          <ul className="space-y-3">
            {FEATURE_LIST.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-500" />
                </div>
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Pricing summary */}
          <div className="pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Due today</span>
              <span className="font-semibold text-green-400">₹0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">After 3 days</span>
              <span className="font-medium">₹1,000 / month</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full shadow-lg shadow-primary/20 gap-2 text-base font-semibold"
          onClick={() => setModalOpen(true)}
        >
          <Lock className="h-4 w-4" />
          Start Free Trial →
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By starting the trial you agree to be charged ₹1,000/month after 3
          days. Cancel anytime before the trial ends.
        </p>
      </div>

      {/* Razorpay modal */}
      {modalOpen && (
        <RazorpayCheckoutModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          plan={TRIAL_PLAN}
          userEmail={(user as any)?.email}
          userName={(user as any)?.full_name || (user as any)?.name}
          onCreateSubscription={handleCreateSubscription}
          onVerifyPayment={handleVerifyPayment}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
}
