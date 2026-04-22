"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wrench, Save, Download, Upload, RefreshCw, Database } from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tools</h1>
        <p className="text-muted-foreground mt-1">Import, export, backup, and maintenance tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Import Content</CardTitle>
                <CardDescription>Import from WordPress or other sources</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/blog-hosting/settings/tools">
                <Upload className="h-4 w-4" />
                Import Tools
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Export Content</CardTitle>
                <CardDescription>Download all your blog data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/blog-hosting/settings/tools">
                <Download className="h-4 w-4" />
                Export Tools
              </Link>
            </Button>
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
          <CardContent>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/blog-hosting/settings/tools">
                <Database className="h-4 w-4" />
                Backup Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Maintenance</CardTitle>
                <CardDescription>Manage site availability</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/blog-hosting/settings/tools">
                <RefreshCw className="h-4 w-4" />
                Maintenance Mode
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}