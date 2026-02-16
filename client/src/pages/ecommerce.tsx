import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { Receipt, AlertCircle, ArrowUpDown } from "lucide-react";

interface EcommerceItem {
  itemName: string;
  itemsPurchased: number;
  revenue: number;
  itemPurchaseQuantity: number;
}

interface EcommerceData {
  items: EcommerceItem[];
}

export default function EcommercePage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading } = useQuery<EcommerceData | null>({
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
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const hasData = data && data.items && data.items.length > 0;

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="E-commerce Purchases"
        icon={Receipt}
        {...headerProps}
        exportData={data?.items}
        exportFilename="ecommerce-purchases"
      />

      {hasData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Item Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-item-name">Item name <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-items-purchased">Items purchased <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-revenue">Revenue <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-quantity">Item purchase quantity <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-item-${i}`}>
                      <td className="py-2 pr-4 font-medium">{item.itemName}</td>
                      <td className="text-right py-2 px-4">{item.itemsPurchased.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">
                        ${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-2 pl-4">{item.itemPurchaseQuantity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2" data-testid="text-setup-title">Set Up E-commerce Tracking</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  To view e-commerce purchase data, configure your Google Analytics 4 property to send item-level e-commerce events.
                  Include item details such as <code className="text-xs bg-muted px-1 py-0.5 rounded">item_name</code>,{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">price</code>, and{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">quantity</code> in your purchase events.
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1. Implement the GA4 e-commerce data layer with item arrays</p>
                <p>2. Include item-level parameters in purchase events</p>
                <p>3. Item data will appear here once events are received</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
