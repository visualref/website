"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Power,
  Trash2,
  Settings,
  Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Plugin {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  version: string;
}

const initialPlugins: Plugin[] = [
  { id: "1", name: "SEO Suite", description: "Complete SEO optimization for your blog", status: "active", version: "2.1.0" },
  { id: "2", name: "Social Sharing", description: "Add social share buttons to posts", status: "active", version: "1.5.2" },
  { id: "3", name: "Security Scanner", description: "Monitor and protect against threats", status: "active", version: "3.0.1" },
  { id: "4", name: "Contact Form", description: "Create and manage contact forms", status: "inactive", version: "1.2.0" },
  { id: "5", name: "Analytics Pro", description: "Advanced analytics and insights", status: "inactive", version: "2.0.0" },
  { id: "6", name: "Backup Manager", description: "Automated backups and restore", status: "active", version: "1.8.5" },
];

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlugins = plugins.filter((plugin) =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      )
    );
    const plugin = plugins.find((p) => p.id === id);
    toast.success(
      `${plugin?.name} ${plugin?.status === "active" ? "deactivated" : "activated"}`
    );
  };

  const deletePlugin = (id: string) => {
    if (confirm("Are you sure you want to delete this plugin?")) {
      setPlugins((prev) => prev.filter((p) => p.id !== id));
      toast.success("Plugin deleted");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Plugins</h1>
          <p className="text-muted-foreground mt-1">Extend your blog with plugins</p>
        </div>
        <Button>Add New Plugin</Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => (
          <Card key={plugin.id} className="bg-card/40 backdrop-blur-xl border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${plugin.status === "active" ? "bg-green-500/10" : "bg-muted"}`}>
                    {plugin.name.includes("Security") ? (
                      <Shield className={`h-5 w-5 ${plugin.status === "active" ? "text-green-500" : "text-muted-foreground"}`} />
                    ) : (
                      <Settings className={`h-5 w-5 ${plugin.status === "active" ? "text-green-500" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{plugin.name}</CardTitle>
                    <CardDescription className="text-xs">v{plugin.version}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => togglePlugin(plugin.id)}>
                      <Power className="h-4 w-4 mr-2" />
                      {plugin.status === "active" ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{plugin.description}</p>
              <div className="flex items-center justify-between">
                <Badge className={plugin.status === "active" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}>
                  {plugin.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePlugin(plugin.id)}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {plugin.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg">No plugins found</h3>
        </div>
      )}
    </div>
  );
}