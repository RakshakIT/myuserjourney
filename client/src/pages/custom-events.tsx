import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useProject } from "@/lib/project-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CustomEventDefinition } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Sparkles,
  Target,
  ShoppingCart,
  UserPlus,
  Download,
  Trash2,
  TrendingUp,
  BarChart3,
  ArrowRight,
  FileText,
  Globe,
  Eye,
  Filter,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
} from "recharts";

const CHART_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "contains_any", label: "Contains any (comma-separated)" },
  { value: "regex", label: "Matches regex" },
];

const FIELDS = [
  { value: "eventType", label: "Event Type" },
  { value: "page", label: "Page URL" },
  { value: "referrer", label: "Referrer" },
  { value: "device", label: "Device" },
  { value: "browser", label: "Browser" },
  { value: "os", label: "OS" },
  { value: "country", label: "Country" },
  { value: "trafficSource", label: "Traffic Source" },
];

const AI_TEMPLATES = [
  { key: "lead", name: "Lead", icon: Target, color: "#10b981", description: "Auto-detect form submissions as leads" },
  { key: "purchase", name: "Purchase", icon: ShoppingCart, color: "#8b5cf6", description: "Detect purchases on checkout/order pages" },
  { key: "signup", name: "Sign Up", icon: UserPlus, color: "#3b82f6", description: "Detect signups on registration pages" },
  { key: "download", name: "Download", icon: Download, color: "#f59e0b", description: "Detect clicks on download/trial pages" },
];

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "last_90_days", label: "Last 90 days" },
];

interface Rule {
  field: string;
  operator: string;
  value: string;
}

