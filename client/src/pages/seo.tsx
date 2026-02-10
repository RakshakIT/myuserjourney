import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import type { SeoAnalysis } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Image,
  FileText,
  Heading,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

function ScoreBadge({ score }: { score: number }) {
  let variant: "default" | "secondary" | "destructive" = "default";
  if (score < 50) variant = "destructive";
  else if (score < 75) variant = "secondary";
  return <Badge variant={variant}>{score}/100</Badge>;
}

function IssueItem({
  type,
  label,
  severity,
}: {
  type: string;
  label: string;
  severity: "error" | "warning" | "info";
}) {
  const icons = {
    error: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
    info: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
  };

  return (
    <div className="flex items-start gap-3 py-2">
      {icons[severity]}
      <div>
        <span className="text-sm">{label}</span>
        <span className="text-xs text-muted-foreground ml-2 capitalize">({type})</span>
      </div>
    </div>
  );
}

export default function SeoPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [url, setUrl] = useState("");

  const { data: analyses, isLoading } = useQuery<SeoAnalysis[]>({
    queryKey: ["/api/projects", currentProject?.id, "seo"],
    enabled: !!currentProject,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (analyzeUrl: string) => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/seo`, {
        url: analyzeUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "seo"] });
      setUrl("");
      toast({ title: "SEO analysis complete" });
    },
    onError: (err: Error) => {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    },
  });

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Search className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to analyze SEO.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-seo-title">
          SEO Analysis
        </h1>
        <p className="text-sm text-muted-foreground">
          Analyze and optimize your pages for search engines
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (url.trim()) analyzeMutation.mutate(url.trim());
            }}
            className="flex items-center gap-3 flex-wrap"
          >
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Enter URL to analyze (e.g., https://example.com/page)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-seo-url"
              />
            </div>
            <Button type="submit" disabled={analyzeMutation.isPending} data-testid="button-analyze-seo">
              {analyzeMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !analyses || analyses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No analyses yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enter a URL above to run your first SEO analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const issues = (analysis.issues as any[]) || [];
            const recommendations = (analysis.recommendations as string[]) || [];

            return (
              <Card key={analysis.id} data-testid={`card-seo-${analysis.id}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">
                      {analysis.url}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Analyzed {format(new Date(analysis.analyzedAt), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                  <ScoreBadge score={analysis.score} />
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span className="text-sm text-muted-foreground">{analysis.score}%</span>
                    </div>
                    <Progress value={analysis.score} className="h-2" />
                  </div>

                  {(analysis.metaTitle || analysis.metaDescription) && (
                    <div className="space-y-2 rounded-md bg-muted/50 p-3">
                      {analysis.metaTitle && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Title Tag</span>
                          <p className="text-sm mt-0.5" data-testid={`text-seo-title-${analysis.id}`}>
                            {analysis.metaTitle}
                            <span className="text-xs text-muted-foreground ml-2">({analysis.metaTitle.length} chars)</span>
                          </p>
                        </div>
                      )}
                      {analysis.metaDescription && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Meta Description</span>
                          <p className="text-sm mt-0.5 text-muted-foreground" data-testid={`text-seo-desc-${analysis.id}`}>
                            {analysis.metaDescription}
                            <span className="text-xs ml-2">({analysis.metaDescription.length} chars)</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Heading className="h-3.5 w-3.5" />
                        <span className="text-xs">Headings</span>
                      </div>
                      <p className="text-lg font-semibold">{analysis.headingsCount ?? 0}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Image className="h-3.5 w-3.5" />
                        <span className="text-xs">Missing Alt</span>
                      </div>
                      <p className="text-lg font-semibold">{analysis.imagesWithoutAlt ?? 0}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span className="text-xs">Internal Links</span>
                      </div>
                      <p className="text-lg font-semibold">{analysis.internalLinks ?? 0}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span className="text-xs">External Links</span>
                      </div>
                      <p className="text-lg font-semibold">{analysis.externalLinks ?? 0}</p>
                    </div>
                  </div>

                  {issues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Issues Found</h4>
                      <div className="divide-y">
                        {issues.map((issue: any, i: number) => (
                          <IssueItem
                            key={i}
                            type={issue.type}
                            label={issue.label}
                            severity={issue.severity}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
