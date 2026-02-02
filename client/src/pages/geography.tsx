import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Globe } from "lucide-react";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

interface GeographyData {
  period: string;
  countries: { name: string; users: number; sessions: number; events: number }[];
  cities: { name: string; users: number; sessions: number; events: number; country: string }[];
  languages: { name: string; users: number; events: number }[];
}

export default function GeographyPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading } = useQuery<GeographyData>({
    queryKey: ["/api/projects", currentProject?.id, "geography", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/geography?${queryParams}`);
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

  const countryChartData = data.countries.slice(0, 8).map(c => ({
    name: c.name,
    value: c.users,
  }));

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader title="Geography" icon={Globe} {...headerProps} exportData={data} exportFilename="geography" />

      <Tabs defaultValue="countries">
        <TabsList data-testid="tabs-geography">
          <TabsTrigger value="countries" data-testid="tab-countries">Countries</TabsTrigger>
          <TabsTrigger value="cities" data-testid="tab-cities">Cities</TabsTrigger>
          <TabsTrigger value="languages" data-testid="tab-languages">Languages</TabsTrigger>
        </TabsList>

        <TabsContent value="countries" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users by Country</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={countryChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {countryChartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
              <CardTitle className="text-base">Country Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Country</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sessions</th>
                      <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.countries.map((c, i) => (
                      <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-country-${i}`}>
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
        </TabsContent>

        <TabsContent value="cities" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">City Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">City</th>
                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">Country</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sessions</th>
                      <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cities.map((c, i) => (
                      <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-city-${i}`}>
                        <td className="py-2 pr-4">{c.name}</td>
                        <td className="py-2 px-4 text-muted-foreground">{c.country}</td>
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
        </TabsContent>

        <TabsContent value="languages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Language Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Language</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.languages.map((l, i) => (
                      <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-language-${i}`}>
                        <td className="py-2 pr-4">{l.name}</td>
                        <td className="text-right py-2 px-4">{l.users.toLocaleString()}</td>
                        <td className="text-right py-2 pl-4">{l.events.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
