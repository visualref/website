"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wrench, Save, Download, Upload, Trash2, AlertTriangle, RefreshCw, Database } from "lucide-react";

export default function ToolsSettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: "We'll be back soon!",
    enableAutoBackup: true,
    backupFrequency: "daily",
    keepBackups: 7,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleSave = () => {
    toast.success("Tools settings saved");
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Content exported successfully");
    }, 2000);
  };

  const handleImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      toast.success("Content imported successfully");
    }, 2000);
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      toast.success("Backup created successfully");
    }, 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tools</h1>
        <p className="text-muted-foreground mt-1">Import, export, backup, and maintenance</p>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Maintenance Mode</CardTitle>
              <CardDescription>Temporarily take your blog offline</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground">Show visitors a temporary message</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
          {settings.maintenanceMode && (
            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
              <Input
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Import Content</CardTitle>
              <CardDescription>Import posts and pages from another source</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your import file here, or click to browse
              </p>
              <input type="file" id="import-file" className="hidden" accept=".xml,.json,.zip" />
              <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()}>
                Choose File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: XML (WordPress), JSON, ZIP
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Export Content</CardTitle>
              <CardDescription>Download all your blog content</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Content
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Exports include posts, pages, comments, categories, tags, and media references.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Backup</CardTitle>
              <CardDescription>Create and manage backups</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Backup</Label>
              <p className="text-xs text-muted-foreground">Automatically backup your content</p>
            </div>
            <Switch
              checked={settings.enableAutoBackup}
              onCheckedChange={(checked) => setSettings({ ...settings, enableAutoBackup: checked })}
            />
          </div>
          {settings.enableAutoBackup && (
            <>
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="hourly">Every hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Keep Backups</Label>
                <select
                  value={settings.keepBackups}
                  onChange={(e) => setSettings({ ...settings, keepBackups: parseInt(e.target.value) })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value={3}>Last 3 backups</option>
                  <option value={7}>Last 7 backups</option>
                  <option value={14}>Last 14 backups</option>
                  <option value={30}>Last 30 backups</option>
                </select>
              </div>
            </>
          )}
          <Button onClick={handleBackup} disabled={isBackingUp} className="w-full">
            {isBackingUp ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Create Backup Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-500/5">
            <div>
              <p className="font-medium text-sm">Delete All Content</p>
              <p className="text-xs text-muted-foreground">Permanently remove all posts, pages, and media</p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Everything
            </Button>
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