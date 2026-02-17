"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ActivityItem, StatusDistributionItem } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function AnalyticsPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => analyticsApi.getOverview(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!overview) {
    return <div>Failed to load analytics data.</div>;
  }

  const COLORS = overview?.statusDistribution?.map((item) => item.color);

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span
              className={change >= 0 ? "text-green-500" : "text-red-500"}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>{" "}
            from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Content"
          value={overview.totalContent}
          change={overview.totalContentChange}
          icon={FileText}
          color="text-blue-500"
        />
        <StatCard
          title="In Review"
          value={overview.inReviewQueue}
          icon={Clock}
          color="text-amber-500"
        />
        <StatCard
          title="Approval Rate"
          value={`${overview.approvalRate}%`}
          change={overview.approvalRateChange}
          icon={CheckCircle}
          color="text-green-500"
        />
        <StatCard
          title="High Priority"
          value={overview.highPriorityCount}
          icon={AlertCircle}
          color="text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Content Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {overview?.statusDistribution?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      value,
                      overview.statusDistribution.find(
                        (i) => i.status === name
                      )?.status || name,
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend
                    formatter={(value, entry: any) => {
                      const item = overview.statusDistribution[entry.payload.index];
                      return (
                        <span className="text-sm font-medium ml-2">
                          {item.status.replace("_", " ")} ({item.count})
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {overview?.recentActivity?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                overview?.recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex">
                    <Avatar className="h-9 w-9 mt-0.5">
                      <AvatarImage src={activity.user?.avatar} />
                      <AvatarFallback>
                        {activity.user?.name.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.user?.name || "System"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.message}{" "}
                        {activity.highlightText && (
                          <span
                            className="font-medium"
                            style={{ color: activity.highlightColor }}
                          >
                            {activity.highlightText}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
