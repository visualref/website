"use client";

import { useState } from "react";
import { Bot, Search, ExternalLink, ArrowRight, Zap, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Empty state for Reddit Bot page - logic to be built by user

export default function RedditBotPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("opportunities");

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="bg-orange-500/20 text-orange-500 p-2 rounded-lg">
              <Bot className="h-6 w-6" />
            </span>
            Reddit Promotion Bot
          </h1>
          <p className="text-muted-foreground mt-2">
            Automatically discover relevant Reddit discussions to organically promote your content.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Bot Settings
          </Button>
          <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
            <Play className="h-4 w-4" />
            Run Scan Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities Found</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Bot inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replies Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Bot inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Traffic Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Bot inactive</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="opportunities">New Opportunities</TabsTrigger>
            <TabsTrigger value="replied">Replied Threads</TabsTrigger>
            <TabsTrigger value="keywords">Tracked Keywords</TabsTrigger>
          </TabsList>
          
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subreddits or titles..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="text-center py-12 border rounded-xl border-dashed">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No opportunities found</h3>
            <p className="text-muted-foreground mt-1">Connect your API and configure keywords to start tracking Reddit.</p>
          </div>
        </TabsContent>

        <TabsContent value="replied">
          <div className="text-center py-12 border rounded-xl border-dashed">
             <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h3 className="text-lg font-medium">Replied Threads</h3>
             <p className="text-muted-foreground mt-1">Threads where the bot has successfully posted a response will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="keywords">
           <div className="text-center py-12 border rounded-xl border-dashed">
             <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h3 className="text-lg font-medium">Tracked Keywords</h3>
             <p className="text-muted-foreground mt-1">Configure the keywords and subreddits the bot should monitor.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Missing icon imports added at bottom to keep JSX clean
import { Clock, Play, Settings } from "lucide-react";
