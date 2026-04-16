"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useAuthStore } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, needsOnboarding } = useAuthStore();
  const { data: subscription, isLoading: isSubLoading, isError } = useSubscription();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (!isLoading && isAuthenticated && needsOnboarding) {
      router.push("/onboarding");
    } else if (!isLoading && isAuthenticated && !needsOnboarding && !isSubLoading) {
      // Strictly enforce trial: if there's a fetching error, or subscription object is somehow missing, 
      // or if they just don't have an active subscription, push them to the trial screen.
      if (isError || !subscription || !subscription.has_active_subscription) {
        router.push("/start-trial");
      }
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router, isSubLoading, subscription, isError]);

  if (isLoading || isSubLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center animate-pulse">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {subscription?.is_in_trial && (
          <div className="px-4 py-2 text-sm text-center bg-blue-500/10 border-b border-blue-500/20 text-blue-400">
            ⚡ Trial: {subscription.trial_days_left} day{subscription.trial_days_left !== 1 ? 's' : ''} left · 
            Your card will be charged ₹1,000 on {subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : ''}
          </div>
        )}
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
