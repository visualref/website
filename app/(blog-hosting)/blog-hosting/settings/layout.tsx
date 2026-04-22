"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Settings,
  Globe,
  Search,
  Shield,
  BarChart3,
  Wrench,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

const settingsNav = [
  { href: "/blog-hosting/settings/general", label: "General", icon: Globe },
  { href: "/blog-hosting/settings/seo", label: "SEO", icon: Search },
  { href: "/blog-hosting/settings/security", label: "Security", icon: Shield },
  { href: "/blog-hosting/settings/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/blog-hosting/settings/tools", label: "Tools", icon: Wrench },
  { href: "/blog-hosting/settings/help", label: "Help", icon: HelpCircle },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-border bg-card shrink-0 hidden lg:block">
        <div className="p-4 border-b border-border">
          <Link
            href="/blog-hosting"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <span className="font-semibold">Settings</span>
          </div>
          {settingsNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Breadcrumb */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/blog-hosting" className="text-muted-foreground hover:text-foreground">
            Blog Hosting
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href="/blog-hosting/settings" className="text-muted-foreground hover:text-foreground">
            Settings
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {settingsNav.find((item) => pathname === item.href)?.label || ""}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto lg:p-8 p-4 pt-16 lg:pt-0">
        {children}
      </div>
    </div>
  );
}