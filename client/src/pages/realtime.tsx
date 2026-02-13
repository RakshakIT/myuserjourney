import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Zap, Users, Eye, Activity } from "lucide-react";
import { ExportMenu } from "@/components/export-menu";

interface RealtimeData {
  activeUsers30: number;
  activeUsers5: number;
  pageViews30: number;
  perMinute: { minute: string; users: number }[];
  topPages: { page: string; activeUsers: number; views: number }[];
  topSources: { source: string; activeUsers: number }[];
  topCountries: { country: string; activeUsers: number }[];
  eventTypes: { name: string; count: number }[];
  totalEvents: number;
}

export default function RealtimePage() {
  const { currentProject } = useProject();

  const { data, isLoading } = useQuery<RealtimeData>({
    queryKey: ["/api/projects", currentProject?.id, "realtime"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/realtime`);
      return res.json();
    },
    enabled: !!currentProject,
    refetchInterval: 15000,
  });

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground" data-testid="text-no-project">Select a project to view realtime data.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const sourceLabels: Record<string, string> = {
    direct: "Direct",
    organic_search: "Organic Search",
    social: "Social",
    referral: "Referral",
    email: "Email",
    paid_search: "Paid Search",
    paid_social: "Paid Social",
    display: "Display",
    affiliate: "Affiliate",
    internal: "Internal",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-realtime-title">Realtime</h1>
          <Badge variant="secondary" data-testid="badge-realtime-status">Live</Badge>
        </div>
        {data && <ExportMenu data={data} filename="realtime" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (5 min)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-active-users-5">{data.activeUsers5}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (30 min)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-active-users-30">{data.activeUsers30}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views (30 min)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-pageviews-30">{data.pageViews30}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events (30 min)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-events">{data.totalEvents}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users per Minute (Last 30 min)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.perMinute} data-testid="chart-per-minute">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="minute" tick={{ fontSize: 10 }} interval={4} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active pages</p>
            ) : (
              <div className="space-y-2">
                {data.topPages.slice(0, 10).map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm" data-testid={`row-page-${i}`}>
                    <span className="truncate flex-1 text-muted-foreground">{p.page}</span>
                    <Badge variant="secondary">{p.activeUsers}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No traffic sources</p>
            ) : (
              <div className="space-y-2">
                {data.topSources.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm" data-testid={`row-source-${i}`}>
                    <span className="truncate flex-1 text-muted-foreground">{sourceLabels[s.source] || s.source}</span>
                    <Badge variant="secondary">{s.activeUsers}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No country data</p>
            ) : (
              <div className="space-y-2">
                {data.topCountries.slice(0, 10).map((c, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm" data-testid={`row-country-${i}`}>
                    <span className="truncate flex-1 text-muted-foreground">{c.country}</span>
                    <Badge variant="secondary">{c.activeUsers}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
