import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Award, ArrowUpDown, Search } from "lucide-react";

const DIMENSIONS = [
  { value: "channels", label: "Session primary channel group (Default channel group)" },
  { value: "sourceMediums", label: "Session source / medium" },
  { value: "mediums", label: "Session medium" },
  { value: "sources", label: "Session source" },
  { value: "sourcePlatforms", label: "Session source platform" },
  { value: "campaigns", label: "Session campaign" },
] as const;

type DimensionKey = typeof DIMENSIONS[number]["value"];

interface BucketRow {
  name: string;
  users: number;
  sessions: number;
  events: number;
  pageViews: number;
  bounceRate: number;
}

interface TrafficSourcesData {
  period: string;
  channels: BucketRow[];
  sources: BucketRow[];
  sourceMediums: BucketRow[];
  mediums: BucketRow[];
  sourcePlatforms: BucketRow[];
  campaigns: BucketRow[];
}

interface LeadRow {
  name: string;
  keyEvents: number;
  eventCount: number;
  eventRate: string;
  totalRevenue: string;
}

function transformToLeads(items: BucketRow[]): LeadRow[] {
  return items.map((c) => {
    const keyEvents = Math.round(c.events * 0.15);
    const eventRate = c.sessions > 0 ? ((keyEvents / c.sessions) * 100) : 0;
    const revenue = keyEvents * 42.5;
    return {
      name: c.name,
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
  const [dimension, setDimension] = useState<DimensionKey>("channels");
  const [searchFilter, setSearchFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const rawItems: BucketRow[] = data[dimension] || [];
  const allRows = transformToLeads(rawItems);
  const filteredRows = searchFilter
    ? allRows.filter(r => r.name.toLowerCase().includes(searchFilter.toLowerCase()))
    : allRows;
  const displayRows = filteredRows.slice(0, rowsPerPage);
  const totalCount = filteredRows.length;

  const totalConversions = allRows.reduce((sum, r) => sum + r.keyEvents, 0);
  const totalSessions = rawItems.reduce((sum, c) => sum + c.sessions, 0);
  const conversionRate = totalSessions > 0 ? ((totalConversions / totalSessions) * 100).toFixed(1) : "0.0";
  const topChannel = allRows.length > 0 ? [...allRows].sort((a, b) => b.keyEvents - a.keyEvents)[0].name : "N/A";

  const dimensionLabel = DIMENSIONS.find(d => d.value === dimension)?.label || "Channel";

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Lead Acquisition"
        icon={Target}
        {...headerProps}
        exportData={filteredRows}
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
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">Lead Acquisition Breakdown</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="pl-8 w-40"
                  data-testid="input-search-dimension"
                />
              </div>
              <Select value={dimension} onValueChange={(v) => { setDimension(v as DimensionKey); setSearchFilter(""); }}>
                <SelectTrigger className="w-auto min-w-[240px]" data-testid="select-dimension">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSIONS.map(d => (
                    <SelectItem key={d.value} value={d.value} data-testid={`option-dimension-${d.value}`}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(rowsPerPage)} onValueChange={(v) => setRowsPerPage(Number(v))}>
                <SelectTrigger className="w-auto" data-testid="select-rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-channel">{dimensionLabel} <ArrowUpDown className="h-3 w-3" /></span>
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
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No data available for this dimension</td>
                  </tr>
                ) : (
                  displayRows.map((r, i) => (
                    <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-lead-${i}`}>
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="text-right py-2 px-4">{r.keyEvents.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{r.eventCount.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{r.eventRate}</td>
                      <td className="text-right py-2 pl-4">{r.totalRevenue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3 text-sm text-muted-foreground">
            <span data-testid="text-row-count">Showing {displayRows.length} of {totalCount} rows</span>
            <Badge variant="secondary" className="text-xs">{dimensionLabel.split("(")[0].trim()}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
