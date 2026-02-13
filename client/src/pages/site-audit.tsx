import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useProject } from "@/lib/project-context";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Play, AlertTriangle, CheckCircle2, XCircle, ExternalLink, FileText, Image, Link2, Globe, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditResult {
  url: string;
  status: number;
  score: number;
  title: string;
  metaDescription: string;
  h1Count: number;
  h2Count: number;
  totalImages: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasCanonical: boolean;
  hasRobotsMeta: boolean;
  robotsContent: string;
  hasOgTags: boolean;
  issues: string[];
  error?: string;
}

interface AuditResponse {
  domain: string;
  results: AuditResult[];
  crawledAt: string;
}

function getScoreColor(score: number): string {
  if (score > 80) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score > 80) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

function getScoreBgClass(score: number): string {
  if (score > 80) return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
  if (score >= 50) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
  return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
}

function getRecommendations(issues: string[]): string[] {
  const recommendations: string[] = [];
  for (const issue of issues) {
    const lower = issue.toLowerCase();
    if (lower.includes("title")) {
      recommendations.push("Add a descriptive title tag between 30-60 characters for better SEO visibility.");
    } else if (lower.includes("meta description")) {
      recommendations.push("Write a compelling meta description between 120-160 characters to improve click-through rates.");
    } else if (lower.includes("h1")) {
      recommendations.push("Ensure each page has exactly one H1 tag that describes the page content.");
    } else if (lower.includes("alt")) {
      recommendations.push("Add descriptive alt text to all images for accessibility and image SEO.");
    } else if (lower.includes("canonical")) {
      recommendations.push("Add a canonical URL tag to prevent duplicate content issues.");
    } else if (lower.includes("og") || lower.includes("open graph")) {
      recommendations.push("Add Open Graph tags to control how your pages appear when shared on social media.");
    } else if (lower.includes("robot")) {
      recommendations.push("Review your robots meta tag to ensure search engines can properly index your content.");
    } else {
      recommendations.push(`Address: ${issue}`);
    }
  }
  return Array.from(new Set(recommendations));
}

export default function SiteAuditPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [customUrls, setCustomUrls] = useState("");
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [expandedUrls, setExpandedUrls] = useState<Record<string, boolean>>({});

  const auditMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/site-audit`, { urls });
      return (await res.json()) as AuditResponse;
    },
    onSuccess: (data) => {
      setAuditData(data);
      toast({
        title: "Audit Complete",
        description: `Crawled ${data.results.length} page(s) on ${data.domain}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Audit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCleanUrl = (domain: string) => {
    const d = domain.replace(/\/+$/, "");
    if (d.startsWith("http://") || d.startsWith("https://")) return d;
    return `https://${d}`;
  };

  const handleRunAudit = () => {
    if (!currentProject) return;
    const defaultUrl = getCleanUrl(currentProject.domain);
    const additionalUrls = customUrls
      .split(/[,\n]/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
      .map((u) => getCleanUrl(u));
    const urls = [defaultUrl, ...additionalUrls];
    auditMutation.mutate(urls);
  };

  const toggleExpanded = (url: string) => {
    setExpandedUrls((prev) => ({
      ...prev,
      [url]: !prev[url],
    }));
  };

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground" data-testid="text-no-project">Select a project to run a site audit.</p>
      </div>
    );
  }

  const validResults = auditData?.results.filter((r) => !r.error) ?? [];
  const avgScore = validResults.length > 0 ? Math.round(validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length) : 0;
  const totalIssues = auditData?.results.reduce((sum, r) => sum + r.issues.length, 0) ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-site-audit-title">Site Audit</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Default URL</label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm" data-testid="text-default-url">{currentProject.domain.startsWith("http") ? currentProject.domain : `https://${currentProject.domain}`}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Additional URLs (comma-separated or one per line)</label>
            <Textarea
              placeholder={`https://${currentProject.domain}/about\nhttps://${currentProject.domain}/contact`}
              value={customUrls}
              onChange={(e) => setCustomUrls(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-custom-urls"
            />
          </div>
          <Button
            onClick={handleRunAudit}
            disabled={auditMutation.isPending}
            data-testid="button-run-audit"
          >
            {auditMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Audit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {auditMutation.isPending && (
        <div className="space-y-4" data-testid="loading-skeleton">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      )}

      {auditData && !auditMutation.isPending && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className={`border ${getScoreBgClass(avgScore)}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`} data-testid="text-avg-score">{avgScore}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pages Crawled</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-pages-crawled">{auditData.results.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-issues">{totalIssues}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Page Results</h2>
            {auditData.results.map((result, index) => {
              const isExpanded = !!expandedUrls[result.url];
              const recommendations = getRecommendations(result.issues);
              return (
                <Card key={index} data-testid={`card-result-${index}`}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleExpanded(result.url)}
                    data-testid={`button-toggle-${index}`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate" data-testid={`text-url-${index}`}>{result.url}</span>
                        {result.error ? (
                          <Badge variant="destructive" data-testid={`badge-error-${index}`}>Error</Badge>
                        ) : (
                          <>
                            <Badge variant="outline" data-testid={`badge-status-${index}`}>{result.status}</Badge>
                            <Badge variant={getScoreBadgeVariant(result.score)} data-testid={`badge-score-${index}`}>{result.score}</Badge>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.issues.length > 0 && (
                          <span className="text-xs text-muted-foreground">{result.issues.length} issue(s)</span>
                        )}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="space-y-4">
                      {result.error ? (
                        <div className="flex items-center gap-2 text-destructive">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">{result.error}</span>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Title</span>
                                <p className="text-sm" data-testid={`text-title-${index}`}>{result.title || "No title found"}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Meta Description</span>
                                <p className="text-sm" data-testid={`text-meta-${index}`}>{result.metaDescription || "No meta description found"}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">H1: {result.h1Count}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">H2: {result.h2Count}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Image className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">Images: {result.totalImages}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Image className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">Missing Alt: {result.imagesWithoutAlt}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">Internal Links: {result.internalLinks}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">External Links: {result.externalLinks}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant={result.hasCanonical ? "default" : "destructive"}>
                              {result.hasCanonical ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              Canonical
                            </Badge>
                            <Badge variant={result.hasOgTags ? "default" : "destructive"}>
                              {result.hasOgTags ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              OG Tags
                            </Badge>
                            <Badge variant={result.hasRobotsMeta ? "secondary" : "outline"}>
                              {result.hasRobotsMeta ? "Robots: " + result.robotsContent : "No Robots Meta"}
                            </Badge>
                          </div>

                          {result.issues.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium">Issues</span>
                              <div className="space-y-1">
                                {result.issues.map((issue, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm" data-testid={`text-issue-${index}-${i}`}>
                                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                                    <span>{issue}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {recommendations.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium">Recommendations</span>
                              <div className="space-y-1">
                                {recommendations.map((rec, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground" data-testid={`text-recommendation-${index}-${i}`}>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground" data-testid="text-crawled-at">
            Crawled at: {new Date(auditData.crawledAt).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}
