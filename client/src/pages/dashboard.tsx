import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProject } from "@/lib/project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExportMenu } from "@/components/export-menu";
import { FeatureGuide, GUIDE_CONFIGS } from "@/components/feature-guide";

const CHART_COLORS = [
  "hsl(217, 91%, 35%)",
  "hsl(187, 71%, 32%)",
  "hsl(262, 52%, 38%)",
  "hsl(32, 95%, 38%)",
  "hsl(340, 82%, 38%)",
  "hsl(160, 60%, 30%)",
  "hsl(45, 80%, 35%)",
  "hsl(290, 50%, 35%)",
];

interface ComparisonData {
  period: string;
  dateRange: { from: string; to: string };
  previousDateRange: { from: string; to: string } | null;
  current: {
    pageViews: number;
    clicks: number;
    uniqueVisitors: number;
    sessions: number;
    bots: number;
    internal: number;
    bounceRate: number;
    totalEvents: number;
  };
  previous: {
    pageViews: number;
    clicks: number;
    uniqueVisitors: number;
    sessions: number;
    bots: number;
    internal: number;
    bounceRate: number;
    totalEvents: number;
  } | null;
  changes: {
    pageViews: number | null;
    clicks: number | null;
    uniqueVisitors: number | null;
    sessions: number | null;
    bounceRate: number | null;
    totalEvents: number | null;
  };
  timeSeries: { label: string; pageViews: number; clicks: number; visitors: number; events: number }[];
  breakdowns: {
    device: { name: string; count: number }[];
    browser: { name: string; count: number }[];
    country: { name: string; count: number }[];
    page: { name: string; count: number }[];
    referrer: { name: string; count: number }[];
    eventType: { name: string; count: number }[];
    os: { name: string; count: number }[];
    city: { name: string; count: number }[];
  };
}

