import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Key, AlertTriangle } from "lucide-react";

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
          <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="font-medium text-sm text-amber-700 dark:text-amber-300" data-testid="text-api-notice-title">
              OpenAI API Key Required
            </p>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-api-notice-message">
            This feature requires an OpenAI API key to function. Please configure your OPENAI_API_KEY environment variable to enable AI-powered analysis.
          </p>
          <p className="text-xs text-muted-foreground" data-testid="text-api-notice-instruction">
            Add your API key in the server environment variables (AI_INTEGRATIONS_OPENAI_API_KEY)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
