import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  Target,
  Trophy,
  ChevronDown,
  ChevronUp,
  Users,
  Activity,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface StageBreakdown {
  type: string;
  count: number;
  users: number;
}

interface FunnelStage {
  stage: string;
  events: number;
  users: number;
  sessions: number;
  breakdown: StageBreakdown[];
}

interface ParamData {
  [key: string]: { count: number };
}

interface LeadJourneyData {
  funnel: FunnelStage[];
  parameters: {
    discovery: Record<string, ParamData>;
    engagement: Record<string, ParamData>;
    intent: Record<string, ParamData>;
    conversion: Record<string, ParamData>;
  };
  totalEvents: number;
  totalUsers: number;
}

const STAGE_CONFIG = [
  { key: "Discovery", icon: Eye, color: "#3B82F6", bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400", borderClass: "border-blue-500/20" },
  { key: "Engagement", icon: MousePointerClick, color: "#8B5CF6", bgClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400", borderClass: "border-purple-500/20" },
  { key: "Intent", icon: Target, color: "#F59E0B", bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/20" },
  { key: "Conversion", icon: Trophy, color: "#10B981", bgClass: "bg-green-500/10 text-green-600 dark:text-green-400", borderClass: "border-green-500/20" },
];

const EVENT_LABELS: Record<string, { label: string; icon: typeof Eye }> = {
  pageview: { label: "Page View", icon: Eye },
  session_start: { label: "Session Start", icon: Activity },
  first_visit: { label: "First Visit", icon: Users },
  scroll: { label: "Scroll Depth", icon: TrendingUp },
  key_page_view: { label: "Key Page View", icon: FileText },
  cta_click: { label: "CTA Click", icon: MousePointerClick },
  content_interaction: { label: "Content Interaction", icon: FileText },
  click: { label: "Click", icon: MousePointerClick },
  form_start: { label: "Form Start", icon: FileText },
  form_submit: { label: "Form Submit", icon: FileText },
  form_error: { label: "Form Error", icon: AlertCircle },
  phone_click: { label: "Phone Click", icon: Phone },
  email_click: { label: "Email Click", icon: Mail },
  chat_start: { label: "Live Chat Start", icon: MessageCircle },
  chat_lead: { label: "Chat Lead", icon: MessageCircle },
  generate_lead: { label: "Lead Generated", icon: Trophy },
};

const PARAM_LABELS: Record<string, string> = {
  pageType: "Page Type",
  landingPage: "Landing Page",
  trafficSource: "Traffic Source",
  ctaText: "CTA Text",
  ctaPosition: "CTA Position",
  serviceName: "Service Name",
  contentType: "Content Type",
  contentName: "Content Name",
  depth: "Scroll Depth",
  formName: "Form Name",
  formLocation: "Form Location",
  serviceInterest: "Service Interest",
  errorField: "Error Field",
  callDuration: "Call Duration (s)",
  leadType: "Lead Type",
  leadSource: "Lead Source",
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function StageCard({ stage, config, prevUsers }: { stage: FunnelStage; config: typeof STAGE_CONFIG[0]; prevUsers?: number }) {
  const [expanded, setExpanded] = useState(false);
  const dropOffRate = prevUsers && prevUsers > 0 ? ((1 - stage.users / prevUsers) * 100).toFixed(1) : null;
  const conversionRate = prevUsers && prevUsers > 0 ? ((stage.users / prevUsers) * 100).toFixed(1) : null;

  return (
    <Card className={`border ${config.borderClass}`} data-testid={`card-stage-${config.key.toLowerCase()}`}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgClass}`}>
              <config.icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{config.key}</CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">{formatNumber(stage.users)} users</span>
                <span className="text-xs text-muted-foreground">{formatNumber(stage.sessions)} sessions</span>
                <span className="text-xs text-muted-foreground">{formatNumber(stage.events)} events</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {conversionRate && (
              <Badge variant="secondary" className="text-xs">
                {conversionRate}% from prev
              </Badge>
            )}
            {dropOffRate && parseFloat(dropOffRate) > 0 && (
              <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400 border-orange-500/20">
                {dropOffRate}% drop-off
              </Badge>
            )}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {stage.breakdown.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Event Breakdown</h4>
              <div className="space-y-1.5">
                {stage.breakdown.map((b, i) => {
                  const evtConfig = EVENT_LABELS[b.type] || { label: b.type, icon: Activity };
                  const Icon = evtConfig.icon;
                  const pct = stage.events > 0 ? ((b.count / stage.events) * 100).toFixed(1) : "0";
                  return (
                    <div key={b.type} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50" data-testid={`breakdown-${config.key.toLowerCase()}-${i}`}>
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 min-w-0 truncate">{evtConfig.label}</span>
                      <span className="text-xs text-muted-foreground">{b.users} users</span>
                      <span className="text-sm font-medium tabular-nums">{formatNumber(b.count)}</span>
                      <span className="text-xs text-muted-foreground w-12 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function ParameterSection({ title, params, color }: { title: string; params: Record<string, ParamData>; color: string }) {
  const entries = Object.entries(params).filter(([_, data]) => Object.keys(data).length > 0);
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm" style={{ color }}>{title} Parameters</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(([field, data]) => {
            const items = Object.entries(data).sort((a, b) => b[1].count - a[1].count).slice(0, 10);
            const label = PARAM_LABELS[field] || field;
            return (
              <div key={field} className="space-y-1.5" data-testid={`param-${title.toLowerCase()}-${field}`}>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</h5>
                {items.map(([value, d]) => (
                  <div key={value} className="flex items-center justify-between gap-2 text-sm py-1 px-2 rounded hover:bg-muted/50">
                    <span className="truncate min-w-0 flex-1" title={value}>{value}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">{d.count}</Badge>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeadJourneyPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();
  const [showParams, setShowParams] = useState(true);

  const { data, isLoading } = useQuery<LeadJourneyData>({
    queryKey: ["/api/projects", currentProject?.id, "lead-journey", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/lead-journey?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch");
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

  const funnel = data?.funnel || [];
  const chartData = funnel.map((s, i) => ({
    stage: s.stage,
    users: s.users,
    fill: STAGE_CONFIG[i]?.color || "#888",
  }));

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Lead Journey"
        icon={TrendingUp}
        {...headerProps}
        exportData={data}
        exportFilename="lead-journey"
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
            {funnel.map((stage, i) => {
              const cfg = STAGE_CONFIG[i];
              if (!cfg) return null;
              return (
                <Card key={stage.stage} data-testid={`kpi-${cfg.key.toLowerCase()}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <cfg.icon className="h-4 w-4" style={{ color: cfg.color }} />
                      <span className="text-xs text-muted-foreground font-medium">{cfg.key}</span>
                    </div>
                    <p className="text-2xl font-bold">{formatNumber(stage.users)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatNumber(stage.events)} events</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lead Journey Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} width={100} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [formatNumber(value), "Users"]}
                    />
                    <Bar dataKey="users" radius={[0, 6, 6, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {funnel.length >= 2 && (
                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                  {funnel.map((stage, i) => {
                    const cfg = STAGE_CONFIG[i];
                    if (!cfg) return null;
                    const nextStage = funnel[i + 1];
                    const rate = nextStage && stage.users > 0 ? ((nextStage.users / stage.users) * 100).toFixed(1) : null;
                    return (
                      <div key={stage.stage} className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 rounded-md text-xs font-medium ${cfg.bgClass}`}>
                          {cfg.key}: {formatNumber(stage.users)}
                        </div>
                        {rate && (
                          <>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">{rate}%</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {funnel.map((stage, i) => {
              const cfg = STAGE_CONFIG[i];
              if (!cfg) return null;
              const prevUsers = i > 0 ? funnel[i - 1].users : undefined;
              return <StageCard key={stage.stage} stage={stage} config={cfg} prevUsers={prevUsers} />;
            })}
          </div>

          {data?.parameters && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Detailed Parameters</h3>
                <button
                  onClick={() => setShowParams(!showParams)}
                  className="text-sm text-primary hover:underline"
                  data-testid="button-toggle-params"
                >
                  {showParams ? "Hide" : "Show"} Parameters
                </button>
              </div>
              {showParams && (
                <>
                  <ParameterSection title="Discovery" params={data.parameters.discovery} color={STAGE_CONFIG[0].color} />
                  <ParameterSection title="Engagement" params={data.parameters.engagement} color={STAGE_CONFIG[1].color} />
                  <ParameterSection title="Intent" params={data.parameters.intent} color={STAGE_CONFIG[2].color} />
                  <ParameterSection title="Conversion" params={data.parameters.conversion} color={STAGE_CONFIG[3].color} />
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}