import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import { AiApiNotice } from "@/components/ai-api-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Loader2,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface PredictiveAnalytics {
  id: string;
  projectId: string;
  churnRiskScore: number;
  churnDrivers: { factor: string; impact: string; trend: string; detail: string }[];
  revenueTrend: { current: number; projected: { month: string; value: number; confidence: number }[] };
  conversionProbability: number;
  recommendations: { action: string; priority: string; expectedImpact: string }[];
  summary: string | null;
  createdAt: string;
}

function PriorityBadge({ priority }: { priority: string }) {
  const variant = priority === "high" ? "destructive" : priority === "medium" ? "default" : "secondary";
  return <Badge variant={variant}>{priority}</Badge>;
}

function ImpactBadge({ impact }: { impact: string }) {
  const variant = impact === "high" ? "destructive" : impact === "medium" ? "default" : "secondary";
  return <Badge variant={variant}>{impact}</Badge>;
}

function TrendIndicator({ trend }: { trend: string }) {
  if (trend === "increasing") {
    return <ArrowUp className="h-4 w-4 text-red-500" />;
  }
  if (trend === "decreasing") {
    return <ArrowDown className="h-4 w-4 text-green-500" />;
  }
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function getChurnColor(score: number): string {
  if (score > 0.6) return "text-red-500";
  if (score > 0.3) return "text-orange-500";
  return "text-green-500";
}

export default function PredictiveAnalyticsPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [selectedPrediction, setSelectedPrediction] = useState<PredictiveAnalytics | null>(null);

  const predictionsQuery = useQuery<PredictiveAnalytics[]>({
    queryKey: ["/api/projects", currentProject?.id, "predictive-analytics"],
    enabled: !!currentProject?.id,
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/predictive-analytics`);
      if (!res.ok) throw new Error("Failed to fetch predictions");
      return res.json();
    },
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/predictive-analytics/run`);
      return res.json();
    },
    onSuccess: (data: PredictiveAnalytics) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "predictive-analytics"] });
      setSelectedPrediction(data);
      toast({ title: "Prediction complete", description: "Predictive analysis has been generated." });
    },
    onError: (err: Error) => {
      toast({ title: "Prediction failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${currentProject!.id}/predictive-analytics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "predictive-analytics"] });
      if (selectedPrediction) setSelectedPrediction(null);
      toast({ title: "Prediction deleted" });
    },
  });

  if (!currentProject) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground" data-testid="text-no-project">Select a project to view predictive analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const predictions = predictionsQuery.data || [];
  const active = selectedPrediction || predictions[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Predictive Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered churn prediction, revenue forecasting, and conversion analysis</p>
        </div>
        <Button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          data-testid="button-run-prediction"
        >
          {runMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Run Prediction
        </Button>
      </div>

      <AiApiNotice />

      {predictions.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {predictions.map(p => (
            <Button
              key={p.id}
              variant={active?.id === p.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPrediction(p)}
              data-testid={`button-prediction-${p.id}`}
            >
              {new Date(p.createdAt).toLocaleDateString()}
            </Button>
          ))}
        </div>
      )}

      {active && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-muted-foreground">Generated {new Date(active.createdAt).toLocaleString()}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate(active.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-prediction"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${getChurnColor(active.churnRiskScore)}`} data-testid="text-churn-risk">
                  {Math.round(active.churnRiskScore * 100)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Probability</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="text-conversion-prob">
                  {Math.round(active.conversionProbability * 100)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="text-revenue-current">
                  ${(active.revenueTrend?.current || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </div>

          {active.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground" data-testid="text-summary">{active.summary}</p>
              </CardContent>
            </Card>
          )}

          {active.revenueTrend?.projected && active.revenueTrend.projected.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={active.revenueTrend.projected}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Projected Revenue"]} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.15}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {active.churnDrivers && active.churnDrivers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                Churn Drivers
              </h3>
              <div className="grid gap-3">
                {active.churnDrivers.map((driver, i) => (
                  <Card key={i} data-testid={`card-churn-driver-${i}`}>
                    <CardContent className="flex items-center justify-between gap-4 py-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <TrendIndicator trend={driver.trend} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{driver.factor}</p>
                            <ImpactBadge impact={driver.impact} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{driver.detail}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {active.recommendations && active.recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Recommendations
              </h3>
              <div className="grid gap-3">
                {active.recommendations.map((rec, i) => (
                  <Card key={i} data-testid={`card-recommendation-${i}`}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{rec.action}</p>
                            <PriorityBadge priority={rec.priority} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{rec.expectedImpact}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!active && !runMutation.isPending && predictions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium" data-testid="text-no-predictions">No predictions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Run a prediction to get AI-powered analytics insights</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