const PERIODS = [
  { value: "hourly", label: "Last 24 Hours" },
  { value: "daily", label: "Today" },
  { value: "weekly", label: "Last 7 Days" },
  { value: "monthly", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  previous,
}: {
  title: string;
  value: string | number;
  change: number | null;
  icon: any;
  previous?: string | number | null;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight" data-testid={`stat-value-${title.toLowerCase().replace(/\s/g, '-')}`}>{value}</p>
            {change !== null && (
              <div className="flex items-center gap-1">
                {change > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : change < 0 ? (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={`text-xs font-medium ${
                    change > 0 ? "text-emerald-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
                  }`}
                  data-testid={`stat-change-${title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {change > 0 ? "+" : ""}{change}%
                </span>
                {previous !== null && previous !== undefined && (
                  <span className="text-xs text-muted-foreground ml-1">
                    vs {previous}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Globe className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No project selected</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Select a project from the sidebar or create a new one to start viewing analytics data.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { currentProject } = useProject();
  const [period, setPeriod] = useState("monthly");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [useCustomRange, setUseCustomRange] = useState(false);

  const queryParams = useCustomRange && customFrom && customTo
    ? `?from=${customFrom}&to=${customTo}`
    : `?period=${period}`;

  const { data: comparison, isLoading } = useQuery<ComparisonData>({
    queryKey: ["/api/projects", currentProject?.id, "analytics/compare", queryParams],
    queryFn: async () => {
      const resp = await fetch(`/api/projects/${currentProject?.id}/analytics/compare${queryParams}`);
      if (!resp.ok) throw new Error("Failed to fetch");
      return resp.json();
    },
    enabled: !!currentProject,
  });

  if (!currentProject) {
    return <EmptyDashboard />;
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const data = comparison;
  const cur = data?.current || { pageViews: 0, clicks: 0, uniqueVisitors: 0, sessions: 0, bots: 0, internal: 0, bounceRate: 0, totalEvents: 0 };
  const prev = data?.previous;
  const changes = data?.changes || { pageViews: null, clicks: null, uniqueVisitors: null, sessions: null, bounceRate: null, totalEvents: null };

  const periodLabel = PERIODS.find(p => p.value === period)?.label || period;

  return (
    <div className="p-6 space-y-6">
      <FeatureGuide {...GUIDE_CONFIGS.dashboard} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">
            {currentProject.name}
          </h1>
          <p className="text-sm text-muted-foreground">{currentProject.domain}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={period} onValueChange={(v) => { setPeriod(v); setUseCustomRange(false); }}>
            <SelectTrigger className="w-[180px]" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {data && <ExportMenu data={data} filename="dashboard-analytics" />}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" data-testid="button-custom-date">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 space-y-3" align="end">
              <p className="text-sm font-medium">Custom Date Range</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    data-testid="input-date-from"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    data-testid="input-date-to"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => { if (customFrom && customTo) setUseCustomRange(true); }}
                  disabled={!customFrom || !customTo}
                  data-testid="button-apply-date-range"
                >
                  Apply Range
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {useCustomRange && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {new Date(customFrom).toLocaleDateString()} - {new Date(customTo).toLocaleDateString()}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUseCustomRange(false)}
            data-testid="button-clear-date-range"
          >
            Clear
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Page Views"
          value={cur.pageViews.toLocaleString()}
          change={changes.pageViews}
          icon={Eye}
          previous={prev?.pageViews?.toLocaleString()}
        />
        <StatCard
          title="Unique Visitors"
          value={cur.uniqueVisitors.toLocaleString()}
          change={changes.uniqueVisitors}
          icon={Users}
          previous={prev?.uniqueVisitors?.toLocaleString()}
        />
        <StatCard
          title="Total Clicks"
          value={cur.clicks.toLocaleString()}
          change={changes.clicks}
          icon={MousePointerClick}
          previous={prev?.clicks?.toLocaleString()}
        />
        <StatCard
          title="Total Events"
          value={cur.totalEvents.toLocaleString()}
          change={changes.totalEvents}
          icon={Activity}
          previous={prev?.totalEvents?.toLocaleString()}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
              <p className="text-xl font-bold">{cur.bounceRate}%</p>
              {changes.bounceRate !== null && (
                <div className="flex items-center gap-1">
                  {changes.bounceRate < 0 ? (
                    <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                  ) : changes.bounceRate > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={`text-xs font-medium ${changes.bounceRate < 0 ? "text-emerald-500" : changes.bounceRate > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {changes.bounceRate > 0 ? "+" : ""}{changes.bounceRate}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Sessions</p>
              <p className="text-xl font-bold">{cur.sessions.toLocaleString()}</p>
              {changes.sessions !== null && (
                <div className="flex items-center gap-1">
                  {changes.sessions > 0 ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : changes.sessions < 0 ? <ArrowDownRight className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                  <span className={`text-xs font-medium ${changes.sessions > 0 ? "text-emerald-500" : changes.sessions < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {changes.sessions > 0 ? "+" : ""}{changes.sessions}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Bot Traffic</p>
                <p className="text-xl font-bold">{cur.bots}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Internal</p>
                <p className="text-xl font-bold">{cur.internal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Traffic Overview</CardTitle>
            <Badge variant="secondary">{useCustomRange ? "Custom Range" : periodLabel}</Badge>
          </CardHeader>
          <CardContent>
            {data?.timeSeries && data.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.timeSeries}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 91%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" />
                  <Tooltip contentStyle={{ borderRadius: "6px", border: "1px solid hsl(0, 0%, 91%)", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="pageViews" stroke={CHART_COLORS[0]} fill="url(#viewsGrad)" strokeWidth={2} name="Page Views" />
                  <Area type="monotone" dataKey="clicks" stroke={CHART_COLORS[1]} fill="none" strokeWidth={2} strokeDasharray="4 4" name="Clicks" />
                  <Area type="monotone" dataKey="visitors" stroke={CHART_COLORS[2]} fill="none" strokeWidth={2} strokeDasharray="2 2" name="Visitors" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
                No traffic data for this period. Install the tracking snippet to start collecting data.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.breakdowns?.device && data.breakdowns.device.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.breakdowns.device}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="count"
                      nameKey="name"
                      paddingAngle={3}
                    >
                      {data.breakdowns.device.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "6px", border: "1px solid hsl(0, 0%, 91%)", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {data.breakdowns.device.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{d.name} ({d.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                No device data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.breakdowns?.page && data.breakdowns.page.length > 0 ? (
              <div className="space-y-3">
                {data.breakdowns.page.slice(0, 8).map((page, i) => {
                  const max = data.breakdowns.page[0]?.count || 1;
                  const pct = (page.count / max) * 100;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm truncate max-w-[250px]">{page.name}</span>
                        <span className="text-sm font-medium tabular-nums">{page.count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                No page view data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.breakdowns?.referrer && data.breakdowns.referrer.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.breakdowns.referrer.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 91%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" width={80} />
                  <Tooltip contentStyle={{ borderRadius: "6px", border: "1px solid hsl(0, 0%, 91%)", fontSize: "12px" }} />
                  <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                No referrer data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.breakdowns?.browser && data.breakdowns.browser.length > 0 ? (
              <div className="space-y-2">
                {data.breakdowns.browser.slice(0, 6).map((b, i) => (
                  <div key={b.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm">{b.name}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{b.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.breakdowns?.country && data.breakdowns.country.length > 0 ? (
              <div className="space-y-2">
                {data.breakdowns.country.slice(0, 6).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm">{c.name}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{c.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.breakdowns?.eventType && data.breakdowns.eventType.length > 0 ? (
              <div className="space-y-2">
                {data.breakdowns.eventType.map((et, i) => (
                  <div key={et.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm capitalize">{et.name.replace(/_/g, " ")}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{et.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
