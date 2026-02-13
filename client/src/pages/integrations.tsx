import { useState, useEffect } from "react";
import { useProject } from "@/lib/project-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart3,
  Search,
  Link2,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
  Unlink,
  LogIn,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  icon: "ga4" | "gsc";
  provider: string;
  dataProvided: string[];
}

const integrationDefs: IntegrationDef[] = [
  {
    id: "ga4",
    name: "Google Analytics 4",
    description: "Import web analytics data including traffic, engagement, conversions, and e-commerce metrics from your GA4 property.",
    icon: "ga4",
    provider: "analytics",
    dataProvided: [
      "Traffic sources & channels",
      "User acquisition & behaviour",
      "Page performance & engagement",
      "E-commerce & conversion tracking",
      "Real-time visitor data",
    ],
  },
  {
    id: "gsc",
    name: "Google Search Console",
    description: "Import organic search performance data including queries, clicks, impressions, and rankings from Search Console.",
    icon: "gsc",
    provider: "search_console",
    dataProvided: [
      "Search queries & keywords",
      "Click-through rates",
      "Average position rankings",
      "Impressions & clicks by page",
      "Index coverage reports",
    ],
  },
];

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-1 mt-1">
      <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md flex-1 overflow-x-auto">{value}</code>
      <Button
        size="icon"
        variant="ghost"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        data-testid="button-copy-redirect-uri"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

