"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  MoreVertical,
  Cloud,
  Image,
  CheckCircle,
  AlertTriangle,
  Globe,
  Loader2,
  Upload,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useContentDetail,
  useApproveContent,
  useRejectContent,
  useRequestChanges,
  useDistributeContent,
} from "@/hooks/use-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ContentStatus } from "@/types";

import { integrationsApi } from "@/lib/api-client";

function getStatusBadge(status: string) {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case ContentStatus.APPROVED.toLowerCase():
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-500 border-green-500/20"
        >
          Approved
        </Badge>
      );
    case ContentStatus.REJECTED.toLowerCase():
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-400 border-red-500/20"
        >
          Rejected
        </Badge>
      );
    case ContentStatus.PUBLISHED.toLowerCase():
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-400 border-blue-500/20"
        >
          Published
        </Badge>
      );
    case ContentStatus.NEEDS_REVISION.toLowerCase():
      return (
        <Badge
          variant="outline"
          className="bg-orange-500/10 text-orange-400 border-orange-500/20"
        >
          Needs Revision
        </Badge>
      );
    case ContentStatus.IN_REVIEW.toLowerCase():
    default:
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        >
          Needs Review
        </Badge>
      );
  }
}

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeSection, setActiveSection] = useState("s2");
  const [commentText, setCommentText] = useState("");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [activeIntegrations, setActiveIntegrations] = useState<any[]>([]);

  useEffect(() => {
    integrationsApi.get().then((data) => {
      setActiveIntegrations(data.integrations || []);
    }).catch(console.error);
  }, []);

  // Real API data
  const { data: content, isLoading, isError } = useContentDetail(id);

  // Mutations
  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();
  const distributeMutation = useDistributeContent();

  const handleApprove = () => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        if (activeIntegrations.length > 0) {
          setPublishDialogOpen(true);
        }
      }
    });
  };

  const handleReject = () => {
    rejectMutation.mutate({ id, reason: "Rejected by reviewer" });
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      toast.success("Comment added");
      setCommentText("");
    }
  };

  const handlePublish = () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }
    distributeMutation.mutate(
      { id, platforms: selectedPlatforms, settings: {} },
      {
        onSuccess: () => {
          setPublishDialogOpen(false);
          setSelectedPlatforms([]);
        },
      }
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center -m-8 -mt-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !content) {
    return (
      <div className="h-screen flex items-center justify-center -m-8 -mt-8">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-muted-foreground text-sm">
            Failed to load content
          </p>
          <Button variant="outline" onClick={() => router.push("/review")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Review
          </Button>
        </div>
      </div>
    );
  }

  const isApproved =
    content.status === ContentStatus.APPROVED || content.status === "APPROVED";
  const isPublished =
    content.status === ContentStatus.PUBLISHED ||
    content.status === "PUBLISHED";
  const isInReview =
    content.status === ContentStatus.IN_REVIEW || content.status === "REVIEW";
  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending;

  return (
    <div className="h-screen flex flex-col overflow-hidden -m-8 -mt-8">
      {/* Top Sticky Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-5 shrink-0 z-50">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            onClick={() => router.push("/review")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-5 w-px bg-border shrink-0" />
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="text-sm font-medium truncate text-foreground">
              {content.title}
            </span>
            {getStatusBadge(content.status)}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Cloud className="h-3 w-3" />
            Saved
          </span>

          {(isApproved || isPublished) && (
            <Button
              size="sm"
              className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              onClick={() => setPublishDialogOpen(true)}
            >
              <Upload className="h-3.5 w-3.5" />
              {isPublished ? "Republish" : "Publish"}
            </Button>
          )}

          {isInReview && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={handleReject}
                disabled={isMutating}
              >
                {rejectMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                Reject
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleApprove}
                disabled={isMutating}
              >
                {approveMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Approve
              </Button>
            </>
          )}

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Outline */}
        <aside className="w-56 bg-card border-r border-border flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Outline
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto py-3 px-2">
            {(content.outline || []).map((section: any) => (
              <div key={section.id} className="mb-0.5">
                <button
                  className={cn(
                    "flex items-start gap-2 px-2 py-1.5 rounded-md w-full text-left transition-colors",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent/60 text-foreground/80 hover:text-foreground"
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="text-[10px] font-bold text-muted-foreground/60 mt-0.5 shrink-0 w-5">H2</span>
                  <span className="text-xs font-medium leading-snug line-clamp-2">{section.title}</span>
                </button>

                {section.children?.map((child: any) => (
                  <button
                    key={child.id}
                    className={cn(
                      "flex items-start gap-2 px-2 py-1.5 pl-7 rounded-md w-full text-left transition-colors",
                      activeSection === child.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActiveSection(child.id)}
                  >
                    <span className="text-[10px] font-bold text-muted-foreground/40 mt-0.5 shrink-0 w-5">H3</span>
                    <span className="text-xs leading-snug line-clamp-2">{child.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Content Score */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Score
              </span>
              <span className="text-sm font-bold text-green-500">
                {content.quality_score ?? 0}<span className="text-xs text-muted-foreground font-normal">/10</span>
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1">
              <div
                className="bg-green-500 h-1 rounded-full transition-all"
                style={{ width: `${(content.quality_score ?? 0) * 10}%` }}
              />
            </div>
            <p className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
              <CheckCircle className="h-2.5 w-2.5 text-green-500 shrink-0" />
              Readability is good
            </p>
          </div>
        </aside>

        {/* Center: Content */}
        <section className="flex-1 bg-background overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-10 pb-24">
            {/* Cover Image */}
            <div className="h-64 w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl relative group overflow-hidden mb-8">
              {content.coverImage ? (
                <img
                  alt="Cover image"
                  className="w-full h-full object-cover"
                  src={content.coverImage}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/60 to-purple-900/80" />
              )}
              <button className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                <Image className="h-3 w-3" />
                Change Cover
              </button>
            </div>

            {/* Article Body */}
            <div className="editor-content prose prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
              prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-[15px] prose-p:leading-[1.85] prose-p:text-foreground/80
              prose-li:text-[15px] prose-li:leading-relaxed prose-li:text-foreground/80
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              {!content.draft && content.status === ContentStatus.DRAFT_READY ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <h3 className="text-base font-semibold mb-1">Generating content...</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Your article is being researched and drafted. This usually takes 2–4 minutes.
                  </p>
                </div>
              ) : (
                <ReactMarkdown>{content.draft || ""}</ReactMarkdown>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Full Screen Read Mode */}

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Publish Content
            </DialogTitle>
            <DialogDescription>
              Select the platforms where you want to distribute this content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {activeIntegrations.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-4">No connected platforms found.</p>
                <Button variant="outline" onClick={() => router.push('/settings')}>
                  Configure Integrations
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeIntegrations.filter(p => p.platform !== "google_search_console").map((platform) => {
                  const pId = platform.platform;
                  const label = pId === "dev.to" ? "Dev.to" : pId.charAt(0).toUpperCase() + pId.slice(1);
                  return (
                    <div
                      key={pId}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        selectedPlatforms.includes(pId)
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-border/80 hover:bg-accent/30"
                      )}
                      onClick={() => togglePlatform(pId)}
                    >
                      <Checkbox
                        id={pId}
                        checked={selectedPlatforms.includes(pId)}
                        onCheckedChange={() => togglePlatform(pId)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={pId}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Publish to {label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedPlatforms.length > 0 && (
              <div className="rounded-lg bg-accent/30 border border-border/50 p-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {selectedPlatforms.length}
                  </span>{" "}
                  platform{selectedPlatforms.length !== 1 ? "s" : ""} selected
                  for distribution.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
              disabled={distributeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={
                selectedPlatforms.length === 0 || distributeMutation.isPending
              }
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {distributeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {distributeMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
