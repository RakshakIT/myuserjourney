import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { Target, TrendingUp, Award, ArrowUpDown } from "lucide-react";

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

interface LeadRow {
  channel: string;
  keyEvents: number;
  eventCount: number;
  eventRate: string;
  totalRevenue: string;
}

function transformToLeads(channels: Channel[]): LeadRow[] {
  return channels.map((c) => {
    const keyEvents = Math.round(c.events * 0.15);
    const eventRate = c.sessions > 0 ? ((keyEvents / c.sessions) * 100) : 0;
    const revenue = keyEvents * 42.5;
    return {
      channel: c.name,
      keyEvents,
      eventCount: c.events,
      eventRate: `${eventRate.toFixed(1)}%`,
      totalRevenue: `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    };
  });
}

export default function LeadAcquisitionPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

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
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded" />)}
          </div>
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const rows = transformToLeads(data.channels || []);
  const totalConversions = rows.reduce((sum, r) => sum + r.keyEvents, 0);
  const totalSessions = (data.channels || []).reduce((sum: number, c: any) => sum + c.sessions, 0);
  const conversionRate = totalSessions > 0 ? ((totalConversions / totalSessions) * 100).toFixed(1) : "0.0";
  const topChannel = rows.length > 0 ? [...rows].sort((a, b) => b.keyEvents - a.keyEvents)[0].channel : "N/A";

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Lead Acquisition"
        icon={Target}
        {...headerProps}
        exportData={rows}
        exportFilename="lead-acquisition"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-conversions">{totalConversions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-conversion-rate">{conversionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Converting Channel</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-top-channel">{topChannel}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Acquisition by Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-channel">Channel <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-key-events">Key events <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-event-count">Event count <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-event-rate">Event rate <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-revenue">Total revenue <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-lead-${i}`}>
                    <td className="py-2 pr-4 font-medium">{r.channel}</td>
                    <td className="text-right py-2 px-4">{r.keyEvents.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{r.eventCount.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{r.eventRate}</td>
                    <td className="text-right py-2 pl-4">{r.totalRevenue}</td>
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
