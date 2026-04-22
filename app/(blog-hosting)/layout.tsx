"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  FileText,
  File,
  Image,
  FolderTree,
  Tag,
  MessageSquare,
  Palette,
  Puzzle,
  Users,
  Settings,
  Wrench,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  ExternalLink,
  Globe,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { href: "/blog-hosting", label: "Dashboard", icon: LayoutDashboard },
  { href: "/blog-hosting/posts", label: "Posts", icon: FileText },
  { href: "/blog-hosting/pages", label: "Pages", icon: File },
  { href: "/blog-hosting/media", label: "Media Library", icon: Image },
  { href: "/blog-hosting/categories", label: "Categories", icon: FolderTree },
  { href: "/blog-hosting/tags", label: "Tags", icon: Tag },
  { href: "/blog-hosting/comments", label: "Comments", icon: MessageSquare },
  { href: "/blog-hosting/appearance", label: "Appearance", icon: Palette },
  { href: "/blog-hosting/plugins", label: "Plugins", icon: Puzzle },
  { href: "/blog-hosting/users", label: "Users", icon: Users },
];

const settingsItems = [
  { href: "/blog-hosting/settings/general", label: "General" },
  { href: "/blog-hosting/settings/seo", label: "SEO" },
  { href: "/blog-hosting/settings/security", label: "Security" },
  { href: "/blog-hosting/settings/analytics", label: "Analytics" },
  { href: "/blog-hosting/settings/tools", label: "Tools" },
  { href: "/blog-hosting/settings/help", label: "Help" },
];

export default function BlogHostingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Auto-expand settings when on a settings sub-page
    if (pathname.startsWith("/blog-hosting/settings")) {
      setSettingsExpanded(true);
    }
  }, [pathname]);

  const isSettingsActive = pathname.startsWith("/blog-hosting/settings");
  const isBlogHostingActive = pathname.startsWith("/blog-hosting");

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 h-full bg-card border-r border-border flex flex-col shrink-0 transition-transform lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Blog Hosting</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Main Navigation */}
          {navItems.map((item) => {
            const isActive =
              item.href === "/blog-hosting"
                ? pathname === "/blog-hosting"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg group transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 mr-3 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-amber-500/20 text-amber-500 py-0.5 px-2 rounded-full text-xs font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Settings Dropdown */}
          <div>
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg group transition-colors",
                isSettingsActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Settings
                className={cn(
                  "h-5 w-5 mr-3 transition-colors",
                  isSettingsActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary"
                )}
              />
              <span className="text-sm font-medium flex-1 text-left">Settings</span>
              {settingsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {settingsExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                {settingsItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border my-4" />

          {/* Tools & Help */}
          <Link
            href="/blog-hosting/tools"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center px-3 py-2.5 rounded-lg group transition-colors",
              pathname === "/blog-hosting/tools"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Wrench className="h-5 w-5 mr-3 transition-colors" />
            <span className="text-sm font-medium">Tools</span>
          </Link>

          <Link
            href="/blog-hosting/settings/help"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center px-3 py-2.5 rounded-lg group transition-colors",
              pathname === "/blog-hosting/settings/help"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <HelpCircle className="h-5 w-5 mr-3 transition-colors" />
            <span className="text-sm font-medium">Help</span>
          </Link>
        </nav>

        {/* View Site Link */}
        <div className="p-4 border-t border-border">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
          >
            View Site
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}