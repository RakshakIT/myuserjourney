import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Zap,
  Receipt,
  TrendingUp,
  Bot,
  BrainCircuit,
  Gauge,
  Wand2,
  FileBarChart,
  Target,
  Globe,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const featureIcons: Record<string, typeof Bot> = {
  "ai-chat": Bot,
  "ai-funnel-generation": Activity,
  "predictive-analytics": BrainCircuit,
  "ux-audit": Gauge,
  "marketing-copilot": Wand2,
  "report-insights": FileBarChart,
  "content-gap-analysis": Target,
  "site-research": Globe,
};

const featureLabels: Record<string, string> = {
  "ai-chat": "AI Copilot",
  "ai-funnel-generation": "Funnel Generation",
  "predictive-analytics": "Predictive Analytics",
  "ux-audit": "UX Auditor",
  "marketing-copilot": "Marketing Copilot",
  "report-insights": "Report Insights",
  "content-gap-analysis": "Content Gap Analysis",
  "site-research": "Site Research",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(330, 81%, 60%)",
  "hsl(24, 95%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(47, 96%, 53%)",
  "hsl(199, 89%, 48%)",
];

interface UsageData {
  totalCostUsd: number;
  totalRequests: number;
  billingThresholdUsd: number;
  featureBreakdown: Record<string, { count: number; cost: number }>;
  periodStart: string;
  periodEnd: string;
}

interface BillingData {
  currentMonthUsageUsd: number;
  billingThresholdUsd: number;
  stripeConfigured: boolean;
  invoices: Array<{
    id: number;
    amountUsd: number;
    status: string;
    createdAt: string;
  }>;
}

export default function UsagePage() {
  const { data: usage, isLoading: usageLoading } = useQuery<UsageData>({
    queryKey: ["/api/ai/usage/current-month"],
    refetchInterval: 30000,
  });

  const { data: billing, isLoading: billingLoading } = useQuery<BillingData>({
    queryKey: ["/api/billing/status"],
    refetchInterval: 30000,
  });

  const isLoading = usageLoading || billingLoading;

  const usagePercent = usage
    ? Math.min((usage.totalCostUsd / usage.billingThresholdUsd) * 100, 100)
    : 0;

  const chartData = usage
    ? Object.entries(usage.featureBreakdown).map(([feature, data]) => ({
        name: featureLabels[feature] || feature,
        requests: data.count,
        cost: Number(data.cost.toFixed(4)),
      }))
    : [];

  const pieData = usage
    ? Object.entries(usage.featureBreakdown).map(([feature, data]) => ({
        name: featureLabels[feature] || feature,
        value: data.count,
      }))
    : [];

  const currentMonth = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-usage-title">
          AI Usage & Billing
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor your AI feature usage and costs for {currentMonth}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Month Spend
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div>
                <p className="text-2xl font-bold" data-testid="text-usage-cost">
                  ${(usage?.totalCostUsd ?? 0).toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of ${usage?.billingThresholdUsd ?? 10} billing threshold
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div>
                <p className="text-2xl font-bold" data-testid="text-usage-requests">
                  {usage?.totalRequests ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI requests this month
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Features Used
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div>
                <p className="text-2xl font-bold" data-testid="text-usage-features">
                  {Object.keys(usage?.featureBreakdown ?? {}).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of 8 available AI features
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Billing Status
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div>
                <Badge
                  variant="secondary"
                  className={
                    (usage?.totalCostUsd ?? 0) >= (usage?.billingThresholdUsd ?? 10)
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-green-600 dark:text-green-400"
                  }
                  data-testid="badge-billing-status"
                >
                  {(usage?.totalCostUsd ?? 0) >= (usage?.billingThresholdUsd ?? 10)
                    ? "Invoice Pending"
                    : "Within Free Tier"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {billing?.stripeConfigured ? "Stripe connected" : "Stripe not configured"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Usage Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ${(usage?.totalCostUsd ?? 0).toFixed(4)} used
                </span>
                <span className="text-muted-foreground">
                  ${usage?.billingThresholdUsd ?? 10} threshold
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden" data-testid="progress-usage-bar">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent >= 90
                      ? "bg-orange-500"
                      : usagePercent >= 70
                        ? "bg-amber-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {usagePercent < 100
                  ? `${(100 - usagePercent).toFixed(1)}% remaining before invoice is generated`
                  : "Billing threshold reached — an invoice will be sent to your email"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Requests by Feature</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                No AI usage data yet this month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                No AI usage data yet this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Feature Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : Object.keys(usage?.featureBreakdown ?? {}).length > 0 ? (
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-4 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>Feature</span>
                <span className="text-right">Requests</span>
                <span className="text-right">Cost (USD)</span>
              </div>
              {Object.entries(usage?.featureBreakdown ?? {}).map(([feature, data]) => {
                const Icon = featureIcons[feature] || Search;
                return (
                  <div
                    key={feature}
                    className="grid grid-cols-3 gap-4 px-3 py-2.5 rounded-md hover-elevate"
                    data-testid={`row-usage-${feature}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">
                        {featureLabels[feature] || feature}
                      </span>
                    </div>
                    <span className="text-sm text-right">{data.count}</span>
                    <span className="text-sm text-right font-mono">
                      ${data.cost.toFixed(4)}
                    </span>
                  </div>
                );
              })}
              <div className="grid grid-cols-3 gap-4 px-3 py-2.5 border-t mt-1 font-medium">
                <span className="text-sm">Total</span>
                <span className="text-sm text-right">{usage?.totalRequests ?? 0}</span>
                <span className="text-sm text-right font-mono">
                  ${(usage?.totalCostUsd ?? 0).toFixed(4)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p>No AI usage this month</p>
              <p className="text-xs mt-1">
                Start using AI features like the AI Copilot, Predictive Analytics, or Marketing Copilot
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {billing?.invoices && billing.invoices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-4 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>Date</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Status</span>
              </div>
              {billing.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-3 gap-4 px-3 py-2.5 rounded-md hover-elevate"
                  data-testid={`row-invoice-${invoice.id}`}
                >
                  <span className="text-sm">
                    {new Date(invoice.createdAt).toLocaleDateString("en-GB")}
                  </span>
                  <span className="text-sm text-right font-mono">
                    ${invoice.amountUsd.toFixed(2)}
                  </span>
                  <div className="text-right">
                    <Badge
                      variant="secondary"
                      className={
                        invoice.status === "paid"
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">How Billing Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Free Tier</p>
              <p className="text-xs text-muted-foreground">
                Core analytics features are always free. AI features are billed based on usage.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Pay As You Go</p>
              <p className="text-xs text-muted-foreground">
                AI features use GPT-4o-mini pricing. You only pay for what you use — no subscriptions.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Invoice at $10</p>
              <p className="text-xs text-muted-foreground">
                When your monthly usage reaches $10, an invoice is automatically sent to your email.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
