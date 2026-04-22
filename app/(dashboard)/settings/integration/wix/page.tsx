"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Save, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function WixIntegrationPage() {
  const [formData, setFormData] = useState({
    siteId: "",
    apiKey: "",
    publishStatus: "publish",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = () => {
    if (!formData.siteId || !formData.apiKey) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
      toast.success("Wix connected successfully!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Wix?")) {
      setIsConnected(false);
      setFormData({ siteId: "", apiKey: "", publishStatus: "publish" });
      toast.success("Wix disconnected");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-500/10 rounded-xl">
          <Monitor className="h-8 w-8 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Wix</h1>
          <p className="text-muted-foreground">Automatically publish and update your Wix blog</p>
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
            <CardDescription>Your Wix site is connected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Site ID</span>
                <span className="font-medium">{formData.siteId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Connect Wix</CardTitle>
            <CardDescription>Enter your Wix API credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteId">Site ID</Label>
              <Input
                id="siteId"
                placeholder="Your Wix Site ID"
                value={formData.siteId}
                onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your Wix API Key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
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
              {isSaving ? "Connecting..." : "Connect Wix"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Getting Your API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Go to the <strong>Wix Developers Center</strong></li>
            <li>Create a new app or select an existing one</li>
            <li>Navigate to <strong>Extensions → API Key Management</strong></li>
            <li>Generate a new API key with blog write permissions</li>
            <li>Copy your Site ID from your Wix dashboard URL</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}