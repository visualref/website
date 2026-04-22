"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Save, Copy, Check, CheckCircle2, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function CustomAPIPage() {
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const generateToken = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Simulate token generation
      const token = `vr_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiToken(token);
      setIsConnected(true);
      setIsGenerating(false);
      toast.success("API token generated successfully!");
    }, 1500);
  };

  const copyToken = () => {
    if (apiToken) {
      navigator.clipboard.writeText(apiToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect the API? This will revoke your current token.")) {
      setApiToken(null);
      setIsConnected(false);
      toast.success("API disconnected");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-zinc-500/10 rounded-xl">
          <Terminal className="h-8 w-8 text-zinc-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Custom API</h1>
          <p className="text-muted-foreground">Fetch your content programmatically via our REST API</p>
        </div>
      </div>

      {isConnected && apiToken ? (
        <Card className="bg-card/40 backdrop-blur-xl border-green-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Connected</CardTitle>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                <Trash2 className="h-4 w-4 mr-2" />
                Revoke Token
              </Button>
            </div>
            <CardDescription>Use this token to authenticate API requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your API Token</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={apiToken}
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={copyToken}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <p className="font-medium text-sm">Example Request:</p>
              <div className="font-mono text-xs bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto">
                <pre>{`curl -X GET "https://api.visualref.com/api/v1/content" \\
  -H "Authorization: Bearer ${apiToken}"`}</pre>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyToken}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Token
              </Button>
              <Button className="flex-1" onClick={() => toast.success("Token refreshed")}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Token
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Generate API Token</CardTitle>
            <CardDescription>Create an API token to access your content programmatically</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Generate an API token to programmatically fetch your content items from VisualRef using our public REST API.
              </p>
            </div>
            <div className="space-y-2">
              <Label>API Token</Label>
              <div className="p-4 rounded-lg border border-dashed border-border text-center">
                <Terminal className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No token generated yet</p>
              </div>
            </div>
            <Button className="w-full" onClick={generateToken} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate New Token"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">API Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Endpoints</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-500">GET</Badge>
                <code className="text-muted-foreground">/api/v1/content</code>
                <span className="text-muted-foreground">- List all content</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-500">GET</Badge>
                <code className="text-muted-foreground">/api/v1/content/:id</code>
                <span className="text-muted-foreground">- Get single content</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}