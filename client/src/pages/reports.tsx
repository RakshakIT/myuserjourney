import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useProject } from "@/lib/project-context";
import { AiApiNotice } from "@/components/ai-api-notice";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Plus,
  FileBarChart,
  Trash2,
  BarChart3,
  TrendingUp,
  Globe,
  PieChart as PieChartIcon,
  Table,
  Sparkles,
  Send,
  Wand2,
  ArrowRight,
  Calendar,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Image,
  Upload,
  X,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDateRange } from "@/hooks/use-date-range";
import { DateRangePicker } from "@/components/date-range-picker";
import type { CustomReport } from "@shared/schema";

const CHART_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(172, 66%, 40%)",
  "hsl(262, 52%, 47%)",
  "hsl(25, 95%, 53%)",
  "hsl(338, 72%, 51%)",
  "hsl(142, 55%, 40%)",
  "hsl(45, 93%, 47%)",
  "hsl(199, 89%, 48%)",
];

const CHART_GRADIENT_PAIRS = [
  { from: "hsl(221, 83%, 53%)", to: "hsl(221, 83%, 70%)" },
  { from: "hsl(172, 66%, 40%)", to: "hsl(172, 66%, 60%)" },
  { from: "hsl(262, 52%, 47%)", to: "hsl(262, 52%, 65%)" },
  { from: "hsl(25, 95%, 53%)", to: "hsl(25, 95%, 70%)" },
  { from: "hsl(338, 72%, 51%)", to: "hsl(338, 72%, 68%)" },
  { from: "hsl(142, 55%, 40%)", to: "hsl(142, 55%, 60%)" },
];

const METRICS = [
  { value: "pageViews", label: "Page Views" },
  { value: "clicks", label: "Clicks" },
  { value: "events", label: "Total Events" },
  { value: "visitors", label: "Unique Visitors" },
  { value: "sessions", label: "Sessions" },
  { value: "bounceRate", label: "Bounce Rate" },
  { value: "scrolls", label: "Scroll Events" },
  { value: "formSubmits", label: "Form Submissions" },
  { value: "rageClicks", label: "Rage Clicks" },
  { value: "bots", label: "Bot Events" },
];

const DIMENSIONS = [
  { value: "date", label: "Date" },
  { value: "hour", label: "Hour" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "page", label: "Page URL" },
  { value: "device", label: "Device" },
  { value: "browser", label: "Browser" },
  { value: "country", label: "Country" },
  { value: "city", label: "City" },
  { value: "referrer", label: "Referrer" },
  { value: "os", label: "Operating System" },
  { value: "eventType", label: "Event Type" },
];

const CHART_TYPES = [
  { value: "line", label: "Line Chart", icon: TrendingUp },
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "area", label: "Area Chart", icon: TrendingUp },
  { value: "pie", label: "Pie Chart", icon: PieChartIcon },
  { value: "table", label: "Data Table", icon: Table },
];

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_90_days", label: "Last 90 Days" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" },
];

const AI_SUGGESTIONS = [
  "Show me page views trend over the last 7 days",
  "Device breakdown pie chart for this month",
  "Top pages by visitors, exclude bots",
  "Weekly sessions and bounce rate trend",
  "Traffic sources distribution this year",
  "Hourly clicks for today as an area chart",
];

interface ReportData {
  report: {
    id: string;
    name: string;
    chartType: string;
    metrics: string[];
    dimensions: string[];
    dateRange: string;
  };
  totalEvents: number;
  rows: { dimension: string; [key: string]: any }[];
}

