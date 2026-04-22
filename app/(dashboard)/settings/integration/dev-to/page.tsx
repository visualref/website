"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Save, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DevToIntegrationPage() {
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = () => {
    if (!apiKey) {
      toast.error("Please enter your Dev.to API key");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
      toast.success("Dev.to connected successfully!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Dev.to?")) {
      setIsConnected(false);
      setApiKey("");
      toast.success("Dev.to disconnected");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-zinc-500/10 rounded-xl">
          <Terminal className="h-8 w-8 text-zinc-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dev.to</h1>
          <p className="text-muted-foreground">Publish articles directly to your Dev.to profile</p>
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
            <CardDescription>Your Dev.to account is connected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Key</span>
                <span className="font-medium font-mono text-sm">••••••••{apiKey.slice(-4)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Connect Dev.to</CardTitle>
            <CardDescription>Enter your Dev.to API key to connect</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your DEV API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleConnect} disabled={isSaving}>
              {isSaving ? "Connecting..." : "Connect Dev.to"}
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
            <li>Log in to your Dev.to account</li>
            <li>Go to <strong>Settings → Account</strong></li>
            <li>Scroll down to <strong>DEV API Keys</strong></li>
            <li>Click <strong>Create a new key</strong></li>
            <li>Enter a description (e.g., "VisualRef") and click Generate</li>
            <li>Copy the generated API key</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}