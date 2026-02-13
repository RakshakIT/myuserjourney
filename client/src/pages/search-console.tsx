import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Search,
  Globe,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  TrendingDown,
  MousePointerClick,
  Eye,
  BarChart3,
  ArrowUpDown,
  ExternalLink,
  AlertCircle,
  Link2,
} from "lucide-react";

interface SearchConsoleData {
  connected: boolean;
  queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
  countries: { country: string; clicks: number; impressions: number; ctr: number; position: number }[];
  devices: { device: string; clicks: number; impressions: number; ctr: number; position: number }[];
  timeline: { date: string; clicks: number; impressions: number; ctr: number; position: number }[];
  totals: { clicks: number; impressions: number; ctr: number; position: number };
}

const CHART_COLORS = {
  clicks: "hsl(var(--chart-1))",
  impressions: "hsl(var(--chart-2))",
  ctr: "hsl(var(--chart-3))",
  position: "hsl(var(--chart-4))",
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function SearchConsolePage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();
  const [tab, setTab] = useState("queries");
  const [searchFilter, setSearchFilter] = useState("");

  const { data, isLoading } = useQuery<SearchConsoleData>({
    queryKey: ["/api/projects", currentProject?.id, "search-console", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/search-console?${queryParams}`);
      if (!res.ok) {
        return {
          connected: false,
          queries: [],
          pages: [],
          countries: [],
          devices: [],
          timeline: [],
          totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        };
      }
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

  if (!data?.connected && !isLoading) {
    return (
      <div className="p-6 space-y-6">
        <AnalyticsHeader
          title="Search Console"
          icon={Search}
          {...headerProps}
        />
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Google Search Console</h3>
          <p className="text-sm text-muted-foreground max-w-md text-center mb-4">
            Connect your Google Search Console account to view search performance data,
            including queries, clicks, impressions, CTR, and average position.
          </p>
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Go to Integrations to connect your account
            </span>
          </div>
        </div>
      </div>
    );
  }

  const filteredQueries = (data?.queries || []).filter(q =>
    q.query.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const filteredPages = (data?.pages || []).filter(p =>
    p.page.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Search Console"
        icon={Search}
        {...headerProps}
        exportData={data}
        exportFilename="search-console"
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-md" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-96 rounded-md" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground font-medium">Total Clicks</span>
                </div>
                <p className="text-2xl font-bold" data-testid="text-total-clicks">
                  {formatNumber(data?.totals.clicks || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground font-medium">Total Impressions</span>
                </div>
                <p className="text-2xl font-bold" data-testid="text-total-impressions">
                  {formatNumber(data?.totals.impressions || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground font-medium">Average CTR</span>
                </div>
                <p className="text-2xl font-bold" data-testid="text-avg-ctr">
                  {(data?.totals.ctr || 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground font-medium">Avg Position</span>
                </div>
                <p className="text-2xl font-bold" data-testid="text-avg-position">
                  {(data?.totals.position || 0).toFixed(1)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Search Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.timeline || []}>
                    <defs>
                      <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.clicks} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={CHART_COLORS.clicks} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.impressions} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={CHART_COLORS.impressions} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke={CHART_COLORS.clicks}
                      fill="url(#clicksGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke={CHART_COLORS.impressions}
                      fill="url(#impressionsGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Tabs value={tab} onValueChange={setTab}>
                <div className="flex items-center justify-between gap-4 px-4 pt-4 flex-wrap">
                  <TabsList>
                    <TabsTrigger value="queries" data-testid="tab-queries">
                      <Search className="h-3.5 w-3.5 mr-1.5" />
                      Queries
                    </TabsTrigger>
                    <TabsTrigger value="pages" data-testid="tab-pages">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Pages
                    </TabsTrigger>
                    <TabsTrigger value="countries" data-testid="tab-countries">
                      <Globe className="h-3.5 w-3.5 mr-1.5" />
                      Countries
                    </TabsTrigger>
                    <TabsTrigger value="devices" data-testid="tab-devices">
                      <Monitor className="h-3.5 w-3.5 mr-1.5" />
                      Devices
                    </TabsTrigger>
                  </TabsList>
                  <Input
                    placeholder="Filter..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-48"
                    data-testid="input-filter"
                  />
                </div>

                <TabsContent value="queries" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-queries">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-3 pl-4 font-medium text-muted-foreground">#</th>
                          <th className="p-3 font-medium text-muted-foreground">
                            <div className="flex items-center gap-1">Query <ArrowUpDown className="h-3 w-3" /></div>
                          </th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Clicks</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Impressions</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">CTR</th>
                          <th className="p-3 pr-4 font-medium text-muted-foreground text-right">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQueries.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              No query data available
                            </td>
                          </tr>
                        ) : (
                          filteredQueries.slice(0, 50).map((q, i) => (
                            <tr key={q.query} className="border-b last:border-0" data-testid={`row-query-${i}`}>
                              <td className="p-3 pl-4 text-muted-foreground">{i + 1}</td>
                              <td className="p-3 font-medium">{q.query}</td>
                              <td className="p-3 text-right">{formatNumber(q.clicks)}</td>
                              <td className="p-3 text-right">{formatNumber(q.impressions)}</td>
                              <td className="p-3 text-right">{q.ctr.toFixed(1)}%</td>
                              <td className="p-3 pr-4 text-right">{q.position.toFixed(1)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="pages" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-pages">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-3 pl-4 font-medium text-muted-foreground">#</th>
                          <th className="p-3 font-medium text-muted-foreground">
                            <div className="flex items-center gap-1">Page <ArrowUpDown className="h-3 w-3" /></div>
                          </th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Clicks</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Impressions</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">CTR</th>
                          <th className="p-3 pr-4 font-medium text-muted-foreground text-right">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPages.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              No page data available
                            </td>
                          </tr>
                        ) : (
                          filteredPages.slice(0, 50).map((p, i) => (
                            <tr key={p.page} className="border-b last:border-0" data-testid={`row-page-${i}`}>
                              <td className="p-3 pl-4 text-muted-foreground">{i + 1}</td>
                              <td className="p-3 font-medium truncate max-w-xs">
                                <a href={p.page} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                                  {p.page}
                                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                                </a>
                              </td>
                              <td className="p-3 text-right">{formatNumber(p.clicks)}</td>
                              <td className="p-3 text-right">{formatNumber(p.impressions)}</td>
                              <td className="p-3 text-right">{p.ctr.toFixed(1)}%</td>
                              <td className="p-3 pr-4 text-right">{p.position.toFixed(1)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="countries" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-countries">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-3 pl-4 font-medium text-muted-foreground">#</th>
                          <th className="p-3 font-medium text-muted-foreground">Country</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Clicks</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Impressions</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">CTR</th>
                          <th className="p-3 pr-4 font-medium text-muted-foreground text-right">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data?.countries || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              No country data available
                            </td>
                          </tr>
                        ) : (
                          (data?.countries || []).map((c, i) => (
                            <tr key={c.country} className="border-b last:border-0" data-testid={`row-country-${i}`}>
                              <td className="p-3 pl-4 text-muted-foreground">{i + 1}</td>
                              <td className="p-3 font-medium">{c.country}</td>
                              <td className="p-3 text-right">{formatNumber(c.clicks)}</td>
                              <td className="p-3 text-right">{formatNumber(c.impressions)}</td>
                              <td className="p-3 text-right">{c.ctr.toFixed(1)}%</td>
                              <td className="p-3 pr-4 text-right">{c.position.toFixed(1)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="devices" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-devices">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-3 pl-4 font-medium text-muted-foreground">Device</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Clicks</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Impressions</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">CTR</th>
                          <th className="p-3 pr-4 font-medium text-muted-foreground text-right">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data?.devices || []).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                              No device data available
                            </td>
                          </tr>
                        ) : (
                          (data?.devices || []).map((d, i) => {
                            const DeviceIcon = d.device === "MOBILE" ? Smartphone : d.device === "TABLET" ? Tablet : Monitor;
                            return (
                              <tr key={d.device} className="border-b last:border-0" data-testid={`row-device-${i}`}>
                                <td className="p-3 pl-4">
                                  <div className="flex items-center gap-2">
                                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium capitalize">{d.device.toLowerCase()}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-right">{formatNumber(d.clicks)}</td>
                                <td className="p-3 text-right">{formatNumber(d.impressions)}</td>
                                <td className="p-3 text-right">{d.ctr.toFixed(1)}%</td>
                                <td className="p-3 pr-4 text-right">{d.position.toFixed(1)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
