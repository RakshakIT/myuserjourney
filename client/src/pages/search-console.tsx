import { useProject } from "@/lib/project-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Globe,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  MousePointerClick,
  Eye,
  BarChart3,
  ArrowUpDown,
  ExternalLink,
  Upload,
  Sparkles,
  Target,
  AlertTriangle,
  Trophy,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
  FileBarChart,
} from "lucide-react";

interface SearchConsoleData {
  connected: boolean;
  queries: { query: string; page: string; clicks: number; impressions: number; ctr: number; position: number }[];
  pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
  countries: { country: string; clicks: number; impressions: number; ctr: number; position: number }[];
  devices: { device: string; clicks: number; impressions: number; ctr: number; position: number }[];
  timeline: { date: string; clicks: number; impressions: number; ctr: number; position: number }[];
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  keywordCount?: number;
}

interface StrategyReport {
  id: string;
  summary: string;
  quickWins: any[];
  contentGaps: any[];
  lowCtrFixes: any[];
  recommendations: any[];
  keywordCount: number;
  createdAt: string;
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

type FilterType = "all" | "quick-wins" | "content-gaps" | "low-ctr";

function StrategyReportView({ report }: { report: StrategyReport }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI SEO Strategy Report</CardTitle>
            <Badge variant="secondary" className="text-xs">{report.keywordCount} keywords analyzed</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-6">
          {report.summary && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FileBarChart className="h-4 w-4" />
                Executive Summary
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{report.summary}</p>
            </div>
          )}

