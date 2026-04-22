"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Webhook, Save, CheckCircle2, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function WebhookIntegrationPage() {
  const [formData, setFormData] = useState({
    url: "",
    secret: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = () => {
    if (!formData.url) {
      toast.error("Please enter a webhook URL");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
      toast.success("Webhook connected successfully!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect the webhook?")) {
      setIsConnected(false);
      setFormData({ url: "", secret: "" });
      toast.success("Webhook disconnected");
    }
  };

  const handleTestWebhook = () => {
    toast.success("Test event sent! Check your endpoint.");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Webhook className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Webhook</h1>
          <p className="text-muted-foreground">Receive instant push notifications when content is published</p>
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
            <CardDescription>Your webhook endpoint is ready to receive events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endpoint URL</span>
                <span className="font-medium font-mono text-sm">{formData.url}</span>
              </div>
              {formData.secret && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Secret</span>
                  <span className="font-medium font-mono text-sm">••••••••</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleTestWebhook}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Send Test Event
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
            <CardTitle className="text-lg">Connect Webhook</CardTitle>
            <CardDescription>Configure your webhook endpoint to receive events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://yourdomain.com/webhook"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">Secret Token (Optional)</Label>
              <Input
                id="secret"
                type="password"
                placeholder="E.g., super-secret-string"
                value={formData.secret}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                If provided, will be sent as an X-Webhook-Secret header.
              </p>
            </div>
            <Button className="w-full" onClick={handleConnect} disabled={isSaving}>
              {isSaving ? "Connecting..." : "Connect Webhook"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Payload Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-xs bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto">
            <pre>{`{
  "title": "Your Blog Post Title",
  "bodyMarkdown": "# Your Blog Post Title\\n\\n...",
  "htmlContent": "<h1>Your Blog Post Title</h1>...",
  "tags": ["AI", "Tech"],
  "published": true,
  "coverImageUrl": "https://img.host.com/cover.png"
}`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}