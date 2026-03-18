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
import { toast } from "sonner";
import type { Competitor } from "@/types";

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
  const [wpUrl, setWpUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpAppPassword, setWpAppPassword] = useState("");
  const [webflowApiKey, setWebflowApiKey] = useState("");
  const [webflowCollectionId, setWebflowCollectionId] = useState("");
  const [shopifyShopName, setShopifyShopName] = useState("");
  const [shopifyAccessToken, setShopifyAccessToken] = useState("");
  const [shopifyBlogId, setShopifyBlogId] = useState("");
  const [wixSiteId, setWixSiteId] = useState("");
  const [wixApiKey, setWixApiKey] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to initiate connection to Google Search Console");
      setIsConnecting(false);
    }
  };

  const handleOpenIntegrationsDialog = (id: string) => {
    setSelectedIntegration(id);
    // Reset fields
    setDevToApiKey("");
    setGhostUrl("");
    setGhostAdminApiKey("");
    setWpUrl("");
    setWpUsername("");
    setWpAppPassword("");
    setWebflowApiKey("");
    setWebflowCollectionId("");
    setShopifyShopName("");
    setShopifyAccessToken("");
    setShopifyBlogId("");
    setWixSiteId("");
    setWixApiKey("");
    setIsIntegrationsDialogOpen(true);
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;

    let credentials: any = {};
    if (selectedIntegration === "dev-to") {
      if (!devToApiKey) return toast.error("API Key is required");
      credentials = { apiKey: devToApiKey };
    } else if (selectedIntegration === "ghost") {
      if (!ghostUrl || !ghostAdminApiKey) return toast.error("URL and Admin API Key are required");
      credentials = { url: ghostUrl, adminApiKey: ghostAdminApiKey };
    } else if (selectedIntegration === "wordpress") {
      if (!wpUrl || !wpUsername || !wpAppPassword) return toast.error("All fields are required");
      credentials = { url: wpUrl, username: wpUsername, appPassword: wpAppPassword };
    } else if (selectedIntegration === "webflow") {
      if (!webflowApiKey || !webflowCollectionId) return toast.error("All fields are required");
      credentials = { apiKey: webflowApiKey, collectionId: webflowCollectionId };
    } else if (selectedIntegration === "shopify") {
      if (!shopifyShopName || !shopifyAccessToken || !shopifyBlogId) return toast.error("All fields are required");
      credentials = { shopName: shopifyShopName, accessToken: shopifyAccessToken, blogId: shopifyBlogId };
    } else if (selectedIntegration === "wix") {
      if (!wixSiteId || !wixApiKey) return toast.error("All fields are required");
      credentials = { siteId: wixSiteId, apiKey: wixApiKey };
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
      toast.error(error.response?.data?.error || "Failed to verify and save integration credentials.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIntegration = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      if (!confirm("Are you sure you want to disconnect this integration?")) return;
      setIsDeleting(true);
      const platform = id === "dev-to" ? "dev.to" : id;
      await integrationsApi.delete(platform);
      toast.success("Integration removed successfully");
      fetchIntegrations();
    } catch (error) {
      toast.error("Failed to remove integration");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitor.name) return toast.error("Competitor name is required");
    
    setIsSavingCompetitor(true);
    try {
      await competitorsApi.create(newCompetitor);
      toast.success("Competitor added successfully!");
      setIsAddCompetitorDialogOpen(false);
      setNewCompetitor({ name: "", url: "", notes: "" });
      fetchCompetitors();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add competitor.");
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
    } catch (error) {
      toast.error("Failed to remove competitor");
    }
  };

  const getIntegrationStatus = (id: string) => {
    const platform = id === "dev-to" ? "dev.to" : id;
    const isConfigured = activeIntegrations.some(i => i.platform === platform);
    return isConfigured ? "Configured" : "Configure now";
  };

  const selectedConfig = INTEGRATIONS_DEFS.find(i => i.id === selectedIntegration);

  const userInitials = user?.name
    ?.split(" ")
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
                      if (integration.id === "google_search_console") {
                        if (!isConfigured) handleConnectGoogle();
                      } else if (!isDisabled) {
                        handleOpenIntegrationsDialog(integration.id);
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300",
                      "bg-card/40 backdrop-blur-xl border-border/60 shadow-sm",
                      isDisabled || (integration.id === "google_search_console" && isConfigured)
                        ? "opacity-60 cursor-not-allowed" 
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
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
                  <Label htmlFor="wpUsername">Username</Label>
                  <Input
                    id="wpUsername"
                    value={wpUsername}
                    onChange={(e) => setWpUsername(e.target.value)}
                    placeholder="Admin Username or Email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wpAppPassword">Application Password</Label>
                  <Input
                    id="wpAppPassword"
                    type="password"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    placeholder="Your Application Password"
                  />
                </div>
              </>
            )}
            {selectedIntegration === "webflow" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="webflowApiKey">API Key</Label>
                  <Input
                    id="webflowApiKey"
                    type="password"
                    value={webflowApiKey}
                    onChange={(e) => setWebflowApiKey(e.target.value)}
                    placeholder="Your Webflow API Key"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="webflowCollectionId">Collection ID</Label>
                  <Input
                    id="webflowCollectionId"
                    value={webflowCollectionId}
                    onChange={(e) => setWebflowCollectionId(e.target.value)}
                    placeholder="E.g., 5f7b...1234"
                  />
                </div>
              </>
            )}
            {selectedIntegration === "shopify" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="shopifyShopName">Shop Name (Domain)</Label>
                  <Input
                    id="shopifyShopName"
                    value={shopifyShopName}
                    onChange={(e) => setShopifyShopName(e.target.value)}
                    placeholder="e.g., your-store.myshopify.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shopifyAccessToken">Admin API Access Token</Label>
                  <Input
                    id="shopifyAccessToken"
                    type="password"
                    value={shopifyAccessToken}
                    onChange={(e) => setShopifyAccessToken(e.target.value)}
                    placeholder="shpat_..."
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
