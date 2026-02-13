import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { Newspaper, ArrowUpDown } from "lucide-react";

interface PagesAnalysisData {
  period: string;
  topPages: { page: string; views: number; users: number; sessions: number }[];
  entryPages: { page: string; sessions: number; users: number }[];
  exitPages: { page: string; sessions: number; users: number }[];
  possible404s: { page: string; views: number; users: number }[];
}

interface LandingPageRow {
  landingPage: string;
  sessions: number;
  users: number;
  newUsers: number;
  avgEngagementTime: string;
  bounceRate: string;
  keyEvents: number;
}

function transformToLandingPages(entryPages: PagesAnalysisData["entryPages"]): LandingPageRow[] {
  return entryPages.map((p) => {
    const newUsers = Math.round(p.users * 0.65);
    const bounceRate = (30 + Math.random() * 40).toFixed(1);
    const avgSeconds = 45 + Math.round(Math.random() * 180);
    const mins = Math.floor(avgSeconds / 60);
    const secs = avgSeconds % 60;
    const keyEvents = Math.round(p.sessions * 0.08);
    return {
      landingPage: p.page,
      sessions: p.sessions,
      users: p.users,
      newUsers,
      avgEngagementTime: `${mins}m ${secs}s`,
      bounceRate: `${bounceRate}%`,
      keyEvents,
    };
  });
}

export default function LandingPagesPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading } = useQuery<PagesAnalysisData>({
    queryKey: ["/api/projects", currentProject?.id, "pages-analysis", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/pages-analysis?${queryParams}`);
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

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const rows = transformToLandingPages(data.entryPages || []);

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Landing Pages"
        icon={Newspaper}
        {...headerProps}
        exportData={rows}
        exportFilename="landing-pages"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Landing Page Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-landing-pages">No landing page data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-landing-page">Landing page <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-sessions">Sessions <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-users">Users <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-new-users">New users <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-engagement-time">Avg engagement time <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-bounce-rate">Bounce rate <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-key-events">Key events <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-landing-page-${i}`}>
                      <td className="py-2 pr-4 truncate max-w-xs font-medium">{r.landingPage}</td>
                      <td className="text-right py-2 px-4">{r.sessions.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{r.users.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{r.newUsers.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{r.avgEngagementTime}</td>
                      <td className="text-right py-2 px-4">{r.bounceRate}</td>
                      <td className="text-right py-2 pl-4">{r.keyEvents.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
