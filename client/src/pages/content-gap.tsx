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
  Search,
  TrendingUp,
  Target,
  Users,
  FileText,
  Loader2,
  Trash2,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: string;
  currentRank: number | null;
  opportunity: string;
}

interface ContentGap {
  topic: string;
  description: string;
  priority: string;
  estimatedTraffic: number;
}

interface Competitor {
  domain: string;
  overlap: number;
  strengths: string[];
  weaknesses: string[];
}

interface BlogTopic {
  title: string;
  keyword: string;
  priority: string;
  wordCount: number;
  outline: string[];
  searchIntent: string;
}

interface Analysis {
  id: string;
  projectId: string;
  domain: string;
  keywords: Keyword[];
  contentGaps: ContentGap[];
  competitors: Competitor[];
  blogTopics: BlogTopic[];
  status: string;
  createdAt: string;
}

function PriorityBadge({ priority }: { priority: string }) {
  const variant = priority === "high" ? "destructive" : priority === "medium" ? "default" : "secondary";
  return <Badge variant={variant}>{priority}</Badge>;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variant = difficulty === "high" ? "destructive" : difficulty === "medium" ? "default" : "secondary";
  return <Badge variant={variant}>{difficulty}</Badge>;
}

export default function ContentGapPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [domain, setDomain] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  const analysesQuery = useQuery<Analysis[]>({
    queryKey: ["/api/projects", currentProject?.id, "content-gap"],
    enabled: !!currentProject?.id,
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/content-gap`);
      if (!res.ok) throw new Error("Failed to fetch analyses");
      return res.json();
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/content-gap/analyze`, {
        prompt: prompt || undefined,
        domain: domain || undefined,
      });
      return res.json();
    },
    onSuccess: (data: Analysis) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "content-gap"] });
      setSelectedAnalysis(data);
      setPrompt("");
      setDomain("");
      toast({ title: "Analysis complete", description: "Content gap analysis has been generated." });
    },
    onError: (err: Error) => {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${currentProject!.id}/content-gap/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "content-gap"] });
      if (selectedAnalysis) setSelectedAnalysis(null);
      toast({ title: "Analysis deleted" });
    },
  });

  if (!currentProject) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground" data-testid="text-no-project">Select a project to view content gap analysis</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analyses = analysesQuery.data || [];
  const active = selectedAnalysis || analyses[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Content Gap Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered keyword research, competitor analysis, and content recommendations</p>
        </div>
      </div>

      <AiApiNotice />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Run New Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Domain to analyse (leave blank for project domain)"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              data-testid="input-domain"
            />
            <Input
              placeholder="Focus area (e.g., 'e-commerce blog topics')"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="flex-1"
              data-testid="input-prompt"
            />
            <Button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              data-testid="button-analyze"
            >
              {analyzeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Analyse
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyses.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {analyses.map(a => (
            <Button
              key={a.id}
              variant={active?.id === a.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAnalysis(a)}
              data-testid={`button-analysis-${a.id}`}
            >
              {a.domain} - {new Date(a.createdAt).toLocaleDateString()}
            </Button>
          ))}
        </div>
      )}

      {active && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold" data-testid="text-analysis-domain">{active.domain}</h2>
              <p className="text-xs text-muted-foreground">Analysed {new Date(active.createdAt).toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate(active.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-analysis"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>

          <Tabs defaultValue="keywords">
            <TabsList>
              <TabsTrigger value="keywords" data-testid="tab-keywords">
                <TrendingUp className="h-4 w-4 mr-1" /> Keywords
              </TabsTrigger>
              <TabsTrigger value="gaps" data-testid="tab-gaps">
                <Target className="h-4 w-4 mr-1" /> Content Gaps
              </TabsTrigger>
              <TabsTrigger value="competitors" data-testid="tab-competitors">
                <Users className="h-4 w-4 mr-1" /> Competitors
              </TabsTrigger>
              <TabsTrigger value="blog" data-testid="tab-blog">
                <FileText className="h-4 w-4 mr-1" /> Blog Topics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="keywords" className="mt-4">
              <div className="grid gap-3">
                {(active.keywords || []).map((kw, i) => (
                  <Card key={i}>
                    <CardContent className="flex items-center justify-between gap-4 py-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-keyword-${i}`}>{kw.keyword}</p>
                          <p className="text-xs text-muted-foreground">{kw.opportunity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Volume</p>
                          <p className="font-medium text-sm">{(kw.volume || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Difficulty</p>
                          <DifficultyBadge difficulty={kw.difficulty || "medium"} />
                        </div>
                        {kw.currentRank && (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Rank</p>
                            <p className="font-medium text-sm">#{kw.currentRank}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!active.keywords || active.keywords.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No keyword data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gaps" className="mt-4">
              <div className="grid gap-3">
                {(active.contentGaps || []).map((gap, i) => (
                  <Card key={i}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm" data-testid={`text-gap-${i}`}>{gap.topic}</p>
                            <PriorityBadge priority={gap.priority || "medium"} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{gap.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">Est. Traffic</p>
                          <p className="font-medium text-sm flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                            {(gap.estimatedTraffic || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!active.contentGaps || active.contentGaps.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No content gap data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(active.competitors || []).map((comp, i) => (
                  <Card key={i}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <p className="font-medium text-sm" data-testid={`text-competitor-${i}`}>{comp.domain}</p>
                        <Badge variant="secondary">{comp.overlap || 0}% overlap</Badge>
                      </div>
                      {comp.strengths && comp.strengths.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Strengths</p>
                          <div className="flex gap-1 flex-wrap">
                            {comp.strengths.map((s, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {comp.weaknesses && comp.weaknesses.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Weaknesses</p>
                          <div className="flex gap-1 flex-wrap">
                            {comp.weaknesses.map((w, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{w}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {(!active.competitors || active.competitors.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8 col-span-full">No competitor data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="blog" className="mt-4">
              <div className="grid gap-3">
                {(active.blogTopics || []).map((topic, i) => (
                  <Card key={i}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm" data-testid={`text-blog-${i}`}>{topic.title}</p>
                            <PriorityBadge priority={topic.priority || "medium"} />
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">{topic.keyword}</Badge>
                            <Badge variant="secondary" className="text-xs">{topic.searchIntent}</Badge>
                            <span className="text-xs text-muted-foreground">{topic.wordCount || 0} words</span>
                          </div>
                          {topic.outline && topic.outline.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Outline</p>
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {topic.outline.map((item, j) => (
                                  <li key={j} className="flex items-start gap-1">
                                    <span className="shrink-0 text-primary">-</span> {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!active.blogTopics || active.blogTopics.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No blog topic data available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!active && !analyzeMutation.isPending && analyses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium" data-testid="text-no-analyses">No analyses yet</p>
            <p className="text-sm text-muted-foreground mt-1">Run an analysis above to discover content opportunities</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
