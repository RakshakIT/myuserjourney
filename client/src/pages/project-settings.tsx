import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import type { Project } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Search,
  BarChart3,
  Code2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Unlink,
  LogIn,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useState } from "react";

export default function ProjectSettings() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState("");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", currentProject?.id],
    enabled: !!currentProject?.id,
  });

  const { data: googleIntegrations = [] } = useQuery<any[]>({
    queryKey: ["/api/projects", currentProject?.id, "google-integrations"],
    enabled: !!currentProject?.id,
  });

  const handleGoogleConnect = (provider: string) => {
    if (!currentProject?.id) return;
    window.location.href = `/api/google/authorize/${currentProject.id}?provider=${provider}`;
  };

  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      await apiRequest("DELETE", `/api/projects/${currentProject?.id}/google-integrations/${provider}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "google-integrations"] });
      toast({ title: "Disconnected", description: "Google account has been disconnected." });
    },
  });

  const analyticsIntegration = googleIntegrations.find((i: any) => i.provider === "analytics" && i.status === "connected");
  const searchConsoleIntegration = googleIntegrations.find((i: any) => i.provider === "search_console" && i.status === "connected");

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/verify-tracking`, {
        url: verifyUrl || undefined,
      });
      return res.json();
    },
  });

  const handleCopy = async () => {
    if (!currentProject) return;
    const snippetCode = `<script>
(function(w,d,pID){
  var s = d.createElement('script');
  s.src='${baseUrl}/snippet.js';
  s.async=true;
  s.dataset.projectId=pID;
  d.head.appendChild(s);
})(window, document, '${currentProject.id}');
</script>`;
    await navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Settings className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to manage its settings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            Project Settings
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configure Google integrations and tracking for {currentProject.name}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <SiGoogle className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium">Google Integration</CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  data-testid="badge-google-status"
                >
                  {(analyticsIntegration || searchConsoleIntegration) ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Connect Google Search Console and Analytics to import search performance and traffic data.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Google Account Connection</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sign in with your Google account to automatically connect Analytics and Search Console.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`rounded-md border p-3 ${analyticsIntegration ? "border-green-500/20 bg-green-500/5" : ""}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Analytics</span>
                      </div>
                      {analyticsIntegration ? (
                        <Badge data-testid="badge-analytics-connected">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" data-testid="badge-analytics-disconnected">Not Connected</Badge>
                      )}
                    </div>
                    {analyticsIntegration && (
                      <p className="text-xs text-muted-foreground mt-2">{analyticsIntegration.accountId || "Google Account"}</p>
                    )}
                    <div className="mt-2">
                      {analyticsIntegration ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => disconnectMutation.mutate("analytics")}
                          disabled={disconnectMutation.isPending}
                          data-testid="button-disconnect-analytics"
                        >
                          <Unlink className="h-3.5 w-3.5 mr-1" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleGoogleConnect("analytics")}
                          data-testid="button-connect-analytics"
                        >
                          <SiGoogle className="h-3.5 w-3.5 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className={`rounded-md border p-3 ${searchConsoleIntegration ? "border-green-500/20 bg-green-500/5" : ""}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Search Console</span>
                      </div>
                      {searchConsoleIntegration ? (
                        <Badge data-testid="badge-gsc-connected">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" data-testid="badge-gsc-disconnected">Not Connected</Badge>
                      )}
                    </div>
                    {searchConsoleIntegration && (
                      <p className="text-xs text-muted-foreground mt-2">{searchConsoleIntegration.accountId || "Google Account"}</p>
                    )}
                    <div className="mt-2">
                      {searchConsoleIntegration ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => disconnectMutation.mutate("search_console")}
                          disabled={disconnectMutation.isPending}
                          data-testid="button-disconnect-gsc"
                        >
                          <Unlink className="h-3.5 w-3.5 mr-1" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleGoogleConnect("search_console")}
                          data-testid="button-connect-gsc"
                        >
                          <SiGoogle className="h-3.5 w-3.5 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Tracking Code Verification</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                  <code data-testid="text-settings-snippet">{`<script>
(function(w,d,pID){
  var s = d.createElement('script');
  s.src='${baseUrl}/snippet.js';
  s.async=true;
  s.dataset.projectId=pID;
  d.head.appendChild(s);
})(window, document, '${currentProject.id}');
</script>`}</code>
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1.5 right-1.5"
                  onClick={handleCopy}
                  data-testid="button-copy-settings-snippet"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-medium">Verification Status</p>
                  {project?.trackingVerified ? (
                    <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      Not verified
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder={`https://${currentProject.domain}`}
                    value={verifyUrl}
                    onChange={(e) => setVerifyUrl(e.target.value)}
                    data-testid="input-settings-verify-url"
                  />
                  <Button
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyMutation.isPending}
                    data-testid="button-settings-verify"
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : null}
                    Verify
                  </Button>
                </div>

                {verifyMutation.data && (
                  <div
                    className={`rounded-md p-3 text-sm ${
                      verifyMutation.data.verified
                        ? "bg-green-500/5 border border-green-500/10"
                        : verifyMutation.data.foundSnippet
                          ? "bg-amber-500/5 border border-amber-500/10"
                          : "bg-orange-500/5 border border-orange-500/10"
                    }`}
                    data-testid="settings-verify-result"
                  >
                    <div className="flex items-start gap-2">
                      {verifyMutation.data.verified ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      )}
                      <div className="space-y-1">
                        <p className={`font-medium ${
                          verifyMutation.data.verified
                            ? "text-green-600 dark:text-green-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}>
                          {verifyMutation.data.verified ? "Tracking Verified" : verifyMutation.data.foundSnippet ? "Snippet Found - ID Mismatch" : "Not Detected"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {verifyMutation.data.message}
                        </p>
                        {verifyMutation.data.foundOtherProjectId && (
                          <p className="text-xs text-muted-foreground">
                            Copy the latest snippet above and replace the old one on your website.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