export default function IntegrationsPage() {
  const { currentProject } = useProject();
  const [, setLocation] = useLocation();
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<IntegrationDef | null>(null);
  const { toast } = useToast();

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", currentProject?.id],
    enabled: !!currentProject?.id,
  });

  const { data: googleIntegrations = [], isLoading: integrationsLoading } = useQuery<any[]>({
    queryKey: ["/api/projects", currentProject?.id, "google-integrations"],
    enabled: !!currentProject?.id,
  });

  const { data: oauthStatus } = useQuery<{ configured: boolean; source: string }>({
    queryKey: ["/api/projects", currentProject?.id, "google-oauth-status"],
    enabled: !!currentProject?.id,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      await apiRequest("DELETE", `/api/projects/${currentProject?.id}/google-integrations/${provider}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "google-integrations"] });
      toast({ title: "Disconnected", description: "Google integration has been removed." });
      setDisconnectTarget(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");
    const provider = params.get("provider");

    if (success === "true") {
      toast({
        title: "Connected successfully",
        description: `Your Google ${provider === "search_console" ? "Search Console" : "Analytics"} account has been connected.`,
      });
      window.history.replaceState({}, "", "/integrations");
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "google-integrations"] });
    } else if (error) {
      toast({
        title: "Connection failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/integrations");
    }
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const redirectUri = `${baseUrl}/api/google/callback`;
  const hasCredentials = !!(project?.googleClientId && project?.googleClientSecret);

  const getIntegrationStatus = (provider: string) => {
    const integration = googleIntegrations.find((i: any) => i.provider === provider);
    return integration?.status === "connected" ? integration : null;
  };

  const handleConnect = (integration: IntegrationDef) => {
    if (!currentProject?.id) return;
    if (!oauthStatus?.configured) {
      toast({
        title: "Google OAuth not configured",
        description: "Google OAuth credentials are needed to connect. Click 'Need help?' for setup instructions, or configure credentials in Project Settings.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = `/api/google/authorize/${currentProject.id}?provider=${integration.provider}`;
  };

  const IntegrationIcon = ({ type }: { type: "ga4" | "gsc" }) => {
    if (type === "ga4") return <BarChart3 className="h-8 w-8 text-primary" />;
    return <Search className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">Integrations</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation("/project-settings")}
          data-testid="button-go-project-settings"
        >
          <Settings className="h-4 w-4 mr-1" />
          Project Settings
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Connect your Google services to import analytics and search data. Just sign in with your Google account to get started.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrationDefs.map((integration) => {
          const connected = getIntegrationStatus(integration.provider);
          return (
            <Card key={integration.id} data-testid={`card-integration-${integration.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <IntegrationIcon type={integration.icon} />
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <div className="mt-1">
                      {integrationsLoading ? (
                        <Badge variant="secondary">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Checking
                        </Badge>
                      ) : connected ? (
                        <Badge data-testid={`badge-status-${integration.id}`}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" data-testid={`badge-status-${integration.id}`}>
                          Not Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SiGoogle className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{integration.description}</p>

                {connected && (
                  <div className="rounded-md bg-green-500/5 border border-green-500/10 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-green-600 dark:text-green-400">
                        Connected as <strong>{connected.accountId || "Google Account"}</strong>
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Data provided</h4>
                  <ul className="space-y-1">
                    {integration.dataProvided.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {connected ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setDisconnectTarget(integration)}
                        data-testid={`button-disconnect-${integration.id}`}
                      >
                        <Unlink className="h-4 w-4 mr-1" />
                        Disconnect
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleConnect(integration)}
                        data-testid={`button-reconnect-${integration.id}`}
                      >
                        Reconnect
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleConnect(integration)}
                        data-testid={`button-connect-${integration.id}`}
                      >
                        <SiGoogle className="h-4 w-4 mr-1" />
                        Connect with Google
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setGuideExpanded(false);
                          setSetupDialogOpen(true);
                        }}
                        data-testid={`button-setup-help-${integration.id}`}
                      >
                        <Info className="h-3.5 w-3.5 mr-1" />
                        Need help?
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SiGoogle className="h-5 w-5" />
              Google Integration Setup
            </DialogTitle>
            <DialogDescription>
              To connect your Google account, the platform needs Google OAuth credentials configured.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-blue-500/5 border border-blue-500/10 p-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-blue-600 dark:text-blue-400">
                  Click <strong>Connect with Google</strong> to sign in with your Google account. If you see an error, your platform admin needs to configure Google OAuth credentials first.
                </span>
              </div>
            </div>

            <button
              onClick={() => setGuideExpanded(!guideExpanded)}
              className="flex items-center gap-2 text-sm w-full text-left hover-elevate rounded-md px-2 py-1.5"
              data-testid="button-toggle-setup-guide"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium">
                Admin: How to configure Google OAuth credentials
              </span>
              {guideExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
              )}
            </button>

            {guideExpanded && (
              <div className="rounded-md border p-3 space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">1</span>
                  <span>
                    Go to the{" "}
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
                      Google Cloud Credentials page <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">2</span>
                  <span>Create an <strong>OAuth client ID</strong> (Web application type)</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">3</span>
                  <div>
                    <span>Add this authorised redirect URI:</span>
                    <CopyValue value={redirectUri} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">4</span>
                  <span>
                    Enable the{" "}
                    <a href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
                      Analytics Data API <ExternalLink className="h-3 w-3" />
                    </a>
                    {" "}and{" "}
                    <a href="https://console.cloud.google.com/apis/library/searchconsole.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
                      Search Console API <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">5</span>
                  <span>Enter the Client ID and Secret in{" "}
                    <button
                      onClick={() => { setSetupDialogOpen(false); setLocation("/project-settings"); }}
                      className="text-primary underline"
                    >
                      Project Settings
                    </button>
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setSetupDialogOpen(false)} data-testid="button-dialog-cancel">
                Close
              </Button>
              <Button
                onClick={() => {
                  setSetupDialogOpen(false);
                  setLocation("/project-settings");
                }}
                data-testid="button-go-to-settings"
              >
                <Settings className="h-4 w-4 mr-1" />
                Project Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Disconnect {disconnectTarget?.name}?</DialogTitle>
            <DialogDescription>
              This will remove the connection to your Google account for {disconnectTarget?.name}. You can reconnect at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" onClick={() => setDisconnectTarget(null)} data-testid="button-cancel-disconnect">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => disconnectTarget && disconnectMutation.mutate(disconnectTarget.provider)}
              disabled={disconnectMutation.isPending}
              data-testid="button-confirm-disconnect"
            >
              {disconnectMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