function ReportChart({ data, chartType, metrics, compact }: { data: ReportData; chartType: string; metrics: string[]; compact?: boolean }) {
  const rows = data.rows;
  const height = compact ? 220 : 300;

  if (!rows || rows.length === 0) {
    return (
      <div className={`flex items-center justify-center text-sm text-muted-foreground`} style={{ height }}>
        No data available yet
      </div>
    );
  }

  if (chartType === "table") {
    return (
      <div className="overflow-auto" style={{ maxHeight: height + 60 }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b">
              <th className="text-left p-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Dimension</th>
              {metrics.map(m => (
                <th key={m} className="text-right p-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {METRICS.find(mt => mt.value === m)?.label || m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-0 hover-elevate">
                <td className="p-2.5 truncate max-w-[200px] font-medium">{row.dimension}</td>
                {metrics.map(m => (
                  <td key={m} className="text-right p-2.5 tabular-nums">
                    {(row[m] ?? 0).toLocaleString()}{m === "bounceRate" ? "%" : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (chartType === "pie") {
    const metric = metrics[0] || "pageViews";
    const pieData = rows.slice(0, 8).map(r => ({ name: r.dimension, value: r[metric] || 0 }));
    return (
      <div>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={compact ? 40 : 60}
              outerRadius={compact ? 70 : 100}
              dataKey="value"
              nameKey="name"
              paddingAngle={3}
              strokeWidth={2}
              stroke="hsl(var(--card))"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                fontSize: "12px",
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-1 justify-center px-2">
          {pieData.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">{d.name}</span>
              <span className="text-xs font-medium tabular-nums">{d.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ChartComponent = chartType === "bar" ? BarChart : chartType === "area" ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={rows}>
        <defs>
          {metrics.map((_, i) => (
            <linearGradient key={`gradient-${i}`} id={`colorGradient${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_GRADIENT_PAIRS[i % CHART_GRADIENT_PAIRS.length].from} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_GRADIENT_PAIRS[i % CHART_GRADIENT_PAIRS.length].to} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis
          dataKey="dimension"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          stroke="hsl(var(--border))"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          stroke="hsl(var(--border))"
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            fontSize: "12px",
            backgroundColor: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        {metrics.length > 1 && <Legend wrapperStyle={{ fontSize: "11px" }} />}
        {metrics.map((m, i) => {
          const label = METRICS.find(mt => mt.value === m)?.label || m;
          const color = CHART_COLORS[i % CHART_COLORS.length];
          if (chartType === "bar") {
            return <Bar key={m} dataKey={m} fill={color} radius={[4, 4, 0, 0]} name={label} />;
          }
          if (chartType === "area") {
            return (
              <Area
                key={m}
                type="monotone"
                dataKey={m}
                stroke={color}
                fill={`url(#colorGradient${i})`}
                strokeWidth={2}
                name={label}
              />
            );
          }
          return (
            <Line
              key={m}
              type="monotone"
              dataKey={m}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
              name={label}
            />
          );
        })}
      </ChartComponent>
    </ResponsiveContainer>
  );
}

function ReportCard({ report, projectId, colorIndex, dateQueryParams }: { report: CustomReport; projectId: string; colorIndex: number; dateQueryParams?: string }) {
  const { toast } = useToast();
  const [showInsights, setShowInsights] = useState(false);

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/projects", projectId, "reports", report.id, "data", dateQueryParams],
    queryFn: async () => {
      const url = dateQueryParams
        ? `/api/projects/${projectId}/reports/${report.id}/data?${dateQueryParams}`
        : `/api/projects/${projectId}/reports/${report.id}/data`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Failed to fetch");
      return resp.json();
    },
  });

  const insightsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/reports/${report.id}/ai-insights`, {
        prompt: `Analyze this report: ${report.name}. Metrics: ${report.metrics.join(", ")}. Dimension: ${report.dimensions.join(", ")}. Chart: ${report.chartType}.`,
      });
      return res.json();
    },
    onSuccess: (data: { insights: string }) => {
      setShowInsights(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/projects/${projectId}/reports/${report.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "reports"] });
      toast({ title: "Report deleted" });
    },
  });

  const chartTypeInfo = CHART_TYPES.find(ct => ct.value === report.chartType);
  const dateRangeInfo = DATE_RANGES.find(dr => dr.value === report.dateRange);
  const ChartIcon = chartTypeInfo?.icon || BarChart3;
  const accentColor = CHART_COLORS[colorIndex % CHART_COLORS.length];
  const isAiGenerated = report.description?.startsWith('AI-generated:');

  return (
    <Card className="overflow-visible group" data-testid={`card-report-${report.id}`}>
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              <ChartIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate" data-testid={`text-report-name-${report.id}`}>
                {report.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">
                  <Calendar className="h-2.5 w-2.5 mr-1" />
                  {dateRangeInfo?.label || report.dateRange}
                </Badge>
                {isAiGenerated && (
                  <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              {report.description && !isAiGenerated && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{report.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ visibility: "visible" }}
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            data-testid={`button-delete-report-${report.id}`}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {report.metrics.map(m => (
            <span key={m} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {METRICS.find(mt => mt.value === m)?.label || m}
            </span>
          ))}
          <span className="text-[10px] text-muted-foreground">
            by {DIMENSIONS.find(d => d.value === report.dimensions[0])?.label || report.dimensions[0]}
          </span>
        </div>
      </div>

      <div className="px-4 pb-3">
        {isLoading ? (
          <Skeleton className="h-[220px] rounded-md" />
        ) : reportData ? (
          <ReportChart data={reportData} chartType={report.chartType} metrics={report.metrics} compact />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            Failed to load report data
          </div>
        )}
      </div>

      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => insightsMutation.mutate()}
          disabled={insightsMutation.isPending}
          data-testid={`button-ai-insights-${report.id}`}
        >
          {insightsMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Lightbulb className="h-3 w-3 mr-1" />
          )}
          AI Insights
        </Button>
      </div>

      {showInsights && insightsMutation.data && (
        <div className="px-4 pb-4">
          <div className="border rounded-md p-3 bg-muted/50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">AI Insights</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowInsights(false)} data-testid={`button-close-insights-${report.id}`}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground whitespace-pre-wrap">
              {(insightsMutation.data as any).insights}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function AiReportChat({ projectId, idPrefix = "" }: { projectId: string; idPrefix?: string }) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string; reportId?: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateMutation = useMutation({
    mutationFn: async (userPrompt: string) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/ai-generate-report`, { prompt: userPrompt });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "reports"] });
      setMessages(prev => [...prev, {
        role: "ai",
        content: `Created "${data.name}" - a ${CHART_TYPES.find(ct => ct.value === data.chartType)?.label || data.chartType} showing ${data.metrics.map((m: string) => METRICS.find(mt => mt.value === m)?.label || m).join(", ")} grouped by ${DIMENSIONS.find(d => d.value === data.dimensions[0])?.label || data.dimensions[0]}. Check it out in the gallery!`,
        reportId: data.id,
      }]);
    },
    onError: (err: Error) => {
      setMessages(prev => [...prev, { role: "ai", content: `Sorry, I couldn't create that report. ${err.message}` }]);
    },
  });

  const handleSend = (text?: string) => {
    const msg = text || prompt.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setPrompt("");
    generateMutation.mutate(msg);
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Report Builder</h3>
            <p className="text-xs text-muted-foreground">Describe the report you want</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "200px" }}>
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Try one of these prompts or write your own:
            </p>
            <div className="space-y-2">
              {AI_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="w-full text-left text-xs p-2.5 rounded-md border hover-elevate flex items-center gap-2 group"
                  data-testid={`button-ai-suggestion-${idPrefix}-${i}`}
                >
                  <Wand2 className="h-3 w-3 text-primary shrink-0" />
                  <span className="flex-1">{s}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" style={{ visibility: "visible" }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
                data-testid={`text-ai-message-${idPrefix}-${i}`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {generateMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="e.g., Show page views by country as a pie chart..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 text-xs"
            data-testid={`input-ai-report-prompt-${idPrefix}`}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!prompt.trim() || generateMutation.isPending}
            data-testid={`button-send-ai-report-${idPrefix}`}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}

function CreateReportDialog({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["pageViews"]);
  const [dimension, setDimension] = useState("date");
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [excludeBots, setExcludeBots] = useState(false);
  const [excludeInternal, setExcludeInternal] = useState(false);
  const [filterEventType, setFilterEventType] = useState("");
  const [filterDevice, setFilterDevice] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterPage, setFilterPage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/projects/${projectId}/reports`, {
        name,
        description: description || null,
        metrics: selectedMetrics,
        dimensions: [dimension],
        chartType,
        dateRange,
        filters: {
          excludeBots: excludeBots || undefined,
          excludeInternal: excludeInternal || undefined,
          eventType: filterEventType || undefined,
          device: filterDevice || undefined,
          country: filterCountry || undefined,
          page: filterPage || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "reports"] });
      toast({ title: "Report created successfully" });
      setOpen(false);
      setName(""); setDescription(""); setSelectedMetrics(["pageViews"]);
      setDimension("date"); setChartType("line"); setDateRange("last_30_days");
      setExcludeBots(false); setExcludeInternal(false);
      setFilterEventType(""); setFilterDevice(""); setFilterCountry(""); setFilterPage("");
      setShowFilters(false);
    },
  });

  function toggleMetric(m: string) {
    setSelectedMetrics(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-create-report">
          <Plus className="h-4 w-4 mr-2" />
          Manual Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            Create Custom Report
          </DialogTitle>
          <DialogDescription>
            Configure metrics, dimensions, chart type, and filters to build a custom analytics report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Report Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Traffic by Device"
              data-testid="input-report-name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="resize-none"
              data-testid="input-report-description"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Metrics</label>
            <div className="flex flex-wrap gap-2">
              {METRICS.map(m => (
                <Badge
                  key={m.value}
                  variant={selectedMetrics.includes(m.value) ? "default" : "outline"}
                  className="cursor-pointer toggle-elevate"
                  onClick={() => toggleMetric(m.value)}
                  data-testid={`badge-metric-${m.value}`}
                >
                  {m.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                <Layers className="h-3 w-3 inline mr-1" />
                Group By
              </label>
              <Select value={dimension} onValueChange={setDimension}>
                <SelectTrigger data-testid="select-dimension">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSIONS.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                <BarChart3 className="h-3 w-3 inline mr-1" />
                Chart Type
              </label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger data-testid="select-chart-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map(ct => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                <Calendar className="h-3 w-3 inline mr-1" />
                Date Range
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger data-testid="select-date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map(dr => (
                    <SelectItem key={dr.value} value={dr.value}>{dr.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs text-muted-foreground flex items-center gap-1.5 hover-elevate px-2 py-1 rounded"
              data-testid="button-toggle-report-filters"
            >
              <Filter className="h-3 w-3" />
              {showFilters ? "Hide Filters" : "Add Filters"}
            </button>

            {showFilters && (
              <div className="mt-2 space-y-2 p-3 rounded-md bg-muted/50">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeBots}
                      onChange={(e) => setExcludeBots(e.target.checked)}
                      className="rounded"
                      data-testid="checkbox-exclude-bots"
                    />
                    Exclude bots
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeInternal}
                      onChange={(e) => setExcludeInternal(e.target.checked)}
                      className="rounded"
                      data-testid="checkbox-exclude-internal"
                    />
                    Exclude internal
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Event Type</label>
                    <Input value={filterEventType} onChange={(e) => setFilterEventType(e.target.value)} placeholder="e.g., pageview" data-testid="input-filter-event-type" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Device</label>
                    <Input value={filterDevice} onChange={(e) => setFilterDevice(e.target.value)} placeholder="e.g., Desktop" data-testid="input-filter-device" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Country</label>
                    <Input value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} placeholder="e.g., United Kingdom" data-testid="input-filter-country" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Page</label>
                    <Input value={filterPage} onChange={(e) => setFilterPage(e.target.value)} placeholder="e.g., /blog" data-testid="input-filter-page" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => createMutation.mutate()}
            disabled={!name || selectedMetrics.length === 0 || createMutation.isPending}
            data-testid="button-save-report"
          >
            {createMutation.isPending ? "Creating..." : "Create Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LogoUpload({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: logo, isLoading: logoLoading } = useQuery<{ id: string; logoData: string; logoName: string } | null>({
    queryKey: ["/api/projects", projectId, "logo"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/logo`);
      if (!res.ok) throw new Error("Failed to fetch logo");
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const reader = new FileReader();
      return new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            await apiRequest("PUT", `/api/projects/${projectId}/logo`, {
              logoData: reader.result as string,
              logoName: file.name,
            });
            resolve();
          } catch (err: any) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "logo"] });
      toast({ title: "Logo uploaded" });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/projects/${projectId}/logo`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "logo"] });
      toast({ title: "Logo removed" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-logo-file"
      />
      {logo?.logoData ? (
        <div className="flex items-center gap-2">
          <img
            src={logo.logoData}
            alt="Project logo"
            className="h-8 w-8 rounded-md object-contain border"
            data-testid="img-project-logo"
          />
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">{logo.logoName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            data-testid="button-delete-logo"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          data-testid="button-upload-logo"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Upload className="h-3 w-3 mr-1" />
          )}
          Upload Logo
        </Button>
      )}
    </div>
  );
}

export default function Reports() {
  const { currentProject } = useProject();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { queryParams, headerProps } = useDateRange();

  const { data: reports, isLoading } = useQuery<CustomReport[]>({
    queryKey: ["/api/projects", currentProject?.id, "reports"],
    queryFn: async () => {
      const resp = await fetch(`/api/projects/${currentProject?.id}/reports`);
      if (!resp.ok) throw new Error("Failed to fetch");
      return resp.json();
    },
    enabled: !!currentProject,
  });

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Globe className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project from the sidebar to create and view custom reports.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden">
      <div className="p-6 pb-0 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-reports-title">Custom Reports</h1>
            <p className="text-sm text-muted-foreground">
              Build reports with AI or configure them manually
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DateRangePicker {...headerProps} />
            <LogoUpload projectId={currentProject.id} />
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-none rounded-l-md ${viewMode === "grid" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-none rounded-r-md ${viewMode === "list" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <CreateReportDialog projectId={currentProject.id} />
          </div>
        </div>
        <AiApiNotice />
      </div>

      <div className="flex-1 overflow-hidden p-6 pt-4">
        <div className="flex gap-4 h-full">
          <div className="w-80 shrink-0 hidden lg:flex flex-col" data-testid="panel-ai-report-desktop">
            <AiReportChat projectId={currentProject.id} idPrefix="desktop" />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-w-0">
            <div className="lg:hidden mb-4" data-testid="panel-ai-report-mobile">
              <AiReportChat projectId={currentProject.id} idPrefix="mobile" />
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : "space-y-4"}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[320px] rounded-md" />
                  ))}
                </div>
              ) : reports && reports.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-4 pb-4" : "space-y-4 pb-4"}>
                  {reports.map((report, i) => (
                    <ReportCard key={report.id} report={report} projectId={currentProject.id} colorIndex={i} dateQueryParams={queryParams} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <FileBarChart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">No reports yet</h3>
                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                      Use the AI builder on the left to describe a report in plain English,
                      or create one manually with full control over every setting.
                    </p>
                    <div className="flex items-center gap-2">
                      <CreateReportDialog projectId={currentProject.id} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
