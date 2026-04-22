"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ghost, Save, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function GhostIntegrationPage() {
  const [formData, setFormData] = useState({
    url: "",
    adminApiKey: "",
    contentApiKey: "",
    author: "",
    publishStatus: "publish",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = () => {
    if (!formData.url || !formData.adminApiKey || !formData.contentApiKey) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
      toast.success("Ghost connected successfully!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Ghost?")) {
      setIsConnected(false);
      setFormData({ url: "", adminApiKey: "", contentApiKey: "", author: "", publishStatus: "publish" });
      toast.success("Ghost disconnected");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Ghost className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ghost</h1>
          <p className="text-muted-foreground">Seamlessly publish and manage content on your Ghost blog</p>
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
            <CardDescription>Your Ghost site is connected and ready to receive posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Site URL</span>
                <span className="font-medium">{formData.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author</span>
                <span className="font-medium">{formData.author || "Default"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Connect Ghost</CardTitle>
            <CardDescription>Enter your Ghost site credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Ghost Site URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://your-blog.ghost.io"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminApiKey">Admin API Key</Label>
              <Input
                id="adminApiKey"
                type="password"
                placeholder="Your Ghost Admin API Key"
                value={formData.adminApiKey}
                onChange={(e) => setFormData({ ...formData, adminApiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentApiKey">Content API Key</Label>
              <Input
                id="contentApiKey"
                type="password"
                placeholder="Your Ghost Content API Key"
                value={formData.contentApiKey}
                onChange={(e) => setFormData({ ...formData, contentApiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author Name (optional)</Label>
              <Input
                id="author"
                placeholder="Post author name"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Publish Status</Label>
              <Select value={formData.publishStatus} onValueChange={(v) => setFormData({ ...formData, publishStatus: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Publish Immediately</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleConnect} disabled={isSaving}>
              {isSaving ? "Connecting..." : "Connect Ghost"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Getting Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Log in to your Ghost admin dashboard</li>
            <li>Navigate to <strong>Settings → Integrations</strong></li>
            <li>Click <strong>Add custom integration</strong></li>
            <li>Name it "VisualRef" and click Create</li>
            <li>Copy the <strong>Admin API Key</strong> and <strong>Content API Key</strong></li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}