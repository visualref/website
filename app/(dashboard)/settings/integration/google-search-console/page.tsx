"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Save, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function GoogleSearchConsolePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast.success("Google Search Console connected successfully!");
    }, 2000);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Google Search Console?")) {
      setIsConnected(false);
      toast.success("Google Search Console disconnected");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-500/10 rounded-xl">
          <Globe className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Google Search Console</h1>
          <p className="text-muted-foreground">Monitor and optimize your blog's search appearance</p>
        </div>
      </div>

      {isConnected ? (
        <Card className="bg-card/40 backdrop-blur-xl border-green-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Connected</CardTitle>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
            <CardDescription>Your Google Search Console is connected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-muted-foreground">Clicks (30d)</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">5,678</p>
                <p className="text-sm text-muted-foreground">Impressions</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">21.8%</p>
                <p className="text-sm text-muted-foreground">CTR</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Search Console
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Connect Google Search Console</CardTitle>
            <CardDescription>Grant VisualRef access to your Search Console data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Connect your Google Search Console to monitor your blog's performance, fix indexing issues, and submit sitemaps automatically.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">What you can do:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">✓ Monitor clicks, impressions, and rankings</li>
                <li className="flex items-center gap-2">✓ Fix indexing issues</li>
                <li className="flex items-center gap-2">✓ Automatically submit sitemaps</li>
                <li className="flex items-center gap-2">✓ View search analytics</li>
              </ul>
            </div>
            <Button className="w-full" onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Google Search Console"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Permissions Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            VisualRef needs the following Google permissions:
          </p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Search Console Data:</strong> Read access to your site's performance metrics</li>
            <li>• <strong>Site Verification:</strong> Verify ownership of your blog domain</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}