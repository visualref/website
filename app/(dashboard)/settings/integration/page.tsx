"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Terminal,
  Webhook,
  Ghost,
  LayoutTemplate,
  ShoppingCart,
  Monitor,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ConnectedAccount {
  id: string;
  platform: string;
  status: "connected" | "disconnected";
  lastSync?: string;
}

const connectedAccounts: ConnectedAccount[] = [
  { id: "1", platform: "WordPress", status: "connected", lastSync: "2 hours ago" },
  { id: "2", platform: "Google Search Console", status: "connected", lastSync: "1 day ago" },
];

const allIntegrations = [
  { id: "wordpress", name: "WordPress", icon: Globe, description: "Automatically publish your generated blog posts to your WordPress site." },
  { id: "api", name: "Custom API", icon: Terminal, description: "Fetch your content programmatically via our REST API." },
  { id: "webhook", name: "Webhook", icon: Webhook, description: "Receive instant push notifications when content is published." },
  { id: "dev-to", name: "Dev.to", icon: Terminal, description: "Publish articles directly to your Dev.to profile." },
  { id: "ghost", name: "Ghost", icon: Ghost, description: "Seamlessly publish and manage content on your Ghost blog." },
  { id: "google-search-console", name: "Google Search Console", icon: Globe, description: "Monitor and optimize your blog's search appearance." },
  { id: "webflow", name: "Webflow", icon: LayoutTemplate, description: "Push content directly to your Webflow CMS collections." },
  { id: "shopify", name: "Shopify", icon: ShoppingCart, description: "Publish blog posts to your Shopify store's blog." },
  { id: "wix", name: "Wix", icon: Monitor, description: "Automatically publish and update your Wix blog." },
  { id: "blog-hosting", name: "Blog Hosting", icon: Globe, description: "Host your blog on a custom subdomain with full brand control." },
];

export default function IntegrationAccountsPage() {
  const [accounts] = useState<ConnectedAccount[]>(connectedAccounts);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Connected Accounts</h1>
        <p className="text-muted-foreground mt-1">Manage your connected integrations and accounts</p>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Active Integrations</CardTitle>
            <CardDescription>Currently connected platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => {
              const integration = allIntegrations.find(i => i.name === account.platform);
              const Icon = integration?.icon || Globe;
              return (
                <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{account.platform}</p>
                        <Badge className="bg-green-500/10 text-green-500 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Last synced: {account.lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/settings/integration/${integration?.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All Integrations */}
      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">All Integrations</CardTitle>
          <CardDescription>Connect your favorite platforms</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allIntegrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = accounts.some(a => a.platform === integration.name);
            return (
              <div
                key={integration.id}
                className="p-4 rounded-lg border border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{integration.name}</p>
                      {isConnected && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {integration.description}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto font-medium" asChild>
                      <Link href={`/settings/integration/${integration.id}`}>
                        {isConnected ? "Manage" : "Connect"}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}