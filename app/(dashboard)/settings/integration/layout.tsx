"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Settings,
  Globe,
  Terminal,
  Webhook,
  Ghost,
  LayoutTemplate,
  ShoppingCart,
  Monitor,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const integrations = [
  { id: "accounts", label: "Accounts", href: "/settings/integration", icon: Globe },
  { id: "wordpress", label: "WordPress", href: "/settings/integration/wordpress", icon: Globe },
  { id: "api", label: "Custom API", href: "/settings/integration/api", icon: Terminal },
  { id: "webhook", label: "Webhook", href: "/settings/integration/webhook", icon: Webhook },
  { id: "dev-to", label: "Dev.to", href: "/settings/integration/dev-to", icon: Terminal },
  { id: "ghost", label: "Ghost", href: "/settings/integration/ghost", icon: Ghost },
  { id: "google-search-console", label: "Google Search Console", href: "/settings/integration/google-search-console", icon: Globe },
  { id: "webflow", label: "Webflow", href: "/settings/integration/webflow", icon: LayoutTemplate },
  { id: "shopify", label: "Shopify", href: "/settings/integration/shopify", icon: ShoppingCart },
  { id: "wix", label: "Wix", href: "/settings/integration/wix", icon: Monitor },
  { id: "blog-hosting", label: "Blog Hosting", href: "/settings/integration/blog-hosting", icon: Globe },
];

export default function IntegrationSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Integration Sidebar */}
      <div className="w-64 border-r border-border bg-card shrink-0 hidden lg:block">
        <div className="p-4 border-b border-border">
          <Link
            href="/settings"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <span className="font-semibold">Integrations</span>
          </div>
          {integrations.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
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
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Breadcrumb */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/settings" className="text-muted-foreground hover:text-foreground">
            Settings
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href="/settings/integration" className="text-muted-foreground hover:text-foreground">
            Integrations
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {integrations.find((item) => pathname === item.href)?.label || ""}
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