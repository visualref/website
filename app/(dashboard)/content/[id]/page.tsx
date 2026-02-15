"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockContentDetail } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("s2");
  const [commentText, setCommentText] = useState("");

  // Use mock data
  const content = mockContentDetail;

  const handleApprove = () => {
    toast.success("Content approved!");
    router.push("/review");
  };

  const handleReject = () => {
    toast.error("Content rejected");
    router.push("/review");
  };

  const handleRequestChanges = () => {
    toast.info("Changes requested");
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      toast.success("Comment added");
      setCommentText("");
    }
  };

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
              <span className="text-[10px]">›</span>
              <span>Marketing Q3</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold truncate max-w-[400px]">
                {content.title}
              </span>
              <Badge
                variant="outline"
                className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              >
                Needs Review
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center mr-4 text-xs text-muted-foreground">
            <Cloud className="h-3.5 w-3.5 mr-1" />
            Saved 2m ago
          </div>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleReject}
          >
            Reject
          </Button>
          <Button variant="outline" onClick={handleRequestChanges}>
            Request Changes
          </Button>
          <Button
            className="shadow-lg shadow-primary/20 gap-2"
            onClick={handleApprove}
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <div className="ml-2 pl-2 border-l border-border">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
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
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* H1 */}
            <button
              className={cn(
                "group flex items-center gap-2 p-2 rounded-lg w-full text-left transition-colors text-sm",
                activeSection === "s1"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "hover:bg-accent text-foreground"
              )}
              onClick={() => setActiveSection("s1")}
            >
              <Heading className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">Introduction</span>
            </button>

            {/* H2: The Rise of Generative AI */}
            <button
              className={cn(
                "group flex items-center gap-2 p-2 ml-4 rounded-lg w-full text-left transition-colors text-sm",
                activeSection === "s2"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "hover:bg-accent text-muted-foreground"
              )}
              onClick={() => setActiveSection("s2")}
            >
              <span className="text-xs opacity-70">H2</span>
              <span className="font-medium">The Rise of Generative AI</span>
            </button>

            {/* H3s */}
            {["Impact on SEO", "Speed to Market"].map((title, i) => (
              <button
                key={i}
                className={cn(
                  "group flex items-center gap-2 p-2 ml-8 rounded-lg w-full text-left transition-colors text-sm",
                  "hover:bg-accent text-muted-foreground hover:text-foreground relative"
                )}
              >
                <span className="text-xs opacity-50">H3</span>
                <span>{title}</span>
              </button>
            ))}

            {/* H2: Ethical Considerations */}
            <button
              className="group flex items-center gap-2 p-2 ml-4 rounded-lg w-full text-left transition-colors text-sm hover:bg-accent text-muted-foreground hover:text-foreground"
              onClick={() => setActiveSection("s3")}
            >
              <span className="text-xs opacity-50">H2</span>
              <span className="font-medium">Ethical Considerations</span>
            </button>

            {["Copyright Issues", "Bias in Models"].map((title, i) => (
              <button
                key={i}
                className="group flex items-center gap-2 p-2 ml-8 rounded-lg w-full text-left transition-colors text-sm hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <span className="text-xs opacity-50">H3</span>
                <span>{title}</span>
              </button>
            ))}

            {/* H2: Conclusion */}
            <button className="group flex items-center gap-2 p-2 ml-4 rounded-lg w-full text-left transition-colors text-sm hover:bg-accent text-muted-foreground hover:text-foreground">
              <span className="text-xs opacity-50">H2</span>
              <span className="font-medium">Conclusion</span>
            </button>
          </div>

          {/* SEO Score Widget */}
          <div className="p-4 border-t border-border bg-accent/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Content Score
              </span>
              <span className="text-sm font-bold text-green-500">
                {content.contentScore}/100
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${content.contentScore}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1">
                <CheckCircle className="h-2.5 w-2.5 text-green-500" />
                Readability is good
              </p>
              <p className="flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5 text-yellow-500" />
                Keyword density low
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

            {/* Content */}
            <div
              className="px-12 py-12 editor-content prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />

            {/* Pro Tip Callout */}
            <div className="mx-12 my-8 p-6 bg-accent/30 rounded-lg border border-border/50 flex gap-4">
              <div className="bg-primary/20 p-2 rounded-full h-fit">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Pro Tip</h4>
                <p className="text-sm text-muted-foreground leading-normal">
                  Always maintain a &quot;human in the loop&quot; workflow. AI is a
                  powerful assistant, not a replacement for human judgment and
                  brand voice.
                </p>
              </div>
            </div>
          </div>
          <div className="h-20 shrink-0" />
        </section>

        {/* Right Sidebar: Context */}
        <aside className="w-80 bg-card border-l border-border flex flex-col shrink-0">
          <Tabs defaultValue="comments" className="flex flex-col h-full">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0">
              <TabsTrigger
                value="comments"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 py-3 text-sm"
              >
                Comments{" "}
                <Badge className="ml-1 h-4 px-1.5 text-[10px] bg-primary text-white">
                  {content.comments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 py-3 text-sm"
              >
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="flex-1 flex flex-col m-0">
              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {content.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={cn("flex gap-3", comment.resolved && "opacity-60")}
                  >
                    <Avatar className="h-8 w-8 border border-border shrink-0">
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {comment.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-accent/50 rounded-lg p-3 rounded-tl-none relative overflow-hidden">
                        {comment.resolved && (
                          <div className="absolute top-0 right-0 p-1 bg-green-500/20 rounded-bl text-green-500">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-semibold">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comment.resolved ? "1d ago" : "2h ago"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>

                      {/* Resolved tag */}
                      {comment.resolved && (
                        <p className="text-xs text-green-500 mt-1 ml-1 flex items-center gap-1">
                          Resolved by You
                        </p>
                      )}

                      {/* Replies */}
                      {comment.replies?.map((reply) => (
                        <div key={reply.id} className="flex gap-2 mt-3 ml-2">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                            ME
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-primary">
                                @{comment.author.name.split(" ")[0]}
                              </span>{" "}
                              {reply.content.replace(/@\w+\s*/g, "")}
                            </p>
                            <button className="text-xs text-muted-foreground underline mt-1 hover:text-primary">
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-border">
                <div className="relative">
                  <Textarea
                    className="bg-accent/50 border-border resize-none pr-20"
                    placeholder="Add a comment... (Type @ to mention)"
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                      <AtSign className="h-4 w-4" />
                    </button>
                    <button
                      className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-md transition-colors shadow-lg"
                      onClick={handleSendComment}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto p-4 m-0">
              <div className="space-y-4">
                {content.versions.map((version) => (
                  <div key={version.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
                        v{version.version}
                      </div>
                      <div className="w-px h-full bg-border mt-2" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{version.summary}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {version.updatedBy.name} ·{" "}
                        {new Date(version.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </main>
    </div>
  );
}
