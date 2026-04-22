"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Save, CheckCircle2, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function BlogHostingIntegrationPage() {
  const [formData, setFormData] = useState({
    subdomain: "",
    brandColor: "#6366f1",
    brandLogo: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);
  const [dnsVerified, setDnsVerified] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleVerifyDns = async () => {
    if (!formData.subdomain) {
      toast.error("Please enter a subdomain first");
      return;
    }
    setIsVerifyingDns(true);
    setTimeout(() => {
      setDnsVerified(true);
      setIsVerifyingDns(false);
      toast.success("DNS verified successfully!");
    }, 2000);
  };

  const handleConnect = () => {
    if (!formData.subdomain) {
      toast.error("Please enter a subdomain");
      return;
    }
    if (!dnsVerified) {
      toast.error("Please verify DNS first");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
      toast.success("Blog hosting connected successfully!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect blog hosting?")) {
      setIsConnected(false);
      setFormData({ subdomain: "", brandColor: "#6366f1", brandLogo: "" });
      setDnsVerified(false);
      toast.success("Blog hosting disconnected");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    setIsUploadingLogo(true);
    setTimeout(() => {
      setFormData({ ...formData, brandLogo: URL.createObjectURL(file) });
      setIsUploadingLogo(false);
      toast.success("Logo uploaded");
    }, 1500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Globe className="h-8 w-8 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Blog Hosting</h1>
          <p className="text-muted-foreground">Host your blog on a custom subdomain with full brand control</p>
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
            <CardDescription>Your blog is live at {formData.subdomain}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subdomain</span>
                <span className="font-medium">{formData.subdomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand Color</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: formData.brandColor }} />
                  <span className="font-medium">{formData.brandColor}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href={`https://${formData.subdomain}`} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                View Blog
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Configure Blog Hosting</CardTitle>
            <CardDescription>Set up your custom subdomain for blog hosting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Custom Subdomain</Label>
              <div className="flex gap-2">
                <Input
                  id="subdomain"
                  placeholder="blog.yoursite.com"
                  value={formData.subdomain}
                  onChange={(e) => {
                    setFormData({ ...formData, subdomain: e.target.value });
                    setDnsVerified(false);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleVerifyDns}
                  disabled={isVerifyingDns || !formData.subdomain}
                >
                  {isVerifyingDns ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : dnsVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create a CNAME record pointing to cname.visualref.com
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandColor">Brand Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="w-10 h-10 rounded border border-input cursor-pointer"
                />
                <Input
                  id="brandColor"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Brand Logo (optional)</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  {isUploadingLogo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload Logo
                </Button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {formData.brandLogo && (
                  <div className="relative group">
                    <img
                      src={formData.brandLogo}
                      alt="Brand logo preview"
                      className="h-10 w-auto rounded border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, brandLogo: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full" onClick={handleConnect} disabled={isSaving || !dnsVerified}>
              {isSaving ? "Connecting..." : "Connect Blog Hosting"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}