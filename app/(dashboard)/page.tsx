"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Flag,
  TrendingUp,
  Download,
  Plus,
  Upload,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Send,
  Image as ImageIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsOverview } from "@/hooks/use-api";
import type { AnalyticsOverview } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function buildStats(data: AnalyticsOverview) {
  return [
    {
      title: "Total Content",
      value: data.totalContent?.toLocaleString(),
      change: `${data.totalContentChange}%`,
      changeType: "positive" as const,
      subtitle: "vs. last month",
      icon: BookOpen,
      iconBg: "bg-blue-500/10",
      iconColor: "text-primary",
      hoverBorder: "hover:border-primary/50",
    },
    {
      title: "In Review Queue",
      value: data.inReviewQueue?.toString(),
      change: "Needs attention",
      changeType: "warning" as const,
      subtitle: `${data.highPriorityCount} high priority`,
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      hoverBorder: "hover:border-amber-500/50",
    },
    {
      title: "Approval Rate",
      value: `${data.approvalRate}%`,
      change: `${data.approvalRateChange}%`,
      changeType: "positive" as const,
      subtitle: "vs. last month",
      icon: CheckCircle,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      hoverBorder: "hover:border-green-500/50",
    },
    {
      title: "Monthly Goal",
      value: `${data.monthlyGoalPercent}%`,
      change: `${data.daysLeft} days left`,
      changeType: "neutral" as const,
      subtitle: null,
      icon: Flag,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      hoverBorder: "hover:border-purple-500/50",
      progress: data.monthlyGoalPercent,
    },
  ];
}

const activityIcons: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  update: { icon: Upload, bg: "bg-primary/10", color: "text-primary" },
  flag: { icon: AlertTriangle, bg: "bg-amber-500/10", color: "text-amber-500" },
  approve: { icon: CheckCircle, bg: "bg-green-500/10", color: "text-green-500" },
  import: { icon: Upload, bg: "bg-primary/10", color: "text-primary" },
  comment: { icon: MessageSquare, bg: "bg-primary/10", color: "text-primary" },
  blog_generated: { icon: Sparkles, bg: "bg-primary/10", color: "text-primary" },
  blog_published: { icon: Send, bg: "bg-green-500/10", color: "text-green-500" },
  blog_generation_failed: {
    icon: AlertTriangle,
    bg: "bg-red-500/10",
    color: "text-red-400",
  },
  cover_updated: { icon: ImageIcon, bg: "bg-muted", color: "text-muted-foreground" },
};

function describeActivity(a: ActivityItem): { message: string; highlight?: string; highlightColor?: string } {
  const topic = a.topicText || "";
  switch (a.type) {
    case "blog_generated":
      return { message: "generated a blog", highlight: topic, highlightColor: "text-primary" };
    case "blog_published":
      return {
        message: "published a blog",
        highlight: topic,
        highlightColor: "text-green-400",
      };
    case "blog_generation_failed":
      return {
        message: "failed to generate blog",
        highlight: topic,
        highlightColor: "text-red-400",
      };
    case "cover_updated":
      return { message: "updated a cover image", highlight: topic, highlightColor: "text-primary" };
    default:
      return { message: a.message || "", highlight: a.highlightText, highlightColor: a.highlightColor };
  }
}

function formatTimestamp(ts: string): string {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch {
    return ts;
  }
}

function KPISkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl p-6 shadow-sm border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="flex-1 min-h-[300px] flex items-end gap-4 px-8 pb-8">
        {[60, 30, 80, 100, 15].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="lg:col-span-1 bg-card rounded-xl border border-border p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex space-x-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoDataMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const { data: analytics, isLoading, isError } = useAnalyticsOverview();

  const stats = analytics ? buildStats(analytics) : [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, here&apos;s what&apos;s happening with your content today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button asChild className="gap-2 shadow-lg shadow-primary/20">
            <Link href="/topics">
              <Plus className="h-4 w-4" />
              New Content
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <KPISkeletons />
      ) : isError || !analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-full">
            <NoDataMessage message="No data available" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`bg-card rounded-xl p-6 shadow-sm border border-border ${stat.hoverBorder} transition-colors group`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </h3>
                <div className={`p-2 ${stat.iconBg} rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.changeType === "positive" && (
                  <span className="ml-2 text-sm font-medium text-green-500 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                    {stat.change}
                  </span>
                )}
                {stat.changeType === "warning" && (
                  <span className="ml-2 text-sm font-medium text-amber-500">
                    {stat.change}
                  </span>
                )}
                {stat.changeType === "neutral" && (
                  <span className="ml-auto text-xs font-medium text-muted-foreground">
                    {stat.change}
                  </span>
                )}
              </div>
              {stat.subtitle && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              )}
              {stat.progress !== undefined && (
                <div className="w-full bg-secondary rounded-full h-1.5 mt-4">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lower Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section (Takes 2 columns) */}
        {isLoading ? (
          <ChartSkeleton />
        ) : isError || !analytics ? (
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 flex flex-col">
            <h3 className="text-lg font-semibold mb-6">Content Status Distribution</h3>
            <NoDataMessage message="No data available" />
          </div>
        ) : (
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Content Status Distribution
              </h3>
              <select className="bg-accent border border-border text-muted-foreground text-sm rounded-lg focus:ring-primary focus:border-primary p-2">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.statusDistribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="status"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    fill="var(--primary)"
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Feed Section (Takes 1 column) */}
        {isLoading ? (
          <ActivitySkeleton />
        ) : isError || !analytics ? (
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-6 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <NoDataMessage message="No data available" />
          </div>
        ) : (
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <a className="text-xs font-medium text-primary hover:text-blue-400" href="#">
                View All
              </a>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
              {analytics?.recentActivity?.length === 0 ? (
                <NoDataMessage message="No recent activity" />
              ) : (
                analytics?.recentActivity?.map((activity) => {
                  const iconConfig = activityIcons[activity.type] || activityIcons.update;
                  const IconComp = iconConfig.icon;
                  const desc = describeActivity(activity);
                  const actor = activity.actor || activity.user;
                  const actorName = actor?.name || null;
                  return (
                    <div key={activity.id} className="flex space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {actor?.avatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={actor.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {(actorName || "?")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div
                            className={`h-8 w-8 rounded-full ${iconConfig.bg} flex items-center justify-center border border-current/10`}
                          >
                            <IconComp className={`h-3.5 w-3.5 ${iconConfig.color}`} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {actorName && <span>{actorName.split(' ')[0]} </span>}
                          {desc.message}{" "}
                          {desc.highlight && (
                            <span className={desc.highlightColor || "text-primary"}>
                              {desc.highlight}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
