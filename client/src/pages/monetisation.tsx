import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { ShoppingCart, DollarSign, Package, ShoppingBag, AlertCircle } from "lucide-react";

interface MonetisationData {
  totalRevenue: number;
  purchases: number;
  averageOrderValue: number;
  itemsPurchased: number;
}

export default function MonetisationPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading, isError } = useQuery<MonetisationData>({
    queryKey: ["/api/projects", currentProject?.id, "ecommerce", queryParams],
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const hasData = data && !isError && data.totalRevenue !== undefined;

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Monetisation Overview"
        icon={ShoppingCart}
        {...headerProps}
        exportData={data}
        exportFilename="monetisation"
      />

      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-revenue">
                ${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-purchases">{data.purchases.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-avg-order">
                ${data.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Purchased</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-items-purchased">{data.itemsPurchased.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2" data-testid="text-setup-title">Set Up E-commerce Tracking</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  To view monetisation data, you need to configure e-commerce event tracking in your Google Analytics 4 property.
                  Send standard e-commerce events such as <code className="text-xs bg-muted px-1 py-0.5 rounded">purchase</code>,{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">add_to_cart</code>, and{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">begin_checkout</code> to start tracking revenue and transactions.
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1. Add the GA4 e-commerce data layer to your website</p>
                <p>2. Fire purchase events with transaction details</p>
                <p>3. Data will appear here once events are received</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
