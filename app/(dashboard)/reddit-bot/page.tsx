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
  useRedditQueries,
  useAddRedditQuery,
  useRemoveRedditQuery,
  useToggleRedditQuery,
  useEditRedditQuery,
  useGenerateRedditQueries,
  useBulkAddRedditQueries,
  useRedditLeads,
  useRedditLeadStats,
  useUpdateLeadStatus,
  useDismissLead,
  useTriggerProcess,
  useTriggerSearchScan,
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
  const [activeTab, setActiveTab] = useState("leads");
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
  const [newQueryText, setNewQueryText] = useState("");
  const [newQueryType, setNewQueryType] = useState<'pain' | 'solution'>('pain');
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [editingQueryValue, setEditingQueryValue] = useState("");
  const [suggestedQueries, setSuggestedQueries] = useState<Array<{ text: string; type: 'pain' | 'solution' }>>([]);
  const [queryReviewOpen, setQueryReviewOpen] = useState(false);
  const [leadsTab, setLeadsTab] = useState("new");
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsSearch, setLeadsSearch] = useState("");

  // Data hooks
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
  const { data: queriesData, isLoading: queriesLoading } = useRedditQueries();
  const addQuery = useAddRedditQuery();
  const removeQuery = useRemoveRedditQuery();
  const toggleQuery = useToggleRedditQuery();
  const editQuery = useEditRedditQuery();
  const generateQueries = useGenerateRedditQueries();
  const bulkAddQueries = useBulkAddRedditQueries();
  const { data: leadsData, isLoading: leadsLoading } = useRedditLeads({
    page: leadsPage,
    limit: 20,
    status: leadsTab,
    search: leadsSearch || undefined,
  });
  const { data: leadStatsData } = useRedditLeadStats();
  const updateLeadStatus = useUpdateLeadStatus();
  const dismissLead = useDismissLead();
  const triggerProcess = useTriggerProcess();
  const triggerSearchScan = useTriggerSearchScan();

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

  const keywords = keywordsData?.keywords ?? [];
  const subreddits = subredditsData?.subreddits ?? [];
  const queries = queriesData?.queries ?? [];
  const painQueries = queries.filter((q) => q.query_type === 'pain');
  const solutionQueries = queries.filter((q) => q.query_type === 'solution');

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

  // ── Search Query handlers ──────────────────────────────────────────
  const handleAddQuery = () => {
    if (!newQueryText.trim()) return;
    addQuery.mutate({ queryText: newQueryText.trim(), queryType: newQueryType });
    setNewQueryText("");
  };

  const handleStartEditQuery = (id: string, text: string) => {
    setEditingQueryId(id);
    setEditingQueryValue(text);
  };

  const handleSaveEditQuery = () => {
    if (!editingQueryId || !editingQueryValue.trim()) return;
    editQuery.mutate({ id: editingQueryId, queryText: editingQueryValue.trim() });
    setEditingQueryId(null);
    setEditingQueryValue("");
  };

  const handleGenerateQueries = () => {
    generateQueries.mutate(20, {
      onSuccess: (data) => {
        const combined = [
          ...data.pain_queries.map((t) => ({ text: t, type: 'pain' as const })),
          ...data.solution_queries.map((t) => ({ text: t, type: 'solution' as const })),
        ];
        setSuggestedQueries(combined);
        setQueryReviewOpen(true);
      },
    });
  };

  const handleConfirmQueries = () => {
    if (suggestedQueries.length === 0) return;
    bulkAddQueries.mutate(suggestedQueries, {
      onSuccess: () => {
        setQueryReviewOpen(false);
        setSuggestedQueries([]);
      },
    });
  };

  const handleRemoveQuerySuggestion = (text: string) => {
    setSuggestedQueries((prev) => prev.filter((q) => q.text !== text));
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
              New Leads
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadStatsData?.new ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {keywords.length > 0
                ? `Tracking ${keywords.filter((k) => k.is_active).length} keywords`
                : "Configure keywords to start"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStatsData?.reviewed ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Leads reviewed for engagement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engaged
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadStatsData?.engaged ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {leadStatsData?.total ?? 0} leads found
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="keywords">Tracked Keywords</TabsTrigger>
            <TabsTrigger value="queries">Search Queries</TabsTrigger>
          </TabsList>

          {activeTab === "leads" ? (
            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  className="pl-9"
                  value={leadsSearch}
                  onChange={(e) => { setLeadsSearch(e.target.value); setLeadsPage(1); }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => triggerSearchScan.mutate()}
                disabled={triggerSearchScan.isPending}
              >
                <Search className="h-3.5 w-3.5" />
                {triggerSearchScan.isPending ? "Scanning..." : "Search Scan"}
              </Button>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => triggerProcess.mutate()}
                disabled={triggerProcess.isPending}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${triggerProcess.isPending ? "animate-spin" : ""}`} />
                {triggerProcess.isPending ? "Processing..." : "Process Posts"}
              </Button>
            </div>
          ) : null}
        </div>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          {/* Lead status tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { value: "new", label: "New", count: leadStatsData?.new ?? 0 },
              { value: "reviewed", label: "Reviewed", count: leadStatsData?.reviewed ?? 0 },
              { value: "engaged", label: "Engaged", count: leadStatsData?.engaged ?? 0 },
              { value: "dismissed", label: "Dismissed", count: leadStatsData?.dismissed ?? 0 },
              { value: "all", label: "All", count: leadStatsData?.total ?? 0 },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={leadsTab === tab.value ? "default" : "outline"}
                size="sm"
                onClick={() => { setLeadsTab(tab.value); setLeadsPage(1); }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {leadsLoading ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          ) : !leadsData?.data || leadsData.data.length === 0 ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {leadsTab === "new" ? "No new leads yet. Click \"Process Posts\" to analyze raw posts." : `No ${leadsTab} leads.`}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {leadsData.data.map((lead) => {
                  const post = lead.raw_posts;
                  return (
                    <Card key={lead.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                r/{post.subreddit}
                              </Badge>
                              <Badge
                                variant={lead.similarity_score >= 0.7 ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {Math.round(lead.similarity_score * 100)}% match
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {lead.source_channel === "search" ? "Search" : "Listing"}
                              </Badge>
                              {post.score > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <ArrowUpRight className="h-3 w-3" />
                                  {post.score}
                                </span>
                              )}
                              {post.num_comments > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <MessageSquare className="h-3 w-3" />
                                  {post.num_comments}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(post.created_utc || post.discovered_at)}
                              </span>
                            </div>
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-blue-500 transition-colors line-clamp-1"
                            >
                              {post.title}
                              <ExternalLink className="h-3 w-3 inline ml-1 opacity-50" />
                            </a>
                            {post.body && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {post.body}
                              </p>
                            )}
                            {lead.matched_keywords.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {lead.matched_keywords.map((kw) => (
                                  <Badge key={kw} variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                                    {kw}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {lead.status === "new" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateLeadStatus.mutate({ leadId: lead.id, status: "reviewed" })}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Review
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-muted-foreground"
                                  onClick={() => dismissLead.mutate(lead.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            {lead.status === "reviewed" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateLeadStatus.mutate({ leadId: lead.id, status: "engaged" })}
                              >
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                Engage
                              </Button>
                            )}
                            {(lead.status === "engaged" || lead.status === "dismissed") && (
                              <Badge variant={lead.status === "engaged" ? "default" : "secondary"}>
                                {lead.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {leadsData.data.length >= 20 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={leadsPage <= 1}
                    onClick={() => setLeadsPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground flex items-center px-3">
                    Page {leadsPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLeadsPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
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

        {/* Search Queries Tab */}
        <TabsContent value="queries" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {queries.length} search quer{queries.length !== 1 ? "ies" : "y"} configured
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleGenerateQueries}
              disabled={generateQueries.isPending}
            >
              <Sparkles
                className={`h-3 w-3 ${generateQueries.isPending ? "animate-pulse" : ""}`}
              />
              {generateQueries.isPending ? "Generating..." : "Generate with AI"}
            </Button>
          </div>

          {/* Add new query */}
          <div className="flex gap-2">
            <select
              value={newQueryType}
              onChange={(e) => setNewQueryType(e.target.value as 'pain' | 'solution')}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="pain">Pain</option>
              <option value="solution">Solution</option>
            </select>
            <Input
              placeholder="Add a search query (e.g. 'best tool for...')"
              value={newQueryText}
              onChange={(e) => setNewQueryText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddQuery()}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleAddQuery}
              disabled={!newQueryText.trim() || addQuery.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {queriesLoading ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            </div>
          ) : queries.length === 0 ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No search queries configured</h3>
              <p className="text-muted-foreground mt-1">
                Add queries manually or generate with AI. Queries help find Reddit posts where people express pain points or seek solutions.
              </p>
              <Button
                className="mt-4 gap-2"
                onClick={handleGenerateQueries}
                disabled={generateQueries.isPending}
              >
                <Sparkles className="h-4 w-4" />
                {generateQueries.isPending ? "Generating..." : "Generate Queries with AI"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pain Queries */}
              {painQueries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">Pain</Badge>
                    Frustration &amp; problem queries ({painQueries.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {painQueries.map((q) => (
                      <Card key={q.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {editingQueryId === q.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingQueryValue}
                                  onChange={(e) => setEditingQueryValue(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleSaveEditQuery()}
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                                <Button variant="ghost" size="sm" onClick={handleSaveEditQuery} disabled={editQuery.isPending}>
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingQueryId(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{q.query_text}</span>
                                <Badge variant={q.is_active ? "default" : "secondary"} className="text-xs">
                                  {q.is_active ? "Active" : "Paused"}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {editingQueryId !== q.id && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleQuery.mutate({ id: q.id, isActive: !q.is_active })}
                              >
                                {q.is_active ? "Pause" : "Enable"}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleStartEditQuery(q.id, q.query_text)}>
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeQuery.mutate(q.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Solution Queries */}
              {solutionQueries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">Solution</Badge>
                    Solution-seeking queries ({solutionQueries.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {solutionQueries.map((q) => (
                      <Card key={q.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {editingQueryId === q.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingQueryValue}
                                  onChange={(e) => setEditingQueryValue(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleSaveEditQuery()}
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                                <Button variant="ghost" size="sm" onClick={handleSaveEditQuery} disabled={editQuery.isPending}>
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingQueryId(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{q.query_text}</span>
                                <Badge variant={q.is_active ? "default" : "secondary"} className="text-xs">
                                  {q.is_active ? "Active" : "Paused"}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {editingQueryId !== q.id && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleQuery.mutate({ id: q.id, isActive: !q.is_active })}
                              >
                                {q.is_active ? "Pause" : "Enable"}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleStartEditQuery(q.id, q.query_text)}>
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeQuery.mutate(q.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Review Generated Queries Dialog */}
      <Dialog open={queryReviewOpen} onOpenChange={setQueryReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Generated Search Queries</DialogTitle>
            <DialogDescription>
              Remove any queries you don&apos;t want, then confirm to save.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {suggestedQueries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No queries to review. All removed.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto p-2 border rounded-md">
                {suggestedQueries.map((q) => (
                  <div
                    key={q.text}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                  >
                    <Badge
                      variant={q.type === 'pain' ? 'destructive' : 'default'}
                      className={`text-xs shrink-0 ${q.type === 'solution' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}`}
                    >
                      {q.type}
                    </Badge>
                    <span className="text-sm flex-1">{q.text}</span>
                    <button
                      onClick={() => handleRemoveQuerySuggestion(q.text)}
                      className="hover:bg-muted rounded-full p-1 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {suggestedQueries.filter((q) => q.type === 'pain').length} pain,{" "}
              {suggestedQueries.filter((q) => q.type === 'solution').length} solution queries selected
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setQueryReviewOpen(false);
                setSuggestedQueries([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmQueries}
              disabled={suggestedQueries.length === 0 || bulkAddQueries.isPending}
            >
              {bulkAddQueries.isPending ? "Saving..." : `Save ${suggestedQueries.length} Queries`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
