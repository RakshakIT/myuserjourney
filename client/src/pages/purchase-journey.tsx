import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Route, AlertCircle } from "lucide-react";

const FUNNEL_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

interface JourneyStage {
  stage: string;
  users: number;
  conversionRate: number;
}

interface PurchaseJourneyData {
  stages: JourneyStage[];
}

export default function PurchaseJourneyPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading } = useQuery<PurchaseJourneyData | null>({
    queryKey: ["/api/projects", currentProject?.id, "ecommerce", "journey", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/ecommerce?${queryParams}`);
      if (res.status === 404) return null;
      if (!res.ok) return null;
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const hasData = data && data.stages && data.stages.length > 0;

  const defaultStages: JourneyStage[] = [
    { stage: "View product", users: 0, conversionRate: 100 },
    { stage: "Add to cart", users: 0, conversionRate: 0 },
    { stage: "Begin checkout", users: 0, conversionRate: 0 },
    { stage: "Purchase", users: 0, conversionRate: 0 },
  ];

  const stages = hasData ? data.stages : defaultStages;

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Purchase Journey"
        icon={Route}
        {...headerProps}
        exportData={stages}
        exportFilename="purchase-journey"
      />

      {hasData ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Purchase Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stages} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis dataKey="stage" type="category" width={120} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number) => [
                        `${value.toLocaleString()} users`,
                        "Users",
                      ]}
                    />
                    <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                      {stages.map((_entry, index) => (
                        <Cell key={index} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stages.map((s, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.stage}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`text-stage-users-${i}`}>{s.users.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">{s.conversionRate.toFixed(1)}% conversion</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2" data-testid="text-setup-title">Set Up Purchase Journey Tracking</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  To visualise the purchase journey funnel, configure your GA4 property to track the following e-commerce events:
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full max-w-2xl">
                {defaultStages.map((s, i) => (
                  <Card key={i}>
                    <CardContent className="py-4 text-center">
                      <div className="text-sm font-medium">{s.stage}</div>
                      <div className="text-xs text-muted-foreground mt-1">Step {i + 1}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1. Send <code className="bg-muted px-1 py-0.5 rounded">view_item</code>, <code className="bg-muted px-1 py-0.5 rounded">add_to_cart</code>, <code className="bg-muted px-1 py-0.5 rounded">begin_checkout</code>, and <code className="bg-muted px-1 py-0.5 rounded">purchase</code> events</p>
                <p>2. Funnel data will appear here once events are received</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
