"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { BarChart3, Save, ExternalLink, TrendingUp, Eye, Users } from "lucide-react";

export default function AnalyticsSettingsPage() {
  const [settings, setSettings] = useState({
    googleAnalyticsId: "",
    enableAnalytics: true,
    trackPageViews: true,
    trackScrollDepth: true,
    trackOutboundLinks: true,
    anonymizeIp: true,
  });

  const handleSave = () => {
    toast.success("Analytics settings saved");
  };

  const testConnection = () => {
    if (!settings.googleAnalyticsId) {
      toast.error("Please enter a Google Analytics ID first");
      return;
    }
    toast.success("Analytics connected successfully");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics Settings</h1>
        <p className="text-muted-foreground mt-1">Track and analyze your blog traffic</p>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Analytics</CardTitle>
              <CardDescription>Connect Google Analytics to track your traffic</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gaId">Google Analytics Measurement ID</Label>
            <div className="flex gap-2">
              <Input
                id="gaId"
                value={settings.googleAnalyticsId}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="font-mono"
              />
              <Button variant="outline" onClick={testConnection}>
                Connect
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find your Measurement ID in your Google Analytics dashboard under Admin → Data Streams
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Analytics</Label>
              <p className="text-xs text-muted-foreground">Enable or disable all analytics tracking</p>
            </div>
            <Switch
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) => setSettings({ ...settings, enableAnalytics: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Tracking Options</CardTitle>
              <CardDescription>Configure what events to track</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Track Page Views</Label>
              <p className="text-xs text-muted-foreground">Track when users view pages</p>
            </div>
            <Switch
              checked={settings.trackPageViews}
              onCheckedChange={(checked) => setSettings({ ...settings, trackPageViews: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Track Scroll Depth</Label>
              <p className="text-xs text-muted-foreground">Track how far users scroll on pages</p>
            </div>
            <Switch
              checked={settings.trackScrollDepth}
              onCheckedChange={(checked) => setSettings({ ...settings, trackScrollDepth: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Track Outbound Links</Label>
              <p className="text-xs text-muted-foreground">Track clicks on external links</p>
            </div>
            <Switch
              checked={settings.trackOutboundLinks}
              onCheckedChange={(checked) => setSettings({ ...settings, trackOutboundLinks: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Anonymize IP Addresses</Label>
              <p className="text-xs text-muted-foreground">Comply with privacy regulations</p>
            </div>
            <Switch
              checked={settings.anonymizeIp}
              onCheckedChange={(checked) => setSettings({ ...settings, anonymizeIp: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              <CardDescription>View your traffic analytics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Users className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-xs text-muted-foreground">Visitors</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Eye className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">4,567</p>
              <p className="text-xs text-muted-foreground">Page Views</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">3.7</p>
              <p className="text-xs text-muted-foreground">Avg. Time (min)</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Analytics
            </a>
          </Button>
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