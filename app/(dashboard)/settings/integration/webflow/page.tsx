"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutTemplate, Save, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function WebflowIntegrationPage() {
  const [formData, setFormData] = useState({
    apiToken: "",
    publishStatus: "publish",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = () => {
    if (!formData.apiToken) {
      toast.error("Please enter your Webflow API token");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
      toast.success("Webflow connected successfully!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Webflow?")) {
      setIsConnected(false);
      setFormData({ apiToken: "", publishStatus: "publish" });
      toast.success("Webflow disconnected");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <LayoutTemplate className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Webflow</h1>
          <p className="text-muted-foreground">Push content directly to your Webflow CMS collections</p>
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
            <CardDescription>Your Webflow account is connected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Token</span>
                <span className="font-medium font-mono text-sm">••••••••{formData.apiToken.slice(-4)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Connect Webflow</CardTitle>
            <CardDescription>Enter your Webflow API credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Your Webflow API Token"
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
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
              {isSaving ? "Connecting..." : "Connect Webflow"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Getting Your API Token</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Log in to your Webflow account</li>
            <li>Navigate to <strong>Settings → Integrations → API Access</strong></li>
            <li>Click <strong>Generate API Token</strong></li>
            <li>Copy the generated token</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}