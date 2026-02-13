import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText } from "lucide-react";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

interface PagesAnalysisData {
  period: string;
  topPages: { page: string; views: number; users: number; sessions: number }[];
  entryPages: { page: string; sessions: number; users: number }[];
  exitPages: { page: string; sessions: number; users: number }[];
  possible404s: { page: string; views: number; users: number }[];
}

export default function PagesAnalysisPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading } = useQuery<PagesAnalysisData>({
    queryKey: ["/api/projects", currentProject?.id, "pages-analysis", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/pages-analysis?${queryParams}`);
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
      <AnalyticsHeader title="Pages & Screens" icon={FileText} {...headerProps} exportData={data} exportFilename="pages-analysis" />

      <Tabs defaultValue="top-pages">
        <TabsList data-testid="tabs-pages">
          <TabsTrigger value="top-pages" data-testid="tab-top-pages">Top Pages</TabsTrigger>
          <TabsTrigger value="entry-pages" data-testid="tab-entry-pages">Entry Pages</TabsTrigger>
          <TabsTrigger value="exit-pages" data-testid="tab-exit-pages">Exit Pages</TabsTrigger>
          <TabsTrigger value="possible-404" data-testid="tab-possible-404">
            Possible 404
            {data.possible404s.length > 0 && (
              <Badge variant="destructive" className="ml-2">New</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top-pages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Pages by Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topPages.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis dataKey="page" type="category" width={180} tick={{ fontSize: 10 }} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="views" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Page Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Page</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Views</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.map((p, i) => (
                      <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-top-page-${i}`}>
                        <td className="py-2 pr-4 truncate max-w-xs">{p.page}</td>
                        <td className="text-right py-2 px-4">{p.views.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">{p.users.toLocaleString()}</td>
                        <td className="text-right py-2 pl-4">{p.sessions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entry-pages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Entry Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Page</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sessions</th>
                      <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.entryPages.map((p, i) => (
                      <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-entry-page-${i}`}>
                        <td className="py-2 pr-4 truncate max-w-xs">{p.page}</td>
                        <td className="text-right py-2 px-4">{p.sessions.toLocaleString()}</td>
                        <td className="text-right py-2 pl-4">{p.users.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exit-pages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exit Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Page</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sessions</th>
                      <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.exitPages.map((p, i) => (
                      <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-exit-page-${i}`}>
                        <td className="py-2 pr-4 truncate max-w-xs">{p.page}</td>
                        <td className="text-right py-2 px-4">{p.sessions.toLocaleString()}</td>
                        <td className="text-right py-2 pl-4">{p.users.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="possible-404" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Possible 404 Pages</CardTitle>
            </CardHeader>
            <CardContent>
              {data.possible404s.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-404">No 404 pages detected.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Page</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Views</th>
                        <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.possible404s.map((p, i) => (
                        <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-404-page-${i}`}>
                          <td className="py-2 pr-4 truncate max-w-xs">{p.page}</td>
                          <td className="text-right py-2 px-4">{p.views.toLocaleString()}</td>
                          <td className="text-right py-2 pl-4">{p.users.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