          {Array.isArray(report.quickWins) && report.quickWins.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Quick Wins ({report.quickWins.length})
              </h4>
              <div className="space-y-2">
                {report.quickWins.map((qw: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-md border bg-card" data-testid={`quick-win-${i}`}>
                    <Badge variant={qw.expectedImpact === "high" ? "default" : "secondary"} className="mt-0.5 shrink-0 text-xs">
                      {qw.expectedImpact || "medium"}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{qw.keyword}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{qw.action}</p>
                      {qw.page && <p className="text-xs text-muted-foreground truncate mt-0.5">Page: {qw.page}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">Pos: {qw.currentPosition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(report.contentGaps) && report.contentGaps.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                Content Gaps ({report.contentGaps.length})
              </h4>
              <div className="space-y-2">
                {report.contentGaps.map((cg: any, i: number) => (
                  <div key={i} className="p-3 rounded-md border bg-card" data-testid={`content-gap-${i}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium">{cg.suggestedTitle || cg.topic}</p>
                      <Badge variant={cg.priority === "high" ? "default" : "secondary"} className="text-xs shrink-0">
                        {cg.priority || "medium"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cg.topic}</p>
                    {cg.searchIntent && (
                      <Badge variant="outline" className="text-xs mt-1">{cg.searchIntent}</Badge>
                    )}
                    {Array.isArray(cg.keywords) && cg.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cg.keywords.slice(0, 5).map((kw: string, j: number) => (
                          <Badge key={j} variant="outline" className="text-xs">{kw}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(report.lowCtrFixes) && report.lowCtrFixes.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Low CTR Fixes ({report.lowCtrFixes.length})
              </h4>
              <div className="space-y-2">
                {report.lowCtrFixes.map((fix: any, i: number) => (
                  <div key={i} className="p-3 rounded-md border bg-card" data-testid={`low-ctr-fix-${i}`}>
                    <p className="text-sm font-medium">{fix.keyword}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Position: {fix.position}</span>
                      <span>CTR: {fix.currentCtr}%</span>
                    </div>
                    {fix.suggestedTitle && (
                      <div className="mt-2 p-2 rounded bg-muted/50">
                        <p className="text-xs"><span className="font-medium">Suggested title:</span> {fix.suggestedTitle}</p>
                        {fix.suggestedDescription && (
                          <p className="text-xs mt-1"><span className="font-medium">Suggested description:</span> {fix.suggestedDescription}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(report.recommendations) && report.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                Recommendations ({report.recommendations.length})
              </h4>
              <div className="space-y-2">
                {report.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-3 rounded-md border bg-card" data-testid={`recommendation-${i}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                        <p className="text-sm font-medium">{rec.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={rec.priority === "high" ? "default" : "secondary"} className="text-xs">{rec.priority}</Badge>
                        <Badge variant="outline" className="text-xs">Effort: {rec.effort}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function SearchConsolePage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();
  const [tab, setTab] = useState("queries");
  const [searchFilter, setSearchFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showStrategy, setShowStrategy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const { data: strategies } = useQuery<StrategyReport[]>({
    queryKey: ["/api/projects", currentProject?.id, "search-console", "strategies"],
    enabled: !!currentProject,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/projects/${currentProject!.id}/search-console/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (result) => {
      toast({ title: "CSV imported", description: `${result.count} keywords loaded successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "search-console"] });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const strategyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/search-console/strategy`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Strategy generated", description: "AI has analyzed your keywords and created a strategy report" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "search-console", "strategies"] });
      setShowStrategy(true);
    },
    onError: (err: Error) => {
      toast({ title: "Strategy generation failed", description: err.message, variant: "destructive" });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/projects/${currentProject!.id}/search-console/keywords`);
    },
    onSuccess: () => {
      toast({ title: "Data cleared" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "search-console"] });
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      e.target.value = "";
    }
  }, [uploadMutation]);

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground" data-testid="text-no-project">No project selected.</p>
      </div>
    );
  }

  const allQueries = data?.queries || [];

  const filteredByType = (() => {
    switch (activeFilter) {
      case "quick-wins":
        return allQueries.filter(q => q.position >= 4 && q.position <= 15);
      case "content-gaps":
        return allQueries.filter(q => q.impressions > 50 && q.clicks === 0);
      case "low-ctr":
        return allQueries.filter(q => q.position <= 10 && q.ctr < 3);
      default:
        return allQueries;
    }
  })();

  const filteredQueries = filteredByType.filter(q =>
    q.query.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const filteredPages = (data?.pages || []).filter(p =>
    p.page.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const quickWinCount = allQueries.filter(q => q.position >= 4 && q.position <= 15).length;
  const contentGapCount = allQueries.filter(q => q.impressions > 50 && q.clicks === 0).length;
  const lowCtrCount = allQueries.filter(q => q.position <= 10 && q.ctr < 3).length;

  const hasData = data?.connected;

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Search Console"
        icon={Search}
        {...headerProps}
        exportData={data}
        exportFilename="search-console"
      />

      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.tsv,.txt"
          className="hidden"
          data-testid="input-csv-upload"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          data-testid="button-upload-csv"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload GSC CSV
        </Button>

        {hasData && (
          <>
            <Button
              variant="outline"
              onClick={() => strategyMutation.mutate()}
              disabled={strategyMutation.isPending}
              data-testid="button-generate-strategy"
            >
              {strategyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate AI Strategy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              data-testid="button-clear-data"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Data
            </Button>
          </>
        )}

        {strategies && strategies.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStrategy(!showStrategy)}
            data-testid="button-toggle-strategy"
          >
            <FileBarChart className="h-4 w-4 mr-1" />
            {showStrategy ? "Hide" : "Show"} Strategy ({strategies.length})
          </Button>
        )}
      </div>

      {!hasData && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-data-title">Import Your Search Console Data</h3>
            <p className="text-sm text-muted-foreground max-w-md text-center mb-6">
              Upload a CSV export from Google Search Console to analyze your keyword performance,
              find quick wins, identify content gaps, and get AI-powered SEO strategy recommendations.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground max-w-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">Step 1:</span>
                <span>Go to Google Search Console → Performance → Export → CSV</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">Step 2:</span>
                <span>Click "Upload GSC CSV" above and select the exported file</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">Step 3:</span>
                <span>Use the smart filters and generate an AI SEO strategy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showStrategy && strategies && strategies.length > 0 && (
        <div className="space-y-4">
          {strategies.map(report => (
            <StrategyReportView key={report.id} report={report} />
          ))}
        </div>
      )}

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
      ) : hasData ? (
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
            <CardContent className="p-0">
              <Tabs value={tab} onValueChange={setTab}>
                <div className="px-4 pt-4 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <TabsList>
                      <TabsTrigger value="queries" data-testid="tab-queries">
                        <Search className="h-3.5 w-3.5 mr-1.5" />
                        Keywords
                      </TabsTrigger>
                      <TabsTrigger value="pages" data-testid="tab-pages">
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        Pages
                      </TabsTrigger>
                    </TabsList>
                    <Input
                      placeholder="Search keywords..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-52"
                      data-testid="input-filter"
                    />
                  </div>

                  {tab === "queries" && (
                    <div className="flex items-center gap-2 flex-wrap pb-2">
                      <Button
                        variant={activeFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("all")}
                        data-testid="filter-all"
                      >
                        All Keywords
                        <Badge variant="secondary" className="ml-1.5 text-xs">{allQueries.length}</Badge>
                      </Button>
                      <Button
                        variant={activeFilter === "quick-wins" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("quick-wins")}
                        data-testid="filter-quick-wins"
                      >
                        <Trophy className="h-3.5 w-3.5 mr-1" />
                        Quick Wins (Pos 4-15)
                        <Badge variant="secondary" className="ml-1.5 text-xs">{quickWinCount}</Badge>
                      </Button>
                      <Button
                        variant={activeFilter === "content-gaps" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("content-gaps")}
                        data-testid="filter-content-gaps"
                      >
                        <Target className="h-3.5 w-3.5 mr-1" />
                        Content Gaps
                        <Badge variant="secondary" className="ml-1.5 text-xs">{contentGapCount}</Badge>
                      </Button>
                      <Button
                        variant={activeFilter === "low-ctr" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("low-ctr")}
                        data-testid="filter-low-ctr"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        High Rank, Low CTR
                        <Badge variant="secondary" className="ml-1.5 text-xs">{lowCtrCount}</Badge>
                      </Button>
                    </div>
                  )}
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
                          <th className="p-3 font-medium text-muted-foreground">Page</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Clicks</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Impressions</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">CTR</th>
                          <th className="p-3 pr-4 font-medium text-muted-foreground text-right">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQueries.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                              {activeFilter !== "all"
                                ? `No keywords matching "${activeFilter}" filter`
                                : "No keyword data available"
                              }
                            </td>
                          </tr>
                        ) : (
                          filteredQueries.slice(0, 100).map((q, i) => (
                            <tr key={`${q.query}-${i}`} className="border-b last:border-0 hover:bg-muted/50" data-testid={`row-query-${i}`}>
                              <td className="p-3 pl-4 text-muted-foreground">{i + 1}</td>
                              <td className="p-3 font-medium">{q.query}</td>
                              <td className="p-3 text-muted-foreground truncate max-w-[200px]" title={q.page}>
                                {q.page ? (
                                  <a href={q.page} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                                    {q.page.replace(/^https?:\/\/[^/]+/, "")}
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                ) : "—"}
                              </td>
                              <td className="p-3 text-right">{formatNumber(q.clicks)}</td>
                              <td className="p-3 text-right">{formatNumber(q.impressions)}</td>
                              <td className="p-3 text-right">{q.ctr.toFixed(1)}%</td>
                              <td className="p-3 pr-4 text-right">{q.position.toFixed(1)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {filteredQueries.length > 100 && (
                      <div className="p-3 text-center text-xs text-muted-foreground border-t">
                        Showing 100 of {filteredQueries.length} keywords
                      </div>
                    )}
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
                            <tr key={p.page} className="border-b last:border-0 hover:bg-muted/50" data-testid={`row-page-${i}`}>
                              <td className="p-3 pl-4 text-muted-foreground">{i + 1}</td>
                              <td className="p-3 font-medium truncate max-w-xs">
                                <a href={p.page} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary">
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
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}