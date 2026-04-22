"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  status: "published" | "draft" | "scheduled";
  views: number;
  comments: number;
  date: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ElementType;
}

const recentPosts: Post[] = [
  { id: "1", title: "Getting Started with SEO", status: "published", views: 1234, comments: 12, date: "2024-04-20" },
  { id: "2", title: "Content Marketing Strategies", status: "draft", views: 0, comments: 0, date: "2024-04-19" },
  { id: "3", title: "Building Your Brand Voice", status: "scheduled", views: 0, comments: 0, date: "2024-04-25" },
  { id: "4", title: "Social Media Integration Tips", status: "published", views: 892, comments: 8, date: "2024-04-18" },
];

const quickStats: QuickStat[] = [
  { label: "Total Posts", value: 24, change: "+3 this week", changeType: "positive", icon: FileText },
  { label: "Page Views", value: "12.4K", change: "+18% from last week", changeType: "positive", icon: Eye },
  { label: "Comments", value: 156, change: "+12 this week", changeType: "positive", icon: MessageSquare },
  { label: "Avg. Read Time", value: "4.2m", change: "-0.3m from last week", changeType: "negative", icon: TrendingUp },
];

export default function BlogHostingDashboard() {
  const [posts] = useState<Post[]>(recentPosts);

  const getStatusBadge = (status: Post["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Published</Badge>;
      case "draft":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Draft</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Scheduled</Badge>;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your blog.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/blog-hosting/posts/new">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="bg-card/40 backdrop-blur-xl border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-500"
                      : stat.changeType === "negative"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card className="bg-card/40 backdrop-blur-xl border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold">Recent Posts</CardTitle>
              <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
                <Link href="/blog-hosting/posts">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{post.title}</h3>
                          {getStatusBadge(post.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.date}
                          </span>
                          {post.views > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views.toLocaleString()}
                            </span>
                          )}
                          {post.comments > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-xl border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
                <Link href="/blog-hosting/posts/new">
                  <Plus className="h-4 w-4" />
                  Create New Post
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
                <Link href="/blog-hosting/media">
                  <FileText className="h-4 w-4" />
                  Upload Media
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
                <Link href="/blog-hosting/settings/seo">
                  <TrendingUp className="h-4 w-4" />
                  SEO Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Blog Health */}
          <Card className="bg-card/40 backdrop-blur-xl border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Blog Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SEO Score</span>
                  <span className="font-medium text-green-500">85/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium text-amber-500">72/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Security</span>
                  <span className="font-medium text-green-500">95/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "95%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}