function CreateEventDialog({ projectId, onCreated }: { projectId: string; onCreated: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("custom");
  const [color, setColor] = useState("#3b82f6");
  const [rules, setRules] = useState<Rule[]>([{ field: "eventType", operator: "equals", value: "" }]);

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/projects/${projectId}/custom-events`, {
        name,
        description,
        category,
        color,
        rules,
        isAiBuilt: "false",
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "custom-events"] });
      toast({ title: "Custom event created" });
      setOpen(false);
      setName("");
      setDescription("");
      setRules([{ field: "eventType", operator: "equals", value: "" }]);
      onCreated();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addRule = () => setRules([...rules, { field: "eventType", operator: "equals", value: "" }]);
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));
  const updateRule = (i: number, key: keyof Rule, val: string) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [key]: val };
    setRules(updated);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-custom-event">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Custom Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Newsletter Signup"
              data-testid="input-event-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this event track?"
              data-testid="input-event-description"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-event-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-1 mt-1.5">
                {CHART_COLORS.map((c) => (
                  <button
                    key={c}
                    className={`h-8 w-8 rounded-md border-2 transition-colors ${color === c ? "border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    data-testid={`button-color-${c.replace("#", "")}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Matching Rules</label>
              <Button variant="ghost" size="sm" onClick={addRule} data-testid="button-add-rule">
                <Plus className="h-3 w-3 mr-1" />
                Add Rule
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">All rules must match for an event to be counted (AND logic)</p>
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select value={rule.field} onValueChange={(v) => updateRule(i, "field", v)}>
                    <SelectTrigger className="w-32" data-testid={`select-rule-field-${i}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELDS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={rule.operator} onValueChange={(v) => updateRule(i, "operator", v)}>
                    <SelectTrigger className="w-36" data-testid={`select-rule-operator-${i}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={rule.value}
                    onChange={(e) => updateRule(i, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1"
                    data-testid={`input-rule-value-${i}`}
                  />
                  {rules.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeRule(i)} data-testid={`button-remove-rule-${i}`}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || rules.some(r => !r.value.trim()) || createMutation.isPending}
            data-testid="button-save-custom-event"
          >
            {createMutation.isPending ? "Creating..." : "Create Custom Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConversionAnalysis({ projectId, definition }: { projectId: string; definition: CustomEventDefinition }) {
  const [period, setPeriod] = useState("last_30_days");

  const { data, isLoading } = useQuery<{
    totalSessions: number;
    totalConversions: number;
    overallConversionRate: number;
    pageAnalysis: Array<{ page: string; pageViews: number; conversions: number; conversionRate: number; uniqueConverters: number }>;
    sourceAnalysis: Array<{ source: string; sessions: number; conversions: number; conversionRate: number }>;
    dailyTrend: Array<{ date: string; events: number; conversions: number }>;
  }>({
    queryKey: ["/api/projects", projectId, "custom-events", definition.id, "conversion-analysis", period],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/custom-events/${definition.id}/conversion-analysis?period=${period}`);
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}><CardContent className="p-6"><div className="h-32 animate-pulse bg-muted rounded-md" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: definition.color || "#3b82f6" }} />
          <h3 className="font-semibold">Conversion Analysis: {definition.name}</h3>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40" data-testid="select-conversion-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold" data-testid="text-total-sessions">{data.totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Conversions</p>
            <p className="text-2xl font-bold" style={{ color: definition.color || "#10b981" }} data-testid="text-total-conversions">{data.totalConversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold" data-testid="text-conversion-rate">{data.overallConversionRate}%</p>
          </CardContent>
        </Card>
      </div>

      {data.dailyTrend.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversions" stroke={definition.color || "#10b981"} strokeWidth={2} dot={false} name="Conversions" />
                  <Line type="monotone" dataKey="events" stroke="#94a3b8" strokeWidth={1} dot={false} strokeDasharray="4 4" name="All Events" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Pages Leading to {definition.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.pageAnalysis.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No conversion data yet</p>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {data.pageAnalysis.slice(0, 15).map((p, i) => (
                    <div key={p.page} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40" data-testid={`row-page-conversion-${i}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono truncate">{p.page}</p>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{p.pageViews} views</span>
                          <span className="text-[10px] text-muted-foreground">{p.uniqueConverters} converters</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold" style={{ color: definition.color || "#10b981" }}>{p.conversions}</p>
                        <p className="text-[10px] text-muted-foreground">{p.conversionRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Sources Leading to {definition.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.sourceAnalysis.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No source data yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sourceAnalysis.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="source" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="conversions" fill={definition.color || "#10b981"} name="Conversions" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EventMatches({ projectId, definition }: { projectId: string; definition: CustomEventDefinition }) {
  const [period, setPeriod] = useState("last_30_days");
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery<{
    totalMatches: number;
    events: Array<any>;
  }>({
    queryKey: ["/api/projects", projectId, "custom-events", definition.id, "matches", period],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/custom-events/${definition.id}/matches?period=${period}`);
      return res.json();
    },
    enabled: expanded,
  });

  return (
    <Card>
      <button
        className="w-full text-left p-4 flex items-center justify-between gap-2 hover-elevate rounded-md"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-expand-matches-${definition.id}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: definition.color || "#3b82f6" }} />
          <div className="min-w-0">
            <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
              {definition.name}
              <Badge variant="secondary" className="text-[10px]">
                {definition.category}
              </Badge>
              {definition.isAiBuilt === "true" && (
                <Badge variant="outline" className="text-[10px]">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  AI
                </Badge>
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">{definition.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {data && <span className="text-sm font-semibold" style={{ color: definition.color || "#3b82f6" }}>{data.totalMatches} matches</span>}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Rules:</span>
              {(definition.rules as Rule[]).map((r, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {r.field} {r.operator} "{r.value}"
                </Badge>
              ))}
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36" data-testid={`select-match-period-${definition.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="h-20 animate-pulse bg-muted rounded-md" />
          ) : data && data.events.length > 0 ? (
            <ScrollArea className="h-52">
              <div className="space-y-1">
                {data.events.slice(0, 50).map((evt: any, i: number) => (
                  <div key={evt.id || i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 text-xs" data-testid={`row-matched-event-${i}`}>
                    <span className="text-muted-foreground shrink-0 w-28">{new Date(evt.timestamp).toLocaleString()}</span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{evt.eventType}</Badge>
                    <span className="truncate flex-1 font-mono text-muted-foreground">{evt.page || "/"}</span>
                    <span className="text-muted-foreground shrink-0">{evt.device}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No matching events in this period</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function CustomEventsPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [selectedDef, setSelectedDef] = useState<CustomEventDefinition | null>(null);

  const { data: definitions, isLoading } = useQuery<CustomEventDefinition[]>({
    queryKey: ["/api/projects", currentProject?.id, "custom-events"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/custom-events`);
      return res.json();
    },
    enabled: !!currentProject,
  });

  const templateMutation = useMutation({
    mutationFn: async (template: string) => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/custom-events/ai-templates`, { template });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "custom-events"] });
      toast({ title: `${data.name} event created`, description: "AI-built event template is now active" });
    },
    onError: (err: any) => {
      toast({ title: "Already exists or error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (defId: string) => {
      await apiRequest("DELETE", `/api/projects/${currentProject!.id}/custom-events/${defId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "custom-events"] });
      if (selectedDef) setSelectedDef(null);
      toast({ title: "Event definition deleted" });
    },
  });

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a project to manage custom events</p>
      </div>
    );
  }

  const leadDefs = definitions?.filter(d => d.category === "lead") || [];
  const purchaseDefs = definitions?.filter(d => d.category === "purchase") || [];
  const customDefs = definitions?.filter(d => d.category === "custom") || [];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between gap-3 flex-wrap sticky top-0 z-40 bg-background">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Custom Events
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define custom events, use AI templates for leads and purchases, and analyze conversion paths
          </p>
        </div>
        <CreateEventDialog projectId={currentProject.id} onCreated={() => {}} />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Built Event Templates
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Instantly create smart events that auto-detect leads, purchases, signups, and downloads from your tracked data
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AI_TEMPLATES.map((tmpl) => {
              const existing = definitions?.find(d => d.name === tmpl.name && d.isAiBuilt === "true");
              return (
                <Card key={tmpl.key} className={existing ? "opacity-70" : "hover-elevate"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: tmpl.color + "20" }}>
                        <tmpl.icon className="h-4 w-4" style={{ color: tmpl.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{tmpl.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{tmpl.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={existing ? "outline" : "default"}
                      size="sm"
                      className="w-full mt-3"
                      disabled={!!existing || templateMutation.isPending}
                      onClick={() => templateMutation.mutate(tmpl.key)}
                      data-testid={`button-template-${tmpl.key}`}
                    >
                      {existing ? "Active" : "Enable"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {definitions && definitions.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Your Event Definitions ({definitions.length})
            </h2>

            {leadDefs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Lead Events</p>
                <div className="space-y-2">
                  {leadDefs.map((def) => (
                    <div key={def.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <EventMatches projectId={currentProject.id} definition={def} />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedDef(selectedDef?.id === def.id ? null : def)}
                          data-testid={`button-analyze-${def.id}`}
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(def.id)}
                          data-testid={`button-delete-${def.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {purchaseDefs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Purchase Events</p>
                <div className="space-y-2">
                  {purchaseDefs.map((def) => (
                    <div key={def.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <EventMatches projectId={currentProject.id} definition={def} />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedDef(selectedDef?.id === def.id ? null : def)}
                          data-testid={`button-analyze-${def.id}`}
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(def.id)}
                          data-testid={`button-delete-${def.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {customDefs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Custom Events</p>
                <div className="space-y-2">
                  {customDefs.map((def) => (
                    <div key={def.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <EventMatches projectId={currentProject.id} definition={def} />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedDef(selectedDef?.id === def.id ? null : def)}
                          data-testid={`button-analyze-${def.id}`}
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(def.id)}
                          data-testid={`button-delete-${def.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && (!definitions || definitions.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <Zap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">No custom events yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create custom events to track specific user actions, or use AI templates to auto-detect leads and purchases
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => templateMutation.mutate("lead")} disabled={templateMutation.isPending} data-testid="button-quick-lead">
                  <Target className="h-4 w-4 mr-2" />
                  Enable Lead Detection
                </Button>
                <Button variant="outline" onClick={() => templateMutation.mutate("purchase")} disabled={templateMutation.isPending} data-testid="button-quick-purchase">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Enable Purchase Detection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedDef && (
          <ConversionAnalysis projectId={currentProject.id} definition={selectedDef} />
        )}
      </div>
    </div>
  );
}
