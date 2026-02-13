import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import { AiApiNotice } from "@/components/ai-api-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Search,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  Eye,
  Wrench,
} from "lucide-react";

interface SeoFix {
  issue: string;
  severity: string;
  pages: number;
  description: string;
  fix: string;
}

interface PpcOptimization {
  campaign: string;
  currentBudget: number;
  suggestedBudget: number;
  reason: string;
  expectedROI: string;
  priority: string;
}

interface UxImprovement {
  area: string;
  severity: string;
  issue: string;
  suggestion: string;
  expectedImpact: string;
}

interface MarketingCopilotSession {
  id: string;
  projectId: string;
  prompt: string | null;
  seoFixes: SeoFix[];
  ppcOptimizations: PpcOptimization[];
  uxImprovements: UxImprovement[];
  summary: string | null;
  createdAt: string;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant = severity === "high" ? "destructive" : severity === "medium" ? "default" : "secondary";
  return <Badge variant={variant}>{severity}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const variant = priority === "high" ? "destructive" : priority === "medium" ? "default" : "secondary";
  return <Badge variant={variant}>{priority}</Badge>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function MarketingCopilotPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [selectedSession, setSelectedSession] = useState<MarketingCopilotSession | null>(null);

  const sessionsQuery = useQuery<MarketingCopilotSession[]>({
    queryKey: ["/api/projects", currentProject?.id, "marketing-copilot"],
    enabled: !!currentProject?.id,
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/marketing-copilot`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/marketing-copilot/run`, {
        prompt: prompt || undefined,
      });
      return res.json();
    },
    onSuccess: (data: MarketingCopilotSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "marketing-copilot"] });
      setSelectedSession(data);
      setPrompt("");
      toast({ title: "Recommendations ready", description: "AI marketing recommendations have been generated." });
    },
    onError: (err: Error) => {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${currentProject!.id}/marketing-copilot/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "marketing-copilot"] });
      if (selectedSession) setSelectedSession(null);
      toast({ title: "Session deleted" });
    },
  });

  if (!currentProject) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground" data-testid="text-no-project">Select a project to use the Marketing Copilot</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessions = sessionsQuery.data || [];
  const active = selectedSession || sessions[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">AI Marketing Copilot</h1>
          <p className="text-sm text-muted-foreground mt-1">Get AI-powered SEO fixes, PPC budget optimization, and UX improvement suggestions</p>
        </div>
      </div>

      <AiApiNotice />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Get Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Optional prompt (e.g., 'Focus on mobile UX issues')"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="flex-1"
              data-testid="input-prompt"
            />
            <Button
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
              data-testid="button-run-copilot"
            >
              {runMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {sessions.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {sessions.map(s => (
            <Button
              key={s.id}
              variant={active?.id === s.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSession(s)}
              data-testid={`button-session-${s.id}`}
            >
              {new Date(s.createdAt).toLocaleDateString()}
              {s.prompt ? ` - ${s.prompt.slice(0, 30)}` : ""}
            </Button>
          ))}
        </div>
      )}

      {active && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Generated {new Date(active.createdAt).toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate(active.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-session"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>

          {active.summary && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm" data-testid="text-summary">{active.summary}</p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="seo-fixes">
            <TabsList>
              <TabsTrigger value="seo-fixes" data-testid="tab-seo-fixes">
                <Wrench className="h-4 w-4 mr-1" /> SEO Fixes
              </TabsTrigger>
              <TabsTrigger value="ppc" data-testid="tab-ppc">
                <Megaphone className="h-4 w-4 mr-1" /> PPC Optimisation
              </TabsTrigger>
              <TabsTrigger value="ux-improvements" data-testid="tab-ux-improvements">
                <Eye className="h-4 w-4 mr-1" /> UX Improvements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="seo-fixes" className="mt-4">
              <div className="grid gap-3">
                {(active.seoFixes || []).map((fix, i) => (
                  <Card key={i}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm" data-testid={`text-seo-issue-${i}`}>{fix.issue}</p>
                            <SeverityBadge severity={fix.severity || "medium"} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{fix.description}</p>
                          <p className="text-xs mt-2">
                            <span className="font-medium">Fix:</span> {fix.fix}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">Affected Pages</p>
                          <p className="font-medium text-sm">{fix.pages}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!active.seoFixes || active.seoFixes.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No SEO fix data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ppc" className="mt-4">
              <div className="grid gap-3">
                {(active.ppcOptimizations || []).map((ppc, i) => (
                  <Card key={i}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm" data-testid={`text-ppc-campaign-${i}`}>{ppc.campaign}</p>
                            <PriorityBadge priority={ppc.priority || "medium"} />
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{formatCurrency(ppc.currentBudget)}</span>
                            {ppc.suggestedBudget >= ppc.currentBudget ? (
                              <ArrowUpRight className="h-3 w-3 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${ppc.suggestedBudget >= ppc.currentBudget ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                              {formatCurrency(ppc.suggestedBudget)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{ppc.reason}</p>
                          <p className="text-xs mt-1">
                            <span className="font-medium">Expected ROI:</span> {ppc.expectedROI}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!active.ppcOptimizations || active.ppcOptimizations.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No PPC optimization data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ux-improvements" className="mt-4">
              <div className="grid gap-3">
                {(active.uxImprovements || []).map((ux, i) => (
                  <Card key={i}>
                    <CardContent className="py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm" data-testid={`text-ux-area-${i}`}>{ux.area}</p>
                          <SeverityBadge severity={ux.severity || "medium"} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{ux.issue}</p>
                        <p className="text-xs mt-2">
                          <span className="font-medium">Suggestion:</span> {ux.suggestion}
                        </p>
                        <p className="text-xs mt-1">
                          <span className="font-medium">Expected Impact:</span> {ux.expectedImpact}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!active.uxImprovements || active.uxImprovements.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No UX improvement data available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!active && !runMutation.isPending && sessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium" data-testid="text-no-sessions">No sessions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Get recommendations above to receive AI-powered marketing insights</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
