"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Terminal, Ghost, Loader2, CheckCircle2, Trash2, LayoutTemplate, ShoppingCart, Monitor, User, Mail, Shield, Building2, Webhook, Plus, ExternalLink, Search } from "lucide-react";
import { integrationsApi, competitorsApi } from "@/lib/api-client";
import { useAuthStore } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { toast } from "sonner";
import type { Competitor } from "@/types";

// Safely turn any error/message shape into a plain string for toast rendering.
// Prevents "Objects are not valid as a React child" when the server returns
// { message, code } or similar object-shaped errors.
const toMessage = (val: unknown, fallback: string): string => {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    const anyVal = val as any;
    if (typeof anyVal.message === "string") return anyVal.message;
    if (typeof anyVal.error === "string") return anyVal.error;
    try {
      return JSON.stringify(anyVal);
    } catch {
      return fallback;
    }
  }
  return String(val);
};

const extractApiError = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  return toMessage(
    data?.error ?? data?.message ?? data ?? error?.message,
    fallback
  );
};

const INTEGRATIONS_DEFS = [
  {
    id: "wordpress",
    name: "WordPress",
    icon: Globe,
    iconColor: "text-[#21759b] dark:text-[#38a8e0]",
  },
  {
    id: "api",
    name: "Api",
    icon: Webhook,
    iconColor: "text-zinc-600 dark:text-zinc-400",
  },
  {
    id: "dev-to",
    name: "Dev.to",
    icon: Terminal,
    iconColor: "text-zinc-800 dark:text-zinc-200",
  },
  {
    id: "ghost",
    name: "Ghost",
    icon: Ghost,
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    id: "google_search_console",
    name: "Google Search Console",
    icon: Globe,
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    id: "webflow",
    name: "Webflow",
    icon: LayoutTemplate,
    iconColor: "text-blue-600 dark:text-blue-500",
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: ShoppingCart,
    iconColor: "text-[#95BF47] dark:text-[#95BF47]",
  },
  {
    id: "wix",
    name: "Wix",
    icon: Monitor,
    iconColor: "text-black dark:text-white",
  },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  
  // Integrations state
  const [activeIntegrations, setActiveIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isIntegrationsDialogOpen, setIsIntegrationsDialogOpen] = useState(false);
  
  // Competitors state
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
  const [isAddCompetitorDialogOpen, setIsAddCompetitorDialogOpen] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({ name: "", url: "", notes: "" });
  const [isSavingCompetitor, setIsSavingCompetitor] = useState(false);

  // Form states for Integrations
  const [devToApiKey, setDevToApiKey] = useState("");
  const [ghostUrl, setGhostUrl] = useState("");
  const [ghostAdminApiKey, setGhostAdminApiKey] = useState("");
  const [ghostContentApiKey, setGhostContentApiKey] = useState("");
  const [ghostAuthor, setGhostAuthor] = useState("");
  const [ghostPublishStatus, setGhostPublishStatus] = useState<"publish" | "draft">("publish");
  const [wpUrl, setWpUrl] = useState("");
  const [wpIntegrationKey, setWpIntegrationKey] = useState("");
  const [webflowApiToken, setWebflowApiToken] = useState("");
  const [webflowPublishStatus, setWebflowPublishStatus] = useState<"publish" | "draft">("publish");
  const [shopifyStoreName, setShopifyStoreName] = useState("");
  const [shopifyClientId, setShopifyClientId] = useState("");
  const [shopifyClientSecret, setShopifyClientSecret] = useState("");
  const [shopifyBlogId, setShopifyBlogId] = useState("");
  const [shopifyAuthor, setShopifyAuthor] = useState("");
  const [shopifyPublishStatus, setShopifyPublishStatus] = useState<"publish" | "draft">("publish");
  const [wixSiteId, setWixSiteId] = useState("");
  const [wixApiKey, setWixApiKey] = useState("");
  const [wixPublishStatus, setWixPublishStatus] = useState<"publish" | "draft">("publish");

  const [isSaving, setIsSaving] = useState(false);
  const [deletingPlatform, setDeletingPlatform] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchIntegrations();
    fetchCompetitors();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { integrations } = await integrationsApi.get();
      setActiveIntegrations(integrations || []);
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetitors = async () => {
    try {
      setLoadingCompetitors(true);
      const { competitors } = await competitorsApi.list();
      setCompetitors(competitors || []);
    } catch (error) {
      console.error("Failed to fetch competitors:", error);
      toast.error("Failed to load competitors");
    } finally {
      setLoadingCompetitors(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      const { url } = await integrationsApi.getGoogleAuthUrl();
      if (!url) {
        toast.error("Could not get Google auth URL. Please try again.");
        setIsConnecting(false);
        return;
      }
      window.location.href = url;
    } catch (error: any) {
      toast.error(
        extractApiError(error, "Failed to initiate connection to Google Search Console")
      );
      setIsConnecting(false);
    }
  };

  const handleOpenIntegrationsDialog = (id: string) => {
    setSelectedIntegration(id);
    // Reset fields
    setDevToApiKey("");
    setGhostUrl("");
    setGhostAdminApiKey("");
    setGhostContentApiKey("");
    setGhostAuthor("");
    setGhostPublishStatus("publish");
    setWpUrl("");
    setWpIntegrationKey("");
    setWebflowApiToken("");
    setWebflowPublishStatus("publish");
    setShopifyStoreName("");
    setShopifyClientId("");
    setShopifyClientSecret("");
    setShopifyBlogId("");
    setShopifyAuthor("");
    setShopifyPublishStatus("publish");
    setWixSiteId("");
    setWixApiKey("");
    setWixPublishStatus("publish");
    setIsIntegrationsDialogOpen(true);
  };

  const { data: subData } = useSubscription();
  const hasAccess = subData?.has_active_subscription || subData?.is_in_trial;

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;

    if (!hasAccess) {
      toast.error("Upgrade your plan to connect integrations.");
      return;
    }

    let credentials: any = {};
    if (selectedIntegration === "dev-to") {
      if (!devToApiKey) {
        toast.error("API Key is required");
        return;
      }
      credentials = { apiKey: devToApiKey };
    } else if (selectedIntegration === "ghost") {
      if (!ghostUrl || !ghostAdminApiKey || !ghostContentApiKey) {
        toast.error("URL, Admin API Key, and Content API Key are required");
        return;
      }
      credentials = { 
        url: ghostUrl, 
        adminApiKey: ghostAdminApiKey,
        contentApiKey: ghostContentApiKey,
        author: ghostAuthor || undefined,
        publishStatus: ghostPublishStatus
      };
    } else if (selectedIntegration === "wordpress") {
      if (!wpUrl || !wpIntegrationKey) {
        toast.error("Site URL and Integration Key are required");
        return;
      }
      credentials = { url: wpUrl, integrationKey: wpIntegrationKey };
    } else if (selectedIntegration === "webflow") {
      if (!webflowApiToken) {
        toast.error("API Token is required");
        return;
      }
      credentials = { apiToken: webflowApiToken, publishStatus: webflowPublishStatus };
    } else if (selectedIntegration === "shopify") {
      if (!shopifyStoreName || !shopifyClientId || !shopifyClientSecret || !shopifyBlogId) {
        toast.error("Store Name, Client ID, Client Secret, and Blog ID are required");
        return;
      }
      credentials = { 
        storeName: shopifyStoreName, 
        clientId: shopifyClientId,
        clientSecret: shopifyClientSecret,
        blogId: shopifyBlogId,
        author: shopifyAuthor || undefined,
        publishStatus: shopifyPublishStatus
      };
    } else if (selectedIntegration === "wix") {
      if (!wixSiteId || !wixApiKey) {
        toast.error("Site ID and API Key are required");
        return;
      }
      credentials = { siteId: wixSiteId, apiKey: wixApiKey, publishStatus: wixPublishStatus };
    }

    setIsSaving(true);
    try {
      const platform = selectedIntegration === "dev-to" ? "dev.to" : selectedIntegration;
      await integrationsApi.save({
        platform,
        credentials
      });
      toast.success(`${selectedIntegration} integration saved successfully!`);
      setIsIntegrationsDialogOpen(false);
      fetchIntegrations();
    } catch (error: any) {
      const status = error?.response?.status;
      const fallback =
        status === 400 || status === 401 || status === 403
          ? "Invalid credentials. Please double-check and try again."
          : status === 402
          ? "Upgrade your plan to connect integrations."
          : "Failed to verify and save integration credentials.";
      toast.error(extractApiError(error, fallback));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIntegration = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      if (!confirm("Are you sure you want to disconnect this integration?")) return;
      setDeletingPlatform(id);
      const platform = id === "dev-to" ? "dev.to" : id;
      await integrationsApi.delete(platform);
      toast.success("Integration removed successfully");
      fetchIntegrations();
    } catch (error: any) {
      toast.error(extractApiError(error, "Failed to remove integration"));
    } finally {
      setDeletingPlatform(null);
    }
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitor.name) {
      toast.error("Competitor name is required");
      return;
    }

    setIsSavingCompetitor(true);
    try {
      await competitorsApi.create(newCompetitor);
      toast.success("Competitor added successfully!");
      setIsAddCompetitorDialogOpen(false);
      setNewCompetitor({ name: "", url: "", notes: "" });
      fetchCompetitors();
    } catch (error: any) {
      toast.error(extractApiError(error, "Failed to add competitor."));
    } finally {
      setIsSavingCompetitor(false);
    }
  };

  const handleDeleteCompetitor = async (id: string) => {
    try {
      if (!confirm("Are you sure you want to remove this competitor?")) return;
      await competitorsApi.delete(id);
      toast.success("Competitor removed successfully");
      fetchCompetitors();
    } catch (error: any) {
      toast.error(extractApiError(error, "Failed to remove competitor"));
    }
  };

  const getIntegrationStatus = (id: string) => {
    const platform = id === "dev-to" ? "dev.to" : id;
    const isConfigured = activeIntegrations.some(i => i.platform === platform);
    return isConfigured ? "Configured" : "Configure now";
  };

  const selectedConfig = INTEGRATIONS_DEFS.find(i => i.id === selectedIntegration);

  const userInitials =
    (user?.name || "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-8 max-w-[1200px]">
      <Tabs defaultValue="integrations" className="space-y-10">
        <div className="border-b border-border/40">
          <TabsList variant="line" className="flex justify-start gap-8 h-auto p-0 pb-0">
            {["Account", "Integrations", "Competitors"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="text-base pb-3 data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-8 pt-2 outline-none">
          <h2 className="text-2xl font-bold tracking-tight text-foreground/95">
            Your Account
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="bg-card/40 backdrop-blur-xl border-border/60 shadow-sm md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <div className="flex shrink-0 items-center justify-center rounded-full w-16 h-16 bg-gradient-to-br from-primary/80 to-blue-500/80 text-white text-xl font-bold shadow-lg">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground truncate">
                      {user?.name || "—"}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-0.5 truncate">
                      {user?.email || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/60 shadow-sm">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Name</span>
                </div>
                <p className="text-lg font-medium text-foreground/90">{user?.name || "—"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/60 shadow-sm">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Email</span>
                </div>
                <p className="text-lg font-medium text-foreground/90">{user?.email || "—"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/60 shadow-sm">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Role</span>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold w-fit",
                  user?.role === "admin"
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    user?.role === "admin" ? "bg-primary" : "bg-muted-foreground/50"
                  )} />
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—"}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/60 shadow-sm">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Workspace</span>
                </div>
                <p className="text-lg font-medium text-foreground/90">{user?.workspace?.name || "—"}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-8 pt-2 outline-none">
          <h2 className="text-2xl font-bold tracking-tight text-foreground/95">
            Integrate with your favourite CMS platform:
          </h2>
          
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {INTEGRATIONS_DEFS.map((integration) => {
                const Icon = integration.icon;
                const status = getIntegrationStatus(integration.id);
                const isConfigured = status === "Configured";
                const isDisabled = integration.id === "api";

                return (
                  <Card 
                    key={integration.id}
                    onClick={() => {
                      if (!hasAccess && integration.id !== "google_search_console") {
                        toast.error("Upgrade your plan to connect integrations.");
                        return;
                      }
                      if (integration.id === "google_search_console") {
                        if (!isConfigured) handleConnectGoogle();
                      } else if (!isDisabled) {
                        handleOpenIntegrationsDialog(integration.id);
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300",
                      "bg-card/40 backdrop-blur-xl border-border/60 shadow-sm",
                      isDisabled
                        ? "opacity-60 cursor-not-allowed"
                        : integration.id === "google_search_console" && isConfigured
                        ? "cursor-default"
                        : "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 hover:bg-card/80",
                      isConfigured && "border-green-500/30"
                    )}
                  >
                    <CardContent className="p-6 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex shrink-0 items-center justify-center rounded-lg w-8 h-8",
                            "group-hover:scale-110 transition-transform duration-300 ease-out"
                          )}>
                            <Icon className={cn("w-6 h-6", integration.iconColor)} />
                          </div>
                          <span className="font-semibold text-lg tracking-tight text-foreground/90">{integration.name}</span>
                        </div>
                        {isConfigured && (
                          <div onClick={(e) => handleDeleteIntegration(e, integration.id)} className="p-2 -mr-2 text-muted-foreground hover:text-red-500 transition-colors z-10 rounded-full hover:bg-red-500/10 cursor-pointer" title="Disconnect">
                            {deletingPlatform === integration.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isConfigured && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        <span className={cn(
                          "text-[15px] font-medium transition-colors",
                          isDisabled ? "text-muted-foreground/70" : (isConfigured ? "text-green-500" : "text-muted-foreground group-hover:text-foreground/80")
                        )}>
                          {isDisabled ? "Coming Soon" : status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-8 pt-2 outline-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground/95">
              Tracks Your Competitors
            </h2>
            <Button onClick={() => setIsAddCompetitorDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Competitor
            </Button>
          </div>

          {loadingCompetitors ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {competitors.length === 0 ? (
                <Card className="md:col-span-2 lg:col-span-3 bg-card/40 backdrop-blur-xl border-dashed border-border/60">
                  <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-muted/30 rounded-full mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No Competitors Added</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs">
                      Start tracking your competitors to get better insights for your content strategy.
                    </p>
                    <Button onClick={() => setIsAddCompetitorDialogOpen(true)} variant="outline" className="mt-6 gap-2">
                      <Plus className="w-4 h-4" />
                      Add Your First Competitor
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                competitors.map((competitor) => (
                  <Card key={competitor.id} className="bg-card/40 backdrop-blur-xl border-border/60 shadow-sm group hover:border-primary/40 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex shrink-0 items-center justify-center rounded-lg w-8 h-8 bg-primary/10 text-primary">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-lg tracking-tight text-foreground/90 truncate max-w-[150px]">
                            {competitor.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {competitor.url && (
                            <a 
                              href={competitor.url.startsWith('http') ? competitor.url : `https://${competitor.url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                              title="Visit Website"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={() => handleDeleteCompetitor(competitor.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-full"
                            title="Remove Competitor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {competitor.url && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                          <Globe className="w-3.5 h-3.5" />
                          <span className="truncate">{competitor.url}</span>
                        </div>
                      )}
                      
                      {competitor.notes && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-3 mt-auto pt-2 border-t border-border/40 italic">
                          "{competitor.notes}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Integration Dialog */}
      <Dialog open={isIntegrationsDialogOpen} onOpenChange={setIsIntegrationsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure {selectedConfig?.name}</DialogTitle>
            <DialogDescription>
              Enter your credentials to connect with {selectedConfig?.name}. These will be verified and stored securely.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedIntegration === "dev-to" && (
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={devToApiKey}
                  onChange={(e) => setDevToApiKey(e.target.value)}
                  placeholder="Your DEV API Key"
                />
              </div>
            )}
            {selectedIntegration === "ghost" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="url">Ghost Site URL</Label>
                  <Input
                    id="url"
                    value={ghostUrl}
                    onChange={(e) => setGhostUrl(e.target.value)}
                    placeholder="https://your-blog.ghost.io"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminApiKey">Admin API Key</Label>
                  <Input
                    id="adminApiKey"
                    type="password"
                    value={ghostAdminApiKey}
                    onChange={(e) => setGhostAdminApiKey(e.target.value)}
                    placeholder="Your Ghost Admin API Key"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contentApiKey">Content API Key</Label>
                  <Input
                    id="contentApiKey"
                    type="password"
                    value={ghostContentApiKey}
                    onChange={(e) => setGhostContentApiKey(e.target.value)}
                    placeholder="Your Ghost Content API Key"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="author">Author Name (optional)</Label>
                  <Input
                    id="author"
                    value={ghostAuthor}
                    onChange={(e) => setGhostAuthor(e.target.value)}
                    placeholder="Post author name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="publishStatus">Publish Status</Label>
                  <select
                    id="publishStatus"
                    value={ghostPublishStatus}
                    onChange={(e) => setGhostPublishStatus(e.target.value as "publish" | "draft")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="publish">Publish Immediately</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </>
            )}
            {selectedIntegration === "wordpress" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="wpUrl">WordPress Site URL</Label>
                  <Input
                    id="wpUrl"
                    value={wpUrl}
                    onChange={(e) => setWpUrl(e.target.value)}
                    placeholder="https://your-site.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wpIntegrationKey">Integration Key</Label>
                  <Input
                    id="wpIntegrationKey"
                    type="password"
                    value={wpIntegrationKey}
                    onChange={(e) => setWpIntegrationKey(e.target.value)}
                    placeholder="Integration Key from WordPress plugin"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Install the VisualRef Integration plugin in your WordPress admin to get the Integration Key.
                </p>
              </>
            )}
            {selectedIntegration === "webflow" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="webflowApiToken">API Token</Label>
                  <Input
                    id="webflowApiToken"
                    type="password"
                    value={webflowApiToken}
                    onChange={(e) => setWebflowApiToken(e.target.value)}
                    placeholder="Your Webflow API Token"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="webflowPublishStatus">Publish Status</Label>
                  <select
                    id="webflowPublishStatus"
                    value={webflowPublishStatus}
                    onChange={(e) => setWebflowPublishStatus(e.target.value as "publish" | "draft")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="publish">Publish Immediately</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </>
            )}
            {selectedIntegration === "shopify" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="shopifyStoreName">Store Name (Domain)</Label>
                  <Input
                    id="shopifyStoreName"
                    value={shopifyStoreName}
                    onChange={(e) => setShopifyStoreName(e.target.value)}
                    placeholder="e.g., your-store.myshopify.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shopifyClientId">Client ID</Label>
                  <Input
                    id="shopifyClientId"
                    type="password"
                    value={shopifyClientId}
                    onChange={(e) => setShopifyClientId(e.target.value)}
                    placeholder="Your Shopify Client ID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shopifyClientSecret">Client Secret</Label>
                  <Input
                    id="shopifyClientSecret"
                    type="password"
                    value={shopifyClientSecret}
                    onChange={(e) => setShopifyClientSecret(e.target.value)}
                    placeholder="Your Shopify Client Secret"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shopifyBlogId">Blog ID</Label>
                  <Input
                    id="shopifyBlogId"
                    value={shopifyBlogId}
                    onChange={(e) => setShopifyBlogId(e.target.value)}
                    placeholder="Your Shopify Blog ID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shopifyAuthor">Author Name (optional)</Label>
                  <Input
                    id="shopifyAuthor"
                    value={shopifyAuthor}
                    onChange={(e) => setShopifyAuthor(e.target.value)}
                    placeholder="Post author name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shopifyPublishStatus">Publish Status</Label>
                  <select
                    id="shopifyPublishStatus"
                    value={shopifyPublishStatus}
                    onChange={(e) => setShopifyPublishStatus(e.target.value as "publish" | "draft")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="publish">Publish Immediately</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </>
            )}
            {selectedIntegration === "wix" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="wixSiteId">Site ID</Label>
                  <Input
                    id="wixSiteId"
                    value={wixSiteId}
                    onChange={(e) => setWixSiteId(e.target.value)}
                    placeholder="Your Wix Site ID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wixApiKey">API Key</Label>
                  <Input
                    id="wixApiKey"
                    type="password"
                    value={wixApiKey}
                    onChange={(e) => setWixApiKey(e.target.value)}
                    placeholder="Your Wix API Key"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wixPublishStatus">Publish Status</Label>
                  <select
                    id="wixPublishStatus"
                    value={wixPublishStatus}
                    onChange={(e) => setWixPublishStatus(e.target.value as "publish" | "draft")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="publish">Publish Immediately</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIntegrationsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveIntegration} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Competitor Dialog */}
      <Dialog open={isAddCompetitorDialogOpen} onOpenChange={setIsAddCompetitorDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Competitor</DialogTitle>
            <DialogDescription>
              Enter the details of the competitor you want to track.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="comp-name">Name</Label>
              <Input
                id="comp-name"
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                placeholder="Competitor Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comp-url">Website URL (optional)</Label>
              <Input
                id="comp-url"
                value={newCompetitor.url}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, url: e.target.value })}
                placeholder="https://competitor.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comp-notes">Notes (optional)</Label>
              <Textarea
                id="comp-notes"
                value={newCompetitor.notes}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, notes: e.target.value })}
                placeholder="Briefly describe what they do or why you're tracking them..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCompetitorDialogOpen(false)} disabled={isSavingCompetitor}>
              Cancel
            </Button>
            <Button onClick={handleAddCompetitor} disabled={isSavingCompetitor}>
              {isSavingCompetitor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Competitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
