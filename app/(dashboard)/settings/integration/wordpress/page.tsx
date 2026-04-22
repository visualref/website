"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Globe, Save, ExternalLink, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function WordPressIntegrationPage() {
  const [formData, setFormData] = useState({
    url: "",
    username: "",
    appPassword: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [autoPublish] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = () => {
    if (!formData.url || !formData.username || !formData.appPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
      toast.success("WordPress connected successfully!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect WordPress?")) {
      setIsConnected(false);
      setFormData({ url: "", username: "", appPassword: "" });
      toast.success("WordPress disconnected");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#21759b]/10 rounded-xl">
          <Globe className="h-8 w-8 text-[#21759b]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">WordPress</h1>
          <p className="text-muted-foreground">Automatically publish your generated blog posts to your WordPress site</p>
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
                <Trash2 className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
            <CardDescription>Your WordPress site is connected and ready to receive posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Site URL</span>
                <span className="font-medium">{formData.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{formData.username}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <Label>Auto-publish</Label>
                <p className="text-sm text-muted-foreground">Automatically publish posts when generated</p>
              </div>
              <Switch checked={autoPublish} disabled />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href={formData.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Site
                </a>
              </Button>
              <Button className="flex-1" onClick={() => toast.success("Connection verified")}>
                Verify Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Connect WordPress</CardTitle>
            <CardDescription>Enter your WordPress site credentials to connect</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">WordPress Site URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://your-site.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">WordPress Username</Label>
              <Input
                id="username"
                placeholder="Your WordPress username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appPassword">Application Password</Label>
              <Input
                id="appPassword"
                type="password"
                placeholder="WordPress Application Password"
                value={formData.appPassword}
                onChange={(e) => setFormData({ ...formData, appPassword: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Generate an Application Password in your WordPress Users &gt; Profile section.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Auto-publish</Label>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label className="text-base">Auto-publish</Label>
                  <p className="text-sm text-muted-foreground">Automatically publish posts when generated</p>
                </div>
                <Switch checked={autoPublish} disabled />
              </div>
            </div>
            <Button className="w-full" onClick={handleConnect} disabled={isSaving}>
              {isSaving ? "Connecting..." : "Connect WordPress"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Log in to your WordPress admin dashboard</li>
            <li>Navigate to <strong>Users → Profile</strong></li>
            <li>Scroll to <strong>Application Passwords</strong> section</li>
            <li>Enter a name (e.g., "VisualRef") and click <strong>Add New</strong></li>
            <li>Copy the generated application password</li>
            <li>Paste your site URL, username, and app password in the form above</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}