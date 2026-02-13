import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Megaphone, Users, Layers, Activity } from "lucide-react";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

interface Channel {
  name: string;
  users: number;
  sessions: number;
  events: number;
  pageViews: number;
  bounceRate: number;
}

interface Source {
  name: string;
  users: number;
  sessions: number;
  events: number;
}

interface Campaign {
  name: string;
  users: number;
  sessions: number;
  events: number;
}

interface TrafficSourcesData {
  period: string;
  channels: Channel[];
  sources: Source[];
  campaigns: Campaign[];
}

function SummaryCards({ items }: { items: { users: number; sessions: number; events: number }[] }) {
  const totals = items.reduce(
    (acc, item) => ({
      users: acc.users + item.users,
      sessions: acc.sessions + item.sessions,
      events: acc.events + item.events,
    }),
    { users: 0, sessions: 0, events: 0 }
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="text-total-users">{totals.users.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="text-total-sessions">{totals.sessions.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="text-total-events">{totals.events.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TrafficSourcesPage() {
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
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader title="Traffic Sources" icon={Megaphone} {...headerProps} exportData={data} exportFilename="traffic-sources" />

      <Tabs defaultValue="channels">
        <TabsList data-testid="tabs-traffic-sources">
          <TabsTrigger value="channels" data-testid="tab-channels">Channels</TabsTrigger>
          <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4 mt-4">
          <SummaryCards items={data.channels} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Channel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.channels} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="users" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Channel Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Channel</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sessions</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Page Views</th>
                      <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.channels.map((c, i) => (
                      <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-channel-${i}`}>
                        <td className="py-2 pr-4">
                          <Badge variant="outline">{c.name}</Badge>
                        </td>
                        <td className="text-right py-2 px-4">{c.users.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">{c.sessions.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">{c.pageViews.toLocaleString()}</td>
                        <td className="text-right py-2 pl-4">{(c.bounceRate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4 mt-4">
          <SummaryCards items={data.sources} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Source Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Source</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sessions</th>
                      <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sources.map((s, i) => (
                      <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-source-${i}`}>
                        <td className="py-2 pr-4">
                          <Badge variant="outline">{s.name}</Badge>
                        </td>
                        <td className="text-right py-2 px-4">{s.users.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">{s.sessions.toLocaleString()}</td>
                        <td className="text-right py-2 pl-4">{s.events.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4 mt-4">
          {data.campaigns.length > 0 ? (
            <>
              <SummaryCards items={data.campaigns} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Campaign Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Campaign</th>
                          <th className="text-right py-2 px-4 font-medium text-muted-foreground">Users</th>
                          <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sessions</th>
                          <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Events</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.campaigns.map((c, i) => (
                          <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-campaign-${i}`}>
                            <td className="py-2 pr-4">
                              <Badge variant="outline">{c.name}</Badge>
                            </td>
                            <td className="text-right py-2 px-4">{c.users.toLocaleString()}</td>
                            <td className="text-right py-2 px-4">{c.sessions.toLocaleString()}</td>
                            <td className="text-right py-2 pl-4">{c.events.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground text-center" data-testid="text-no-campaigns">No campaigns tracked.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
