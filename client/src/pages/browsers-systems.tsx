import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Monitor } from "lucide-react";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

interface TechData {
  period: string;
  browsers: { name: string; users: number; sessions: number; events: number }[];
  operatingSystems: { name: string; users: number; sessions: number; events: number }[];
  devices: { name: string; users: number; sessions: number; events: number }[];
}

function SharePieChart({ data, dataKey = "users" }: { data: { name: string; [key: string]: string | number }[]; dataKey?: string }) {
  const chartData = data.map(item => ({
    name: item.name,
    value: item[dataKey] as number,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function DonutChart({ data, dataKey = "users" }: { data: { name: string; [key: string]: string | number }[]; dataKey?: string }) {
  const chartData = data.map(item => ({
    name: item.name,
    value: item[dataKey] as number,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TechTable({ data, label }: { data: { name: string; users: number; sessions: number; events: number }[]; label: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">{label}</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">Users</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sessions</th>
            <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Events</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-${label.toLowerCase()}-${i}`}>
              <td className="py-2 pr-4">
                <Badge variant="outline">{item.name}</Badge>
              </td>
              <td className="text-right py-2 px-4">{item.users.toLocaleString()}</td>
              <td className="text-right py-2 px-4">{item.sessions.toLocaleString()}</td>
              <td className="text-right py-2 pl-4">{item.events.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BrowsersSystemsPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading } = useQuery<TechData>({
    queryKey: ["/api/projects", currentProject?.id, "tech", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/tech?${queryParams}`);
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

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader title="Browsers & Systems" icon={Monitor} {...headerProps} exportData={data} exportFilename="browsers-systems" />

      <Tabs defaultValue="browsers">
        <TabsList data-testid="tabs-tech">
          <TabsTrigger value="browsers" data-testid="tab-browsers">Browsers</TabsTrigger>
          <TabsTrigger value="os" data-testid="tab-os">Operating Systems</TabsTrigger>
          <TabsTrigger value="devices" data-testid="tab-devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="browsers" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Browser Share</CardTitle>
            </CardHeader>
            <CardContent>
              <SharePieChart data={data.browsers} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Browser Details</CardTitle>
            </CardHeader>
            <CardContent>
              <TechTable data={data.browsers} label="Browser" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="os" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">OS Share</CardTitle>
            </CardHeader>
            <CardContent>
              <SharePieChart data={data.operatingSystems} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">OS Details</CardTitle>
            </CardHeader>
            <CardContent>
              <TechTable data={data.operatingSystems} label="OS" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Device Share</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={data.devices} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Device Details</CardTitle>
            </CardHeader>
            <CardContent>
              <TechTable data={data.devices} label="Device" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
