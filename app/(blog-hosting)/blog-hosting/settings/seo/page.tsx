"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Search, Save, FileText, Share2, Globe } from "lucide-react";

export default function SEOSettingsPage() {
  const [settings, setSettings] = useState({
    metaTitle: "My Blog",
    metaDescription: "A great place to read and learn about topics that matter.",
    defaultOgImage: "",
    enableSitemap: true,
    enableRobotsTxt: true,
    autoGenerateMeta: true,
    socialShareImage: "",
  });

  const handleSave = () => {
    toast.success("SEO settings saved successfully");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">SEO Settings</h1>
        <p className="text-muted-foreground mt-1">Optimize your blog for search engines</p>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Meta Tags</CardTitle>
              <CardDescription>Default meta information for your blog</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={settings.metaTitle}
              onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
              placeholder="Your blog title for search results"
            />
            <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={settings.metaDescription}
              onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
              placeholder="Brief description for search results"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultOgImage">Default OG Image</Label>
            <Input
              id="defaultOgImage"
              value={settings.defaultOgImage}
              onChange={(e) => setSettings({ ...settings, defaultOgImage: e.target.value })}
              placeholder="https://yourblog.com/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground">Used when posts don't have their own image</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-generate Meta Tags</Label>
              <p className="text-xs text-muted-foreground">Automatically generate meta tags from post content</p>
            </div>
            <Switch
              checked={settings.autoGenerateMeta}
              onCheckedChange={(checked) => setSettings({ ...settings, autoGenerateMeta: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Sitemap & Robots</CardTitle>
              <CardDescription>Help search engines discover your content</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable XML Sitemap</Label>
              <p className="text-xs text-muted-foreground">Auto-generate sitemap.xml for search engines</p>
            </div>
            <Switch
              checked={settings.enableSitemap}
              onCheckedChange={(checked) => setSettings({ ...settings, enableSitemap: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Robots.txt</Label>
              <p className="text-xs text-muted-foreground">Control what search engines can access</p>
            </div>
            <Switch
              checked={settings.enableRobotsTxt}
              onCheckedChange={(checked) => setSettings({ ...settings, enableRobotsTxt: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Social Sharing</CardTitle>
              <CardDescription>Control how your content appears on social media</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="socialShareImage">Social Share Image</Label>
            <Input
              id="socialShareImage"
              value={settings.socialShareImage}
              onChange={(e) => setSettings({ ...settings, socialShareImage: e.target.value })}
              placeholder="https://yourblog.com/share-image.jpg"
            />
            <p className="text-xs text-muted-foreground">Recommended size: 1200x630 pixels</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}