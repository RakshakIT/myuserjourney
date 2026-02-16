import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import { AiApiNotice } from "@/components/ai-api-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Gauge,
  Snail,
  GitFork,
  Compass,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

interface SlowPage {
  page: string;
  loadTime: number;
  benchmark: number;
  severity: string;
  suggestion: string;
}

interface FlowIssue {
  flow: string;
  severity: string;
  description: string;
  dropOffRate: number;
  suggestion: string;
}

interface NavigationIssue {
  issue: string;
  severity: string;
  location: string;
  description: string;
  suggestion: string;
}

interface Recommendation {
  category: string;
  action: string;
  priority: string;
  effort: string;
}

interface UxAudit {
  id: string;
  projectId: string;
  score: number;
  slowPages: SlowPage[];
  flowIssues: FlowIssue[];
  navigationIssues: NavigationIssue[];
  recommendations: Recommendation[];
  summary: string | null;
  createdAt: string;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant = severity === "high" ? "destructive" : severity === "medium" ? "default" : "secondary";
  return <Badge variant={variant}>{severity}</Badge>;
}

function EffortBadge({ effort }: { effort: string }) {
  if (effort === "low") {
    return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{effort}</Badge>;
  }
  if (effort === "high") {
    return <Badge variant="destructive">{effort}</Badge>;
  }
  return <Badge variant="default">{effort}</Badge>;
}

function ScoreDisplay({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-orange-500" : "text-red-500";
  const ringColor = score >= 80 ? "stroke-green-500" : score >= 50 ? "stroke-orange-500" : "stroke-red-500";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-muted"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${color}`} data-testid="text-ux-score">{score}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">out of 100</p>
    </div>
  );
}

