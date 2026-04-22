"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Palette, Type, Layout, Sliders, Save } from "lucide-react";

export default function AppearancePage() {
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    fontFamily: "Inter",
    layout: "sidebar",
  });

  const handleSave = () => {
    toast.success("Appearance settings saved");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Appearance</h1>
        <p className="text-muted-foreground mt-1">Customize your blog's look and feel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Colors</CardTitle>
                <CardDescription>Choose your brand colors</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={themeSettings.primaryColor}
                  onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded border border-input cursor-pointer"
                />
                <Input
                  value={themeSettings.primaryColor}
                  onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={themeSettings.secondaryColor}
                  onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                  className="w-12 h-10 rounded border border-input cursor-pointer"
                />
                <Input
                  value={themeSettings.secondaryColor}
                  onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Type className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Typography</CardTitle>
                <CardDescription>Choose your font preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <select
                value={themeSettings.fontFamily}
                onChange={(e) => setThemeSettings({ ...themeSettings, fontFamily: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layout className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Layout</CardTitle>
                <CardDescription>Choose your blog layout</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {["sidebar", "full-width", "magazine"].map((layout) => (
                <button
                  key={layout}
                  onClick={() => setThemeSettings({ ...themeSettings, layout })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    themeSettings.layout === layout
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Layout className="h-6 w-6" />
                    <span className="text-sm capitalize">{layout.replace("-", " ")}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sliders className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Custom CSS</CardTitle>
                <CardDescription>Add custom styles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
              placeholder="/* Add your custom CSS here */"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}