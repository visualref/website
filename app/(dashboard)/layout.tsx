"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useAuthStore } from "@/hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, needsOnboarding } = useAuthStore();
  const [minLoadingPassed, setMinLoadingPassed] = useState(false);

  useEffect(() => {
    checkAuth();
    const timer = setTimeout(() => setMinLoadingPassed(true), 1500);
    return () => clearTimeout(timer);
  }, [checkAuth]);

  const showLoader = isLoading || !minLoadingPassed;

  useEffect(() => {
    if (!showLoader) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (isAuthenticated && needsOnboarding) {
        router.push("/onboarding");
      }
    }
  }, [showLoader, isAuthenticated, needsOnboarding, router]);

  if (showLoader) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes vDropIn {
            0% { opacity: 0; transform: translateY(-30px); }
            60% { opacity: 1; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes textWipeIn {
            0% { max-width: 0; opacity: 0; }
            40% { max-width: 0; opacity: 0; }
            100% { max-width: 14rem; opacity: 1; }
          }
          .animate-v-drop { animation: vDropIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .animate-text-wipe { animation: textWipeIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        `}} />
        <div 
          className="flex items-center justify-center text-4xl tracking-tight text-[#20395B]"
          style={{ fontFamily: "var(--font-groote)" }}
        >
          <div className="animate-v-drop">V</div>
          <div className="animate-text-wipe whitespace-nowrap overflow-hidden pr-2">isualRef</div>
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
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
