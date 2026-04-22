"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Save, Key, Smartphone, Clock, AlertTriangle } from "lucide-react";

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

const initialSessions: Session[] = [
  { id: "1", device: "Chrome on MacOS", location: "New York, US", lastActive: "Active now", current: true },
  { id: "2", device: "Safari on iPhone", location: "New York, US", lastActive: "2 hours ago", current: false },
  { id: "3", device: "Firefox on Windows", location: "Los Angeles, US", lastActive: "Yesterday", current: false },
];

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    loginNotifications: true,
    maxLoginAttempts: 5,
  });
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  const handlePasswordChange = () => {
    if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (settings.newPassword !== settings.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (settings.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    toast.success("Password changed successfully");
    setSettings({ ...settings, currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleRevokeSession = (id: string) => {
    if (confirm("Are you sure you want to end this session?")) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Session revoked");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Security Settings</h1>
        <p className="text-muted-foreground mt-1">Protect your blog and account</p>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={settings.currentPassword}
              onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={settings.newPassword}
              onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={settings.confirmPassword}
              onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
            />
          </div>
          <Button variant="outline" onClick={handlePasswordChange}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable 2FA</Label>
              <p className="text-xs text-muted-foreground">Require a code from your phone when logging in</p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, twoFactorEnabled: checked });
                toast.success(checked ? "2FA enabled" : "2FA disabled");
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Active Sessions</CardTitle>
              <CardDescription>Manage devices where you're logged in</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{session.device}</p>
                    {session.current && <Badge className="bg-green-500/10 text-green-500">Current</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)}>
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Login Security</CardTitle>
              <CardDescription>Protect against unauthorized access</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Login Notifications</Label>
              <p className="text-xs text-muted-foreground">Get notified of new login attempts</p>
            </div>
            <Switch
              checked={settings.loginNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, loginNotifications: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Login Attempts</Label>
            <select
              value={settings.maxLoginAttempts}
              onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value={3}>3 attempts</option>
              <option value={5}>5 attempts</option>
              <option value={10}>10 attempts</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}