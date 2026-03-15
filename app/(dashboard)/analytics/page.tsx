"use client";

import { useQuery } from "@tanstack/react-query";
import { integrationsApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  Link as LinkIcon,
  Loader2,
  Globe,
  MousePointerClick,
  Eye,
  Percent,
  TrendingUp
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function AnalyticsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [dateRange, setDateRange] = useState("30"); // days

  // Check integrations
  const { data: integrationsData, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => integrationsApi.get(),
  });

  const isGoogleConnected = integrationsData?.integrations?.some((i: any) => i.platform === "google_search_console");

  // Fetch Google details (sites) if connected
  const { data: googleDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["google-details"],
    queryFn: () => integrationsApi.getGoogleDetails(),
    enabled: !!isGoogleConnected,
  });

  const sites = googleDetails?.details?.sites || [];
  
  // Auto-select first site
  useMemo(() => {
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0].siteUrl);
    }
  }, [sites, selectedSite]);

  const startDate = useMemo(() => {
    return format(subDays(new Date(), parseInt(dateRange)), "yyyy-MM-dd");
  }, [dateRange]);
  const endDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  // Fetch Analytics Data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["google-analytics", selectedSite, startDate, endDate],
    queryFn: () => integrationsApi.getGoogleAnalytics({ siteUrl: selectedSite, startDate, endDate }),
    enabled: !!selectedSite,
  });

  const timeSeries = analyticsData?.analytics?.timeSeries || [];
  const topPages = analyticsData?.analytics?.topPages || [];

  // Calculate totals unconditionally (Rule of Hooks)
  const totals = useMemo(() => {
    if (!timeSeries.length) return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    
    let totalClicks = 0;
    let totalImpressions = 0;
    let sumPositionWeight = 0;
    
    timeSeries.forEach((row: any) => {
      totalClicks += row.clicks || 0;
      totalImpressions += row.impressions || 0;
      sumPositionWeight += (row.position || 0) * (row.impressions || 0);
    });

    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition = totalImpressions > 0 ? sumPositionWeight / totalImpressions : 0;

    return {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: avgCtr.toFixed(2),
      position: avgPosition.toFixed(1)
    };
  }, [timeSeries]);


  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      const { url } = await integrationsApi.getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to initiate connection to Google Search Console");
      setIsConnecting(false);
    }
  };

  if (isLoadingIntegrations) {
    return <AnalyticsSkeleton />;
  }

  if (!isGoogleConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="p-6 bg-muted/30 border border-muted rounded-full mb-2">
          <Globe className="w-12 h-12 text-muted-foreground opacity-60" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Not Available</h2>
        <p className="text-muted-foreground max-w-md text-center mb-6">
          Connect your Google Search Console account to view performance insights and search analytics for your content.
        </p>
        <Button onClick={handleConnectGoogle} disabled={isConnecting} className="mt-4">
          {isConnecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LinkIcon className="mr-2 h-4 w-4" />
          )}
          Connect Search Console
        </Button>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Analytics</h1>
          <p className="text-muted-foreground mt-1">Google Search Console performance data.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {sites.length > 0 && (
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site: any) => (
                  <SelectItem key={site.siteUrl} value={site.siteUrl}>
                    {site.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="28">Last 28 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(isLoadingDetails || isLoadingAnalytics) ? (
        <AnalyticsSkeleton />
      ) : !selectedSite ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 py-10">
            <Globe className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Select a property to view analytics</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Clicks"
              value={formatNumber(totals.clicks)}
              icon={MousePointerClick}
              color="text-blue-500"
              bg="bg-blue-500/10"
            />
            <StatCard
              title="Total Impressions"
              value={formatNumber(totals.impressions)}
              icon={Eye}
              color="text-purple-500"
              bg="bg-purple-500/10"
            />
            <StatCard
              title="Average CTR"
              value={`${totals.ctr}%`}
              icon={Percent}
              color="text-amber-500"
              bg="bg-amber-500/10"
            />
            <StatCard
              title="Average Position"
              value={totals.position}
              icon={TrendingUp}
              color="text-green-500"
              bg="bg-green-500/10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Performance Chart */}
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>Clicks and impressions over the last {dateRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full mt-4">
                  {timeSeries.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No data available for this range
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey={(row) => {
                            if (!row.keys || !row.keys[0]) return '';
                            const d = new Date(row.keys[0]);
                            return format(d, 'MMM d');
                          }} 
                          stroke="#888888" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          dy={10}
                        />
                        <YAxis 
                          yAxisId="left"
                          stroke="#888888" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => formatNumber(value)}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#888888" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => formatNumber(value)}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '4px' }}
                          labelFormatter={(label, data) => {
                            if (data && data[0] && data[0].payload && data[0].payload.keys) {
                                return format(new Date(data[0].payload.keys[0]), 'MMMM d, yyyy');
                            }
                            return label;
                          }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="clicks" 
                          name="Clicks"
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorClicks)" 
                        />
                        <Area 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="impressions" 
                          name="Impressions"
                          stroke="#a855f7" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorImpressions)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card className="shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most clicked pages</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {topPages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No data
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {topPages.map((page: any, idx: number) => {
                      const url = page.keys[0];
                      const path = url.replace(selectedSite, '').replace(/^https?:\/\/[^\/]+/, '') || '/';
                      
                      return (
                        <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                          <div className="flex flex-col overflow-hidden mr-4">
                            <span className="text-sm font-medium truncate" title={url}>
                              {path}
                            </span>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MousePointerClick className="w-3 h-3" /> {formatNumber(page.clicks)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {formatNumber(page.impressions)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-medium text-amber-500">
                              {(page.ctr * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Pos: {page.position.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string; value: string | number; icon: any; color: string; bg: string }) {
  return (
    <Card className="shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full ${bg} ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold tracking-tight mt-1">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[450px] lg:col-span-2 rounded-xl" />
        <Skeleton className="h-[450px] rounded-xl" />
      </div>
    </div>
  );
}
