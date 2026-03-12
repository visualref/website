"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Webhook, Terminal, Ghost, Loader2, CheckCircle2, Trash2, LayoutTemplate, ShoppingCart, Monitor } from "lucide-react";
import { integrationsApi } from "@/lib/api-client";
import { toast } from "sonner";

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
  const [activeIntegrations, setActiveIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form states
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

  const handleOpenDialog = (id: string) => {
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
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
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
      // Platform strings from backend match id mostly, except frontend id dev-to, backend uses dev.to. Let's send dev.to
      const platform = selectedIntegration === "dev-to" ? "dev.to" : selectedIntegration;

      await integrationsApi.save({
        platform,
        credentials
      });
      toast.success(`${selectedIntegration} integration saved successfully!`);
      setIsDialogOpen(false);
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to verify and save integration credentials.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
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

  const getIntegrationStatus = (id: string) => {
    const platform = id === "dev-to" ? "dev.to" : id;
    const isConfigured = activeIntegrations.some(i => i.platform === platform);
    return isConfigured ? "Configured" : "Configure now";
  };

  const selectedConfig = INTEGRATIONS_DEFS.find(i => i.id === selectedIntegration);

  return (
    <div className="space-y-8 max-w-[1200px]">
      <Tabs defaultValue="integrations" className="space-y-10">
        <div className="border-b border-border/40">
          <TabsList variant="line" className="flex justify-start gap-8 h-auto p-0 pb-0">
            {["Account", "Organization", "SEO", "Integrations", "Competitors", "Referrals"].map((tab) => (
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
                // Only enable wp, ghost, dev-to for now
                const isDisabled = integration.id === "api";

                return (
                  <Card 
                    key={integration.id}
                    onClick={() => {
                      if (integration.id === "google_search_console") {
                        if (!isConfigured) handleConnectGoogle();
                      } else if (!isDisabled) {
                        handleOpenDialog(integration.id);
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
                          <div onClick={(e) => handleDelete(e, integration.id)} className="p-2 -mr-2 text-muted-foreground hover:text-red-500 transition-colors z-10 rounded-full hover:bg-red-500/10 cursor-pointer" title="Disconnect">
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
        
        {/* Empty states for other tabs */}
        {["account", "organization", "seo", "competitors", "referrals"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
             <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-2xl border-dashed bg-muted/20 backdrop-blur-sm">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <Webhook className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold capitalize">{tab} Settings</h3>
              <p className="text-muted-foreground mt-2">This section is currently under development.</p>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