export default function UxAuditorPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [selectedAudit, setSelectedAudit] = useState<UxAudit | null>(null);

  const auditsQuery = useQuery<UxAudit[]>({
    queryKey: ["/api/projects", currentProject?.id, "ux-audits"],
    enabled: !!currentProject?.id,
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/ux-audits`);
      if (!res.ok) throw new Error("Failed to fetch audits");
      return res.json();
    },
  });

  const runAuditMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/ux-audits/run`);
      return res.json();
    },
    onSuccess: (data: UxAudit) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "ux-audits"] });
      setSelectedAudit(data);
      toast({ title: "Audit complete", description: "UX audit has been generated." });
    },
    onError: (err: Error) => {
      toast({ title: "Audit failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${currentProject!.id}/ux-audits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "ux-audits"] });
      if (selectedAudit) setSelectedAudit(null);
      toast({ title: "Audit deleted" });
    },
  });

  if (!currentProject) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground" data-testid="text-no-project">Select a project to run UX audits</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const audits = auditsQuery.data || [];
  const active = selectedAudit || audits[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">AI UX Auditor</h1>
          <p className="text-sm text-muted-foreground mt-1">Automatically detect slow pages, bad UX flows, and confusing navigation</p>
        </div>
        <Button
          onClick={() => runAuditMutation.mutate()}
          disabled={runAuditMutation.isPending}
          data-testid="button-run-audit"
        >
          {runAuditMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Run Audit
        </Button>
      </div>

      <AiApiNotice />

      {audits.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {audits.map(a => (
            <Button
              key={a.id}
              variant={active?.id === a.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAudit(a)}
              data-testid={`button-audit-${a.id}`}
            >
              Score: {a.score} - {new Date(a.createdAt).toLocaleDateString()}
            </Button>
          ))}
        </div>
      )}

      {active && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-muted-foreground">Audited {new Date(active.createdAt).toLocaleString()}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate(active.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-audit"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>

          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-6">
              <ScoreDisplay score={active.score} />
              {active.summary && (
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    Summary
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-summary">{active.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="slow-pages">
            <TabsList>
              <TabsTrigger value="slow-pages" data-testid="tab-slow-pages">
                <Snail className="h-4 w-4 mr-1" /> Slow Pages
              </TabsTrigger>
              <TabsTrigger value="flow-issues" data-testid="tab-flow-issues">
                <GitFork className="h-4 w-4 mr-1" /> Flow Issues
              </TabsTrigger>
              <TabsTrigger value="navigation" data-testid="tab-navigation">
                <Compass className="h-4 w-4 mr-1" /> Navigation Issues
              </TabsTrigger>
              <TabsTrigger value="recommendations" data-testid="tab-recommendations">
                <Lightbulb className="h-4 w-4 mr-1" /> Recommendations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="slow-pages" className="mt-4">
              <div className="grid gap-3">
                {(active.slowPages || []).map((sp, i) => (
                  <Card key={i}>
                    <CardContent className="py-3 space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Snail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="font-medium text-sm" data-testid={`text-slow-page-${i}`}>{sp.page}</p>
                        </div>
                        <SeverityBadge severity={sp.severity || "medium"} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>Load Time: {sp.loadTime}s</span>
                          <span>Benchmark: {sp.benchmark}s</span>
                        </div>
                        <div className="flex gap-1 h-2 rounded-sm overflow-hidden bg-muted">
                          <div
                            className="bg-red-500 rounded-sm"
                            style={{ width: `${Math.min((sp.loadTime / Math.max(sp.loadTime, sp.benchmark)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex gap-1 h-2 rounded-sm overflow-hidden bg-muted">
                          <div
                            className="bg-green-500 rounded-sm"
                            style={{ width: `${Math.min((sp.benchmark / Math.max(sp.loadTime, sp.benchmark)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{sp.suggestion}</p>
                    </CardContent>
                  </Card>
                ))}
                {(!active.slowPages || active.slowPages.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No slow pages detected</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="flow-issues" className="mt-4">
              <div className="grid gap-3">
                {(active.flowIssues || []).map((fi, i) => (
                  <Card key={i}>
                    <CardContent className="py-3 space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <GitFork className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="font-medium text-sm" data-testid={`text-flow-issue-${i}`}>{fi.flow}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge severity={fi.severity || "medium"} />
                          <Badge variant="outline">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {fi.dropOffRate}% drop-off
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{fi.description}</p>
                      <p className="text-xs text-muted-foreground">{fi.suggestion}</p>
                    </CardContent>
                  </Card>
                ))}
                {(!active.flowIssues || active.flowIssues.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No flow issues detected</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="navigation" className="mt-4">
              <div className="grid gap-3">
                {(active.navigationIssues || []).map((ni, i) => (
                  <Card key={i}>
                    <CardContent className="py-3 space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Compass className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="font-medium text-sm" data-testid={`text-nav-issue-${i}`}>{ni.issue}</p>
                        </div>
                        <SeverityBadge severity={ni.severity || "medium"} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-medium">Location:</span> {ni.location}
                      </div>
                      <p className="text-sm text-muted-foreground">{ni.description}</p>
                      <p className="text-xs text-muted-foreground">{ni.suggestion}</p>
                    </CardContent>
                  </Card>
                ))}
                {(!active.navigationIssues || active.navigationIssues.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No navigation issues detected</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <div className="grid gap-3">
                {(active.recommendations || []).map((rec, i) => (
                  <Card key={i}>
                    <CardContent className="flex items-start justify-between gap-3 py-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Lightbulb className="h-4 w-4 text-muted-foreground shrink-0" />
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        <p className="text-sm" data-testid={`text-recommendation-${i}`}>{rec.action}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <SeverityBadge severity={rec.priority || "medium"} />
                        <EffortBadge effort={rec.effort || "medium"} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!active.recommendations || active.recommendations.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No recommendations available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!active && !runAuditMutation.isPending && audits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gauge className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium" data-testid="text-no-audits">No audits yet</p>
            <p className="text-sm text-muted-foreground mt-1">Run an audit to detect UX issues automatically</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}