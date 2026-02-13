import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { UserPlus, Users, UserCheck, ArrowUpDown } from "lucide-react";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899"];

interface ChannelRow {
  name: string;
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  sessions: number;
  events: number;
  avgEngagementTime: number;
}

interface UserAcquisitionData {
  period: string;
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  channels: ChannelRow[];
  timeline: { date: string; totalUsers: number; newUsers: number }[];
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

  const { data, isLoading } = useQuery<UserAcquisitionData>({
    queryKey: ["/api/projects", currentProject?.id, "user-acquisition", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/user-acquisition?${queryParams}`);
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
          <CardTitle className="text-base">Channel Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-channel">First user primary channel group <ArrowUpDown className="h-3 w-3" /></span>
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
                {data.channels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">No channel data available for this period</td>
                  </tr>
                ) : (
                  data.channels.map((c, i) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
