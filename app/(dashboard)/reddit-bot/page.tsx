"use client";

import { useState } from "react";
import {
  Bot,
  Search,
  ExternalLink,
  TrendingUp,
  MessageSquare,
  Settings,
  X,
  Plus,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Trash2,
  Pencil,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useRedditKeywords,
  useAddRedditKeyword,
  useRemoveRedditKeyword,
  useEditRedditKeyword,
  useGenerateRedditKeywords,
  useBulkAddRedditKeywords,
  useSyncRedditKeywords,
  useRedditSubreddits,
  useAddRedditSubreddit,
  useRemoveRedditSubreddit,
  useGenerateRedditSubreddits,
  useBulkAddRedditSubreddits,
  useRedditPosts,
  useRedditStats,
} from "@/hooks/use-api";

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RedditBotPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("opportunities");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newSubreddit, setNewSubreddit] = useState("");
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [editingKeywordValue, setEditingKeywordValue] = useState("");
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [suggestedSubreddits, setSuggestedSubreddits] = useState<
    Array<{ name: string; subscribers: number; description: string; active_users: number }>
  >([]);
  const [subredditReviewOpen, setSubredditReviewOpen] = useState(false);

  // Data hooks
  const { data: statsData } = useRedditStats();
  const { data: postsData, isLoading: postsLoading } = useRedditPosts({
    tab: activeTab === "keywords" ? undefined : activeTab,
    search: searchQuery || undefined,
    limit: 20,
  });
  const { data: keywordsData, isLoading: keywordsLoading } = useRedditKeywords();
  const { data: subredditsData } = useRedditSubreddits();

  // Mutations
  const addKeyword = useAddRedditKeyword();
  const removeKeyword = useRemoveRedditKeyword();
  const editKeyword = useEditRedditKeyword();
  const generateKeywords = useGenerateRedditKeywords();
  const bulkAddKeywords = useBulkAddRedditKeywords();
  const syncKeywords = useSyncRedditKeywords();
  const addSubreddit = useAddRedditSubreddit();
  const removeSubreddit = useRemoveRedditSubreddit();
  const generateSubreddits = useGenerateRedditSubreddits();
  const bulkAddSubreddits = useBulkAddRedditSubreddits();

  const handleGenerateKeywords = () => {
    generateKeywords.mutate(10, {
      onSuccess: (data) => {
        setSuggestedKeywords(data.keywords);
        setReviewOpen(true);
      },
    });
  };

  const handleConfirmKeywords = () => {
    if (suggestedKeywords.length === 0) return;
    bulkAddKeywords.mutate(suggestedKeywords, {
      onSuccess: () => {
        setReviewOpen(false);
        setSuggestedKeywords([]);
      },
    });
  };

  const handleRemoveSuggestion = (keyword: string) => {
    setSuggestedKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handleStartEdit = (id: string, keyword: string) => {
    setEditingKeywordId(id);
    setEditingKeywordValue(keyword);
  };

  const handleSaveEdit = () => {
    if (!editingKeywordId || !editingKeywordValue.trim()) return;
    editKeyword.mutate({ id: editingKeywordId, keyword: editingKeywordValue.trim() });
    setEditingKeywordId(null);
    setEditingKeywordValue("");
  };

  const stats = statsData;
  const posts = postsData?.data ?? [];
  const keywords = keywordsData?.keywords ?? [];
  const subreddits = subredditsData?.subreddits ?? [];

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    addKeyword.mutate(newKeyword.trim());
    setNewKeyword("");
  };

  const handleAddSubreddit = () => {
    if (!newSubreddit.trim()) return;
    addSubreddit.mutate(newSubreddit.trim());
    setNewSubreddit("");
  };

  const handleGenerateSubreddits = () => {
    generateSubreddits.mutate(10, {
      onSuccess: (data) => {
        setSuggestedSubreddits(data.subreddits);
        setSubredditReviewOpen(true);
      },
    });
  };

  const handleConfirmSubreddits = () => {
    if (suggestedSubreddits.length === 0) return;
    const names = suggestedSubreddits.map((s) => s.name);
    bulkAddSubreddits.mutate(names, {
      onSuccess: () => {
        setSubredditReviewOpen(false);
        setSuggestedSubreddits([]);
      },
    });
  };

  const handleRemoveSubredditSuggestion = (name: string) => {
    setSuggestedSubreddits((prev) => prev.filter((s) => s.name !== name));
  };

  const formatSubscribers = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return String(count);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="bg-orange-500/20 text-orange-500 p-2 rounded-lg">
              <Bot className="h-6 w-6" />
            </span>
            Reddit Promotion Bot
          </h1>
          <p className="text-muted-foreground mt-2">
            Automatically discover relevant Reddit discussions to organically
            promote your content.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Bot Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Opportunities Found
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.opportunities ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {keywords.length > 0
                ? `Tracking ${keywords.filter((k) => k.is_active).length} keywords`
                : "Bot inactive"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replies Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.replied ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.replied
                ? "Threads replied to"
                : "No replies yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Est. Traffic Generated
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.estimatedTraffic ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on post engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="opportunities">New Opportunities</TabsTrigger>
            <TabsTrigger value="replied">Replied Threads</TabsTrigger>
            <TabsTrigger value="keywords">Tracked Keywords</TabsTrigger>
          </TabsList>

          {activeTab !== "keywords" && (
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subreddits or titles..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {postsLoading ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading opportunities...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No opportunities found</h3>
              <p className="text-muted-foreground mt-1">
                {keywords.length === 0
                  ? "Configure keywords in Bot Settings to start tracking Reddit."
                  : "No new matching posts found. The bot scans every 30 minutes."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            r/{post.subreddit}
                          </Badge>
                          {post.matched_keyword && (
                            <Badge variant="secondary" className="text-xs">
                              {post.matched_keyword}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(post.created_utc)}
                          </span>
                        </div>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline line-clamp-1 flex items-center gap-1"
                        >
                          {post.title}
                          <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        </a>
                        {post.body && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {post.body}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{post.score} upvotes</span>
                          <span>{post.num_comments} comments</span>
                          <span>by u/{post.author}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            post.relevance_score >= 70
                              ? "bg-green-100 text-green-700"
                              : post.relevance_score >= 40
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {post.relevance_score}% match
                        </div>
                        <Button size="sm" variant="outline" className="text-xs gap-1" asChild>
                          <a href={post.url} target="_blank" rel="noopener noreferrer">
                            View <ArrowUpRight className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Replied Threads Tab */}
        <TabsContent value="replied">
          {postsLoading ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No replied threads yet</h3>
              <p className="text-muted-foreground mt-1">
                Threads where the bot has posted a response will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            r/{post.subreddit}
                          </Badge>
                          <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                            Replied
                          </Badge>
                        </div>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {post.title}
                        </a>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{post.score} upvotes</span>
                          <span>{post.num_comments} comments</span>
                          <span>{formatTimeAgo(post.created_utc)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {keywords.length} keyword{keywords.length !== 1 ? "s" : ""} tracked
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleGenerateKeywords}
                disabled={generateKeywords.isPending}
              >
                <Sparkles
                  className={`h-3 w-3 ${generateKeywords.isPending ? "animate-pulse" : ""}`}
                />
                {generateKeywords.isPending ? "Generating..." : "Generate with AI"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => syncKeywords.mutate()}
                disabled={syncKeywords.isPending}
              >
                <RefreshCw
                  className={`h-3 w-3 ${syncKeywords.isPending ? "animate-spin" : ""}`}
                />
                Sync from Topics
              </Button>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => setSettingsOpen(true)}
              >
                <Plus className="h-3 w-3" />
                Add Keyword
              </Button>
            </div>
          </div>

          {keywordsLoading ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            </div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No keywords configured</h3>
              <p className="text-muted-foreground mt-1">
                Add keywords manually, sync from topics, or generate with AI.
              </p>
              <Button
                className="mt-4 gap-2"
                onClick={handleGenerateKeywords}
                disabled={generateKeywords.isPending}
              >
                <Sparkles className="h-4 w-4" />
                {generateKeywords.isPending ? "Generating..." : "Generate Keywords with AI"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keywords.map((kw) => (
                <Card key={kw.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingKeywordId === kw.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingKeywordValue}
                            onChange={(e) => setEditingKeywordValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={editKeyword.isPending}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingKeywordId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{kw.keyword}</span>
                            <Badge
                              variant={kw.is_active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {kw.is_active ? "Active" : "Paused"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{kw.crawl_count} scans</span>
                            {kw.last_result?.posts_matched !== undefined && (
                              <span>{kw.last_result.posts_matched} matches</span>
                            )}
                            {kw.crawled_at && (
                              <span>Last: {formatTimeAgo(kw.crawled_at)}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    {editingKeywordId !== kw.id && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(kw.id, kw.keyword)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyword.mutate(kw.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bot Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bot Settings</DialogTitle>
            <DialogDescription>
              Configure keywords and subreddits for the Reddit bot to monitor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Keywords Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Monitored Keywords ({keywords.length} active)
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 h-7"
                    onClick={handleGenerateKeywords}
                    disabled={generateKeywords.isPending}
                  >
                    <Sparkles
                      className={`h-3 w-3 ${generateKeywords.isPending ? "animate-pulse" : ""}`}
                    />
                    {generateKeywords.isPending ? "Generating..." : "AI Generate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 h-7"
                    onClick={() => syncKeywords.mutate()}
                    disabled={syncKeywords.isPending}
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${syncKeywords.isPending ? "animate-spin" : ""}`}
                    />
                    Sync Topics
                  </Button>
                </div>
              </div>

              {/* Existing keywords */}
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md mb-3">
                {keywords.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No keywords selected
                  </span>
                ) : (
                  keywords.map((kw) => (
                    <Badge
                      key={kw.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {kw.keyword}
                      <button
                        onClick={() => removeKeyword.mutate(kw.id)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>

              {/* Add keyword */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                />
                <Button
                  variant="outline"
                  onClick={handleAddKeyword}
                  disabled={!newKeyword.trim() || addKeyword.isPending}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Subreddits Section */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Subreddits to Monitor ({subreddits.length} active)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                By default, we search all of Reddit. Add specific subreddits to
                focus monitoring.
              </p>

              {/* Existing subreddits */}
              {subreddits.length > 0 && (
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md mb-3">
                  {subreddits.map((sub) => (
                    <Badge
                      key={sub.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      r/{sub.subreddit_name}
                      <button
                        onClick={() => removeSubreddit.mutate(sub.id)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add subreddit */}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. webdev, reactjs, nextjs"
                  value={newSubreddit}
                  onChange={(e) => setNewSubreddit(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubreddit()}
                />
                <Button
                  variant="outline"
                  onClick={handleAddSubreddit}
                  disabled={!newSubreddit.trim() || addSubreddit.isPending}
                >
                  Add
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 gap-2"
                onClick={handleGenerateSubreddits}
                disabled={generateSubreddits.isPending}
              >
                <Sparkles className="h-4 w-4" />
                {generateSubreddits.isPending ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Generated Subreddits Dialog */}
      <Dialog open={subredditReviewOpen} onOpenChange={setSubredditReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Suggested Subreddits</DialogTitle>
            <DialogDescription>
              These subreddits were verified to exist on Reddit. Remove any you don&apos;t want, then confirm to save.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {suggestedSubreddits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No subreddits to review. All removed.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto p-2 border rounded-md overflow-x-hidden">
                {suggestedSubreddits.map((sub) => (
                  <div
                    key={sub.name}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm shrink-0">r/{sub.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {formatSubscribers(sub.subscribers)} members
                        </Badge>
                        {sub.active_users > 0 && (
                          <Badge variant="outline" className="text-xs text-green-600 shrink-0">
                            {formatSubscribers(sub.active_users)} online
                          </Badge>
                        )}
                      </div>
                      {sub.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {sub.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSubredditSuggestion(sub.name)}
                      className="hover:bg-muted rounded-full p-1 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {suggestedSubreddits.length} subreddit{suggestedSubreddits.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSubredditReviewOpen(false);
                setSuggestedSubreddits([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubreddits}
              disabled={suggestedSubreddits.length === 0 || bulkAddSubreddits.isPending}
            >
              {bulkAddSubreddits.isPending ? "Saving..." : `Save ${suggestedSubreddits.length} Subreddits`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Generated Keywords Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Generated Keywords</DialogTitle>
            <DialogDescription>
              Remove any keywords you don&apos;t want, then confirm to save.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {suggestedKeywords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No keywords to review. All removed.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-md">
                {suggestedKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {kw}
                    <button
                      onClick={() => handleRemoveSuggestion(kw)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {suggestedKeywords.length} keyword{suggestedKeywords.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviewOpen(false);
                setSuggestedKeywords([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmKeywords}
              disabled={suggestedKeywords.length === 0 || bulkAddKeywords.isPending}
            >
              {bulkAddKeywords.isPending ? "Saving..." : `Save ${suggestedKeywords.length} Keywords`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
