import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Globe, Users, Layers } from "lucide-react";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { FeatureGuide, GUIDE_CONFIGS } from "@/components/feature-guide";

interface AcquisitionData {
  period: string;
  totalUsers: number;
  totalSessions: number;
  sources: { source: string; users: number; sessions: number; events: number; pageViews: number }[];
  referrers: { referrer: string; users: number; sessions: number }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(210 70% 55%)",
  "hsl(340 65% 55%)",
  "hsl(170 60% 45%)",
];

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

export default function AcquisitionPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading } = useQuery<AcquisitionData>({
    queryKey: ["/api/projects", currentProject?.id, "acquisition", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/acquisition?${queryParams}`);
      return res.json();
    },
    enabled: !!currentProject,
  });

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground" data-testid="text-no-project">Select a project to view acquisition data.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.sources.map(s => ({
    name: sourceLabels[s.source] || s.source,
    value: s.users,
  }));

  return (
    <div className="p-6 space-y-6">
      <FeatureGuide {...GUIDE_CONFIGS.acquisition} />
      <AnalyticsHeader title="Acquisition Overview" icon={Globe} {...headerProps} exportData={data} exportFilename="acquisition" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-users">{data.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-sessions">{data.totalSessions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.sources.map(s => ({ name: sourceLabels[s.source] || s.source, users: s.users, sessions: s.sessions }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Events</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Page Views</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.map((s, i) => (
                  <tr key={i} className="border-b last:border-0" data-testid={`row-source-${i}`}>
                    <td className="py-2 pr-4">
                      <Badge variant="outline">{sourceLabels[s.source] || s.source}</Badge>
                    </td>
                    <td className="text-right py-2 px-4">{s.users}</td>
                    <td className="text-right py-2 px-4">{s.sessions}</td>
                    <td className="text-right py-2 px-4">{s.events}</td>
                    <td className="text-right py-2 pl-4">{s.pageViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          {data.referrers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No referrer data available.</p>
          ) : (
            <div className="space-y-2">
              {data.referrers.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm" data-testid={`row-referrer-${i}`}>
                  <span className="truncate flex-1 text-muted-foreground">{r.referrer}</span>
                  <div className="flex gap-3">
                    <span>{r.users} users</span>
                    <span className="text-muted-foreground">{r.sessions} sessions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
