"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  MoreVertical,
  Cloud,
  SortAsc,
  Bold,
  Italic,
  Link2,
  List,
  Quote,
  Sparkles,
  Image,
  AtSign,
  Send,
  Heading,
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
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6 flex-1">
          {/* Back */}
          <button
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={() => router.push("/review")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-border" />

          {/* Title & Status */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Projects</span>
              <span className="text-[10px]">&#8250;</span>
              <span>Marketing Q3</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold truncate max-w-[400px]">
                {content.title}
              </span>
              {getStatusBadge(content.status)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center mr-4 text-xs text-muted-foreground">
            <Cloud className="h-3.5 w-3.5 mr-1" />
            Saved 2m ago
          </div>

          {/* Show Publish button when approved */}
          {(isApproved || isPublished) && (
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              onClick={() => setPublishDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              {isPublished ? "Republish" : "Publish"}
            </Button>
          )}

          {/* Show review actions when content is in review */}
          {isInReview && (
            <>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={handleReject}
                disabled={isMutating}
              >
                {rejectMutation.isPending ? (
                   <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Reject
              </Button>
              <Button
                className="shadow-lg shadow-primary/20 gap-2"
                onClick={handleApprove}
                disabled={isMutating}
              >
                {approveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve
              </Button>
            </>
          )}

          <div className="ml-2 pl-2 border-l border-border">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace (3-Column Layout) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Outline */}
        <aside className="w-72 bg-card border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Outline
            </h3>
            <button className="text-muted-foreground hover:text-primary">
              <SortAsc className="h-4 w-4" />
            </button>
          </div>
            {/* Dynamic Outline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {(content.outline || []).map((section: any) => (
                <div key={section.id} className="mb-1">
                  {/* Section Header (H2) */}
                  <button
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg w-full text-left transition-colors text-sm",
                      activeSection === section.id
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "hover:bg-accent text-foreground"
                    )}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Heading className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                    <span className="font-medium truncate">{section.title}</span>
                  </button>

                  {/* Subsections (H3) */}
                  {section.children?.map((child: any) => (
                    <button
                      key={child.id}
                      className={cn(
                        "group flex items-center gap-2 p-2 ml-4 rounded-lg w-[calc(100%-1rem)] text-left transition-colors text-sm",
                        activeSection === child.id
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setActiveSection(child.id)}
                    >
                      <span className="text-[10px] opacity-50 shrink-0 border border-border px-1 rounded">
                        {child.level?.toUpperCase() || "H3"}
                      </span>
                      <span className="truncate">{child.title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

          {/* SEO Score Widget */}
          <div className="p-4 border-t border-border bg-accent/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Content Score
              </span>
              <span className="text-sm font-bold text-green-500">
                {content.quality_score ?? 0}/10
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${(content.quality_score ?? 0)*10}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1">
                <CheckCircle className="h-2.5 w-2.5 text-green-500" />
                Readability is good
              </p>
            </div>
          </div>
        </aside>

        {/* Center: Editor */}
        <section className="flex-1 bg-background relative overflow-y-auto flex flex-col items-center">
          {/* Floating Toolbar */}
          <div className="sticky top-6 z-40 bg-card border border-border rounded-lg shadow-xl px-2 py-1.5 flex items-center gap-1 mb-8 mt-6">
            <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
              <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                <Heading className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                <Bold className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                <Italic className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                <Link2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
              <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                <List className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                <Quote className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium transition-colors">
                <Sparkles className="h-3.5 w-3.5" />
                AI Rephrase
              </button>
            </div>
          </div>

          {/* Editor Surface */}
          <div className="w-full max-w-3xl bg-card min-h-[1000px] shadow-sm rounded-lg mb-20">
            {/* Cover Image Area */}
            <div className="h-48 w-full bg-gradient-to-r from-blue-900 to-indigo-900 rounded-t-lg relative group overflow-hidden">
              {content.coverImage && (
                <img
                  alt="Cover image"
                  className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                  src={content.coverImage}
                />
              )}
              <button className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Image className="h-3.5 w-3.5" />
                Change Cover
              </button>
            </div>

            <div className="px-12 py-12 editor-content prose prose-invert max-w-none">
              <ReactMarkdown>{content.draft || ""}</ReactMarkdown>
            </div>

            {/* Pro Tip Callout */}
            <div className="mx-12 my-8 p-6 bg-accent/30 rounded-lg border border-border/50 flex gap-4">
              <div className="bg-primary/20 p-2 rounded-full h-fit">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Pro Tip</h4>
                <p className="text-sm text-muted-foreground leading-normal">
                  Always maintain a &quot;human in the loop&quot; workflow. AI is
                  a powerful assistant, not a replacement for human judgment and
                  brand voice.
                </p>
              </div>
            </div>
          </div>
          <div className="h-20 shrink-0" />
        </section>


      </main>

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
