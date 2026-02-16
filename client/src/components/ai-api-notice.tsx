import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function AiApiNotice() {
  const { data } = useQuery<{ available: boolean }>({
    queryKey: ["/api/ai/status"],
  });

  if (!data || data.available) return null;

  return (
    <Card
      className="border-amber-500/30 bg-amber-500/5"
      data-testid="banner-ai-api-notice"
    >
      <CardContent className="flex items-start gap-3 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm text-amber-700 dark:text-amber-300" data-testid="text-api-notice-title">
            AI features temporarily unavailable
          </p>
          <p className="text-sm text-muted-foreground" data-testid="text-api-notice-message">
            AI-powered analysis is currently unavailable. The platform will use built-in recommendations until the service is restored.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
