"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Sparkles,
  CreditCard,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/topics", label: "Topics", icon: FileText },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck, badge: 12 },
  { href: "/company-profile", label: "Company Profile", icon: Building2 },
  { href: "/entities", label: "Entities", icon: Users },
  { href: "/distributions", label: "Distributions", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const systemItems = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/team", label: "Team Management", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 h-full bg-card border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center mr-3">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">ContentIQ</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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

        {/* System Section */}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            System
          </p>
          {systemItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Mini */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group">
          <div className="relative">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "user@contentiq.io"}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
