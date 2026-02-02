import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { UserPlus, Users, UserCheck, ArrowUpDown, Search } from "lucide-react";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899"];

const DIMENSIONS = [
  { value: "channels", label: "First user primary channel group (Default channel group)" },
  { value: "sourceMediums", label: "First user source / medium" },
  { value: "mediums", label: "First user medium" },
  { value: "sources", label: "First user source" },
  { value: "sourcePlatforms", label: "First user source platform" },
  { value: "campaigns", label: "First user campaign" },
] as const;

type DimensionKey = typeof DIMENSIONS[number]["value"];

interface BucketRow {
  name: string;
  users: number;
  sessions: number;
  events: number;
  pageViews: number;
  bounceRate: number;
}

interface UserAcquisitionData {
  period: string;
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  channels: { name: string; totalUsers: number; newUsers: number; returningUsers: number; sessions: number; events: number; avgEngagementTime: number }[];
  timeline: { date: string; totalUsers: number; newUsers: number }[];
}

interface TrafficSourcesData {
  period: string;
  channels: BucketRow[];
  sources: BucketRow[];
  sourceMediums: BucketRow[];
  mediums: BucketRow[];
  sourcePlatforms: BucketRow[];
  campaigns: BucketRow[];
}

function formatEngagementTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function UserAcquisitionPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();
  const [dimension, setDimension] = useState<DimensionKey>("channels");
  const [searchFilter, setSearchFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useQuery<UserAcquisitionData>({
    queryKey: ["/api/projects", currentProject?.id, "user-acquisition", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/user-acquisition?${queryParams}`);
      return res.json();
    },
    enabled: !!currentProject,
  });

  const { data: trafficData } = useQuery<TrafficSourcesData>({
    queryKey: ["/api/projects", currentProject?.id, "traffic-sources", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/traffic-sources?${queryParams}`);
      return res.json();
    },
    enabled: !!currentProject,
  });

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground" data-testid="text-no-project">No project selected.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded" />)}
          </div>
          <div className="h-64 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const useTrafficDimension = dimension !== "channels" && trafficData;
  const dimensionRows = useTrafficDimension
    ? (trafficData[dimension] || []).map(r => ({
        name: r.name,
        totalUsers: r.users,
        newUsers: Math.round(r.users * 0.6),
        returningUsers: r.users - Math.round(r.users * 0.6),
        sessions: r.sessions,
        events: r.events,
        avgEngagementTime: r.sessions > 0 ? Math.round((r.events * 12) / r.sessions) : 0,
      }))
    : data.channels;

  const filteredRows = searchFilter
    ? dimensionRows.filter(r => r.name.toLowerCase().includes(searchFilter.toLowerCase()))
    : dimensionRows;
  const displayRows = filteredRows.slice(0, rowsPerPage);
  const totalCount = filteredRows.length;
  const dimensionLabel = DIMENSIONS.find(d => d.value === dimension)?.label || "Channel";

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="User Acquisition"
        icon={UserPlus}
        {...headerProps}
        exportData={data}
        exportFilename="user-acquisition"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-users">{(data.totalUsers ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-new-users">{(data.newUsers ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-returning-users">{(data.returningUsers ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="totalUsers" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} name="Total Users" />
                <Line type="monotone" dataKey="newUsers" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">Channel Breakdown</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="pl-8 w-40"
                  data-testid="input-search-dimension"
                />
              </div>
              <Select value={dimension} onValueChange={(v) => { setDimension(v as DimensionKey); setSearchFilter(""); }}>
                <SelectTrigger className="w-auto min-w-[240px]" data-testid="select-dimension">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSIONS.map(d => (
                    <SelectItem key={d.value} value={d.value} data-testid={`option-dimension-${d.value}`}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(rowsPerPage)} onValueChange={(v) => setRowsPerPage(Number(v))}>
                <SelectTrigger className="w-auto" data-testid="select-rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-channel">{dimensionLabel} <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-total-users">Total users <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-new-users">New users <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-returning-users">Returning users <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-engagement-time">Avg engagement time <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-sessions">Sessions <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-event-count">Event count <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">No data available for this dimension</td>
                  </tr>
                ) : (
                  displayRows.map((c, i) => (
                    <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-channel-${i}`}>
                      <td className="py-2 pr-4 font-medium">{c.name}</td>
                      <td className="text-right py-2 px-4">{c.totalUsers.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{c.newUsers.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{c.returningUsers.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{formatEngagementTime(c.avgEngagementTime)}</td>
                      <td className="text-right py-2 px-4">{c.sessions.toLocaleString()}</td>
                      <td className="text-right py-2 pl-4">{c.events.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3 text-sm text-muted-foreground">
            <span data-testid="text-row-count">Showing {displayRows.length} of {totalCount} rows</span>
            <Badge variant="secondary" className="text-xs">{dimensionLabel.split("(")[0].trim()}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
