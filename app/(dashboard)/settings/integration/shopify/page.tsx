"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Save, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ShopifyIntegrationPage() {
  const [formData, setFormData] = useState({
    storeName: "",
    clientId: "",
    clientSecret: "",
    blogId: "",
    author: "",
    publishStatus: "publish",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = () => {
    if (!formData.storeName || !formData.clientId || !formData.clientSecret || !formData.blogId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
      toast.success("Shopify connected successfully!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Shopify?")) {
      setIsConnected(false);
      setFormData({ storeName: "", clientId: "", clientSecret: "", blogId: "", author: "", publishStatus: "publish" });
      toast.success("Shopify disconnected");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#95BF47]/10 rounded-xl">
          <ShoppingCart className="h-8 w-8 text-[#95BF47]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Shopify</h1>
          <p className="text-muted-foreground">Publish blog posts to your Shopify store's blog</p>
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
            <CardDescription>Your Shopify store is connected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Store</span>
                <span className="font-medium">{formData.storeName}.myshopify.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blog ID</span>
                <span className="font-medium">{formData.blogId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Connect Shopify</CardTitle>
            <CardDescription>Enter your Shopify store credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name (Domain)</Label>
              <Input
                id="storeName"
                placeholder="e.g., your-store"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Your store domain (without .myshopify.com)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="password"
                placeholder="Your Shopify Client ID"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Your Shopify Client Secret"
                value={formData.clientSecret}
                onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blogId">Blog ID</Label>
              <Input
                id="blogId"
                placeholder="Your Shopify Blog ID"
                value={formData.blogId}
                onChange={(e) => setFormData({ ...formData, blogId: e.target.value })}
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
              {isSaving ? "Connecting..." : "Connect Shopify"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}