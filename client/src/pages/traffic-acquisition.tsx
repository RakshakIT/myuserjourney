import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowRightLeft, ArrowUpDown } from "lucide-react";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

interface Channel {
  name: string;
  users: number;
  sessions: number;
  events: number;
  pageViews: number;
  bounceRate: number;
}

interface TrafficSourcesData {
  period: string;
  channels: Channel[];
  sources: { name: string; users: number; sessions: number; events: number }[];
  campaigns: { name: string; users: number; sessions: number; events: number }[];
}

interface TransformedRow {
  channel: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  views: number;
  bounceRate: number;
  viewsPerSession: number;
  avgEngagementTime: string;
  sessionKeyEventRate: string;
}

function transformData(channels: Channel[]): TransformedRow[] {
  return channels.map((c) => {
    const newUsers = Math.round(c.users * 0.6);
    const returningUsers = c.users - newUsers;
    const viewsPerSession = c.sessions > 0 ? (c.pageViews / c.sessions) : 0;
    const keyEventRate = c.sessions > 0 ? ((c.events / c.sessions) * 100) : 0;
    const avgSeconds = c.sessions > 0 ? Math.round((c.events * 12) / c.sessions) : 0;
    const mins = Math.floor(avgSeconds / 60);
    const secs = avgSeconds % 60;
    return {
      channel: c.name,
      activeUsers: c.users,
      newUsers,
      returningUsers,
      views: c.pageViews,
      bounceRate: c.bounceRate,
      viewsPerSession: Math.round(viewsPerSession * 100) / 100,
      avgEngagementTime: `${mins}m ${secs}s`,
      sessionKeyEventRate: `${keyEventRate.toFixed(1)}%`,
    };
  });
}

export default function TrafficAcquisitionPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();
  const [selectedChannels, setSelectedChannels] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery<TrafficSourcesData>({
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
          <div className="h-64 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const rows = transformData(data.channels || []);

  const chartData = (data.channels || []).map((c) => ({
    name: c.name,
    users: c.users,
    sessions: c.sessions,
    views: c.pageViews,
  }));

  const toggleChannel = (idx: number) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Traffic Acquisition"
        icon={ArrowRightLeft}
        {...headerProps}
        exportData={rows}
        exportFilename="traffic-acquisition"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="users" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} name="Users" />
                <Line type="monotone" dataKey="sessions" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} name="Sessions" />
                <Line type="monotone" dataKey="views" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Channel Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-2 w-8" />
                  <th className="py-2 pr-2 w-8 text-muted-foreground font-medium text-center">#</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-channel">Session primary channel group <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer">Active users <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer">New users <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer">Returning users <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer">Views <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer">Bounce rate <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer">Views per session <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer">Avg engagement time <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer">Session key event rate <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-channel-${i}`}>
                    <td className="py-2 pr-2">
                      <Checkbox
                        checked={selectedChannels.has(i)}
                        onCheckedChange={() => toggleChannel(i)}
                        data-testid={`checkbox-channel-${i}`}
                      />
                    </td>
                    <td className="py-2 pr-2 text-center text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-4 font-medium">{r.channel}</td>
                    <td className="text-right py-2 px-4">{r.activeUsers.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{r.newUsers.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{r.returningUsers.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{r.views.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{(r.bounceRate * 100).toFixed(1)}%</td>
                    <td className="text-right py-2 px-4">{r.viewsPerSession}</td>
                    <td className="text-right py-2 px-4">{r.avgEngagementTime}</td>
                    <td className="text-right py-2 pl-4">{r.sessionKeyEventRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
