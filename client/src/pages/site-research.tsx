import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AiApiNotice } from "@/components/ai-api-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Link2,
  Target,
  FileText,
  BarChart3,
  Lightbulb,
  Loader2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function DifficultyBadge({ value }: { value: number }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  if (value >= 70) variant = "destructive";
  else if (value >= 40) variant = "default";
  return <Badge variant={variant}>{value}</Badge>;
}

function ImpactBadge({ impact }: { impact: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  if (impact === "high") variant = "destructive";
  else if (impact === "medium") variant = "default";
  return <Badge variant={variant}>{impact}</Badge>;
}

function EffortBadge({ effort }: { effort: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  if (effort === "hard") variant = "destructive";
  else if (effort === "medium") variant = "default";
  return <Badge variant={variant}>{effort}</Badge>;
}

function OverviewTab({ overview }: { overview: any }) {
  if (!overview) return <p className="text-muted-foreground">No overview data available.</p>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Authority Score</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold" data-testid="text-authority-score">{overview.authorityScore || 0}</p>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <Progress value={overview.authorityScore || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Monthly Traffic</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatNumber(overview.estimatedMonthlyTraffic || 0)}</p>
              <TrendIcon trend={overview.trafficTrend || "stable"} />
            </div>
            <p className="text-xs text-muted-foreground">{overview.trafficChange > 0 ? "+" : ""}{overview.trafficChange || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Backlinks</p>
            <p className="text-2xl font-bold">{formatNumber(overview.totalBacklinks || 0)}</p>
            <p className="text-xs text-muted-foreground">{formatNumber(overview.referringDomains || 0)} domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Organic Keywords</p>
            <p className="text-2xl font-bold">{formatNumber(overview.organicKeywordsCount || 0)}</p>
            <p className="text-xs text-muted-foreground">{formatNumber(overview.paidKeywordsCount || 0)} paid</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-medium">Domain Details</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span className="font-medium">{overview.domain}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{overview.category || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Domain Age</span><span>{overview.domainAge || "Unknown"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Top Country</span><span>{overview.topCountry || "N/A"} ({overview.topCountryShare || 0}%)</span></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground">{overview.description || "No description available."}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrganicKeywordsTab({ keywords }: { keywords: any[] }) {
  if (!keywords?.length) return <p className="text-muted-foreground">No keyword data available.</p>;
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead className="text-right">Position</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">Difficulty</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">Traffic</TableHead>
              <TableHead>URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw: any, i: number) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{kw.keyword}</TableCell>
                <TableCell className="text-right">{kw.position}</TableCell>
                <TableCell className="text-right">{formatNumber(kw.volume || 0)}</TableCell>
                <TableCell className="text-right"><DifficultyBadge value={kw.difficulty || 0} /></TableCell>
                <TableCell className="text-right">${(kw.cpc || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{formatNumber(kw.traffic || 0)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{kw.url || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TopPagesTab({ pages }: { pages: any[] }) {
  if (!pages?.length) return <p className="text-muted-foreground">No page data available.</p>;
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Traffic</TableHead>
              <TableHead className="text-right">Keywords</TableHead>
              <TableHead className="text-right">Backlinks</TableHead>
              <TableHead>Top Keyword</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page: any, i: number) => (
              <TableRow key={i}>
                <TableCell className="max-w-[300px] truncate font-medium text-sm">{page.url}</TableCell>
                <TableCell className="text-right">{formatNumber(page.traffic || 0)}</TableCell>
                <TableCell className="text-right">{page.keywords || 0}</TableCell>
                <TableCell className="text-right">{formatNumber(page.backlinks || 0)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{page.topKeyword || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BacklinksTab({ backlinks }: { backlinks: any }) {
  if (!backlinks) return <p className="text-muted-foreground">No backlink data available.</p>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Backlinks</p>
            <p className="text-2xl font-bold">{formatNumber(backlinks.total || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Dofollow</p>
            <p className="text-2xl font-bold text-green-600">{formatNumber(backlinks.dofollow || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Nofollow</p>
            <p className="text-2xl font-bold text-muted-foreground">{formatNumber(backlinks.nofollow || 0)}</p>
          </CardContent>
        </Card>
      </div>
      {backlinks.topReferringDomains?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Referring Domains</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead className="text-right">Backlinks</TableHead>
                  <TableHead className="text-right">Authority</TableHead>
                  <TableHead className="text-right">Dofollow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backlinks.topReferringDomains.map((d: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{d.domain}</TableCell>
                    <TableCell className="text-right">{formatNumber(d.backlinks || 0)}</TableCell>
                    <TableCell className="text-right">{d.authorityScore || 0}</TableCell>
                    <TableCell className="text-right">{formatNumber(d.dofollow || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {backlinks.topAnchors?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Anchor Texts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anchor Text</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backlinks.topAnchors.map((a: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{a.text}</TableCell>
                    <TableCell className="text-right">{formatNumber(a.count || 0)}</TableCell>
                    <TableCell className="text-right">{(a.share || 0).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompetitorsTab({ competitors }: { competitors: any[] }) {
  if (!competitors?.length) return <p className="text-muted-foreground">No competitor data available.</p>;
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead className="text-right">Common Keywords</TableHead>
              <TableHead className="text-right">Authority</TableHead>
              <TableHead className="text-right">Est. Traffic</TableHead>
              <TableHead className="text-right">Overlap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((c: any, i: number) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{c.domain}</TableCell>
                <TableCell className="text-right">{formatNumber(c.commonKeywords || 0)}</TableCell>
                <TableCell className="text-right">{c.authorityScore || 0}</TableCell>
                <TableCell className="text-right">{formatNumber(c.estimatedTraffic || 0)}</TableCell>
                <TableCell className="text-right">{(c.overlap || 0).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PaidKeywordsTab({ keywords }: { keywords: any[] }) {
  if (!keywords?.length) return <p className="text-muted-foreground">No paid keyword data available.</p>;
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead className="text-right">Position</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead>Competition</TableHead>
              <TableHead>URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw: any, i: number) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{kw.keyword}</TableCell>
                <TableCell className="text-right">{kw.position}</TableCell>
                <TableCell className="text-right">{formatNumber(kw.volume || 0)}</TableCell>
                <TableCell className="text-right">${(kw.cpc || 0).toFixed(2)}</TableCell>
                <TableCell><Badge variant="outline">{kw.competition || "medium"}</Badge></TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{kw.url || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SiteStructureTab({ structure }: { structure: any }) {
  if (!structure) return <p className="text-muted-foreground">No structure data available.</p>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Pages</p>
            <p className="text-2xl font-bold">{formatNumber(structure.totalPages || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Page Depth</p>
            <p className="text-2xl font-bold">{(structure.avgPageDepth || 0).toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>
      {structure.topSubfolders?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Subfolders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Pages</TableHead>
                  <TableHead className="text-right">Traffic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structure.topSubfolders.map((sf: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium font-mono text-sm">{sf.path}</TableCell>
                    <TableCell className="text-right">{sf.pages || 0}</TableCell>
                    <TableCell className="text-right">{formatNumber(sf.traffic || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OpportunitiesTab({ opportunities }: { opportunities: any[] }) {
  if (!opportunities?.length) return <p className="text-muted-foreground">No opportunities identified.</p>;
  return (
    <div className="space-y-3">
      {opportunities.map((opp: any, i: number) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{opp.type}</Badge>
                  <span className="font-medium text-sm">{opp.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{opp.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <ImpactBadge impact={opp.impact || "medium"} />
                <EffortBadge effort={opp.effort || "medium"} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReportDetail({ report, onBack }: { report: any; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back-to-list">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back
        </Button>
        <h2 className="text-lg font-semibold" data-testid="text-report-domain">{report.domain}</h2>
        <Badge variant="outline">{report.status}</Badge>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" data-testid="tab-overview"><Globe className="h-3.5 w-3.5 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="organic" data-testid="tab-organic"><Search className="h-3.5 w-3.5 mr-1" /> Organic</TabsTrigger>
          <TabsTrigger value="pages" data-testid="tab-pages"><FileText className="h-3.5 w-3.5 mr-1" /> Pages</TabsTrigger>
          <TabsTrigger value="backlinks" data-testid="tab-backlinks"><Link2 className="h-3.5 w-3.5 mr-1" /> Backlinks</TabsTrigger>
          <TabsTrigger value="competitors" data-testid="tab-competitors"><Target className="h-3.5 w-3.5 mr-1" /> Competitors</TabsTrigger>
          <TabsTrigger value="paid" data-testid="tab-paid"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Paid</TabsTrigger>
          <TabsTrigger value="structure" data-testid="tab-structure"><Layers className="h-3.5 w-3.5 mr-1" /> Structure</TabsTrigger>
          <TabsTrigger value="opportunities" data-testid="tab-opportunities"><Lightbulb className="h-3.5 w-3.5 mr-1" /> Opportunities</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab overview={report.overview} /></TabsContent>
        <TabsContent value="organic"><OrganicKeywordsTab keywords={report.organicKeywords} /></TabsContent>
        <TabsContent value="pages"><TopPagesTab pages={report.topPages} /></TabsContent>
        <TabsContent value="backlinks"><BacklinksTab backlinks={report.backlinks} /></TabsContent>
        <TabsContent value="competitors"><CompetitorsTab competitors={report.competitors} /></TabsContent>
        <TabsContent value="paid"><PaidKeywordsTab keywords={report.paidKeywords} /></TabsContent>
        <TabsContent value="structure"><SiteStructureTab structure={report.siteStructure} /></TabsContent>
        <TabsContent value="opportunities"><OpportunitiesTab opportunities={report.opportunities} /></TabsContent>
      </Tabs>
    </div>
  );
}

export default function SiteResearchPage() {
  const [domain, setDomain] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const { toast } = useToast();

  const { data: reports, isLoading } = useQuery<any[]>({
    queryKey: ["/api/site-research"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (domainValue: string) => {
      const res = await apiRequest("POST", "/api/site-research/analyze", { domain: domainValue });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-research"] });
      setSelectedReport(data);
      setDomain("");
      toast({ title: "Analysis complete", description: `Report generated for ${data.domain}` });
    },
    onError: (err: any) => {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/site-research/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-research"] });
      if (selectedReport) setSelectedReport(null);
      toast({ title: "Report deleted" });
    },
  });

  if (selectedReport) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Site Research</h1>
        <p className="text-muted-foreground">Analyze any domain for SEO metrics, keywords, backlinks, competitors, and growth opportunities.</p>
      </div>

      <AiApiNotice />

      <Card>
        <CardContent className="p-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (domain.trim()) analyzeMutation.mutate(domain.trim());
            }}
          >
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="pl-9"
                data-testid="input-domain"
              />
            </div>
            <Button type="submit" disabled={analyzeMutation.isPending || !domain.trim()} data-testid="button-analyze">
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

      <div>
        <h2 className="text-lg font-semibold mb-3">Previous Reports</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !reports?.length ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No research reports yet. Enter a domain above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reports.map((report: any) => (
              <Card key={report.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedReport(report)}>
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium" data-testid={`text-report-domain-${report.id}`}>{report.domain}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        {report.overview?.authorityScore && (
                          <>
                            <span>Authority: {report.overview.authorityScore}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.status}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(report.id); }}
                      data-testid={`button-delete-report-${report.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
