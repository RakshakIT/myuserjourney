import { useProject } from "@/lib/project-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsHeader } from "@/components/analytics-header";
import { useDateRange } from "@/hooks/use-date-range";
import { CreditCard, AlertCircle, ArrowUpDown } from "lucide-react";

interface Transaction {
  transactionId: string;
  date: string;
  revenue: number;
  items: number;
  tax: number;
  shipping: number;
}

interface TransactionsData {
  transactions: Transaction[];
}

export default function TransactionsPage() {
  const { currentProject } = useProject();
  const { queryParams, headerProps } = useDateRange();

  const { data, isLoading } = useQuery<TransactionsData | null>({
    queryKey: ["/api/projects", currentProject?.id, "ecommerce", "transactions", queryParams],
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

  const hasData = data && data.transactions && data.transactions.length > 0;

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        title="Transactions"
        icon={CreditCard}
        {...headerProps}
        exportData={data?.transactions}
        exportFilename="transactions"
      />

      {hasData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-transaction-id">Transaction ID <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-left py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-date">Date <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-revenue">Revenue <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-items">Items <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-tax">Tax <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 cursor-pointer" data-testid="header-shipping">Shipping <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t, i) => (
                    <tr key={i} className="border-b last:border-0 hover-elevate" data-testid={`row-transaction-${i}`}>
                      <td className="py-2 pr-4 font-mono text-xs">{t.transactionId}</td>
                      <td className="py-2 px-4">{t.date}</td>
                      <td className="text-right py-2 px-4">
                        ${t.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-2 px-4">{t.items}</td>
                      <td className="text-right py-2 px-4">
                        ${t.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-2 pl-4">
                        ${t.shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
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
                <h3 className="text-lg font-semibold mb-2" data-testid="text-setup-title">No Transactions Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Transaction data will appear here once your GA4 property starts receiving e-commerce purchase events
                  with transaction details including <code className="text-xs bg-muted px-1 py-0.5 rounded">transaction_id</code>,{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">value</code>,{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">tax</code>, and{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">shipping</code>.
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1. Configure GA4 e-commerce purchase events with full transaction data</p>
                <p>2. Include transaction ID, revenue, tax, and shipping in each purchase event</p>
                <p>3. Transactions will be listed here once data flows in</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
