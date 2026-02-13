import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import type { Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Globe,
  Calendar,
  Trash2,
  FolderKanban,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Copy,
  Search,
  BarChart3,
  Code2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useState, useCallback } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";

const STEPS = [
  { id: 1, label: "Project Details", icon: FolderKanban },
  { id: 2, label: "Search Console", icon: Search },
  { id: 3, label: "Google Analytics", icon: BarChart3 },
  { id: 4, label: "Tracking Code", icon: Code2 },
];

function WizardCopyableValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-1 mt-1">
      <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md flex-1 overflow-x-auto">{value}</code>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        data-testid={`button-copy-${label}`}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

function WizardSetupGuide({ redirectUri, service }: { redirectUri: string; service: "search-console" | "analytics" }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm w-full text-left hover-elevate rounded-md px-2 py-1.5"
        data-testid={`button-toggle-${service}-guide`}
      >
        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {expanded ? "Hide" : "Show"} setup guide
        </span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="space-y-3 pl-2 text-sm text-muted-foreground">
          {service === "search-console" ? (
            <>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">1</span>
                <span>
                  Open the{" "}
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5" data-testid="link-google-console">
                    Google Cloud Credentials page <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">2</span>
                <span>Click <strong>Create Credentials</strong>, then <strong>OAuth client ID</strong> (Web application)</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">3</span>
                <div>
                  <span>Add this as the redirect URI:</span>
                  <WizardCopyableValue value={redirectUri} label="wizard-redirect-uri" />
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">4</span>
                <span>
                  Enable the{" "}
                  <a href="https://console.cloud.google.com/apis/library/searchconsole.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
                    Search Console API <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">5</span>
                <span>Copy the Client ID and Client Secret into the fields below</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">1</span>
                <span>
                  Open{" "}
                  <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
                    Google Analytics <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">2</span>
                <span>Go to <strong>Admin</strong> &gt; <strong>Property Settings</strong> and copy the Property ID</span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">3</span>
                <span>Under <strong>Data Streams</strong>, copy the Measurement ID (starts with G-)</span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">4</span>
                <span>
                  If needed, enable the{" "}
                  <a href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
                    Analytics Data API <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">5</span>
                <span>Paste the IDs into the fields below (OAuth credentials carry over from step 2)</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 px-1" data-testid="wizard-step-indicator">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center gap-1 flex-1">
          <div
            className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium shrink-0 transition-colors ${
              currentStep === step.id
                ? "bg-primary text-primary-foreground"
                : currentStep > step.id
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
            data-testid={`wizard-step-${step.id}`}
          >
            {currentStep > step.id ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              step.id
            )}
          </div>
          <span className={`text-xs hidden sm:inline truncate ${
            currentStep === step.id ? "font-medium" : "text-muted-foreground"
          }`}>
            {step.label}
          </span>
          {index < STEPS.length - 1 && (
            <div className={`h-px flex-1 mx-1 ${
              currentStep > step.id ? "bg-primary/40" : "bg-border"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

interface WizardData {
  name: string;
  domain: string;
  description: string;
  googleClientId: string;
  googleClientSecret: string;
  gscSiteUrl: string;
  ga4PropertyId: string;
  ga4MeasurementId: string;
}

function ProjectWizard({
  onComplete,
  onClose,
}: {
  onComplete: (project: Project) => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState("");

  const form = useForm<WizardData>({
    resolver: zodResolver(
      insertProjectSchema.pick({ name: true, domain: true }).extend({
        description: insertProjectSchema.shape.description.optional(),
        googleClientId: insertProjectSchema.shape.googleClientId.optional(),
        googleClientSecret: insertProjectSchema.shape.googleClientSecret.optional(),
        gscSiteUrl: insertProjectSchema.shape.gscSiteUrl.optional(),
        ga4PropertyId: insertProjectSchema.shape.ga4PropertyId.optional(),
        ga4MeasurementId: insertProjectSchema.shape.ga4MeasurementId.optional(),
      })
    ),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
      googleClientId: "",
      googleClientSecret: "",
      gscSiteUrl: "",
      ga4PropertyId: "",
      ga4MeasurementId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: WizardData) => {
      const res = await apiRequest("POST", "/api/projects", {
        name: data.name,
        domain: data.domain,
        description: data.description || undefined,
        userId: "default",
        status: "active",
      });
      return res.json();
    },
    onSuccess: async (newProject: Project) => {
      setCreatedProject(newProject);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });

      const formData = form.getValues();
      const googleData: Record<string, string> = {};
      if (formData.googleClientId) googleData.googleClientId = formData.googleClientId;
      if (formData.googleClientSecret) googleData.googleClientSecret = formData.googleClientSecret;
      if (formData.gscSiteUrl) googleData.gscSiteUrl = formData.gscSiteUrl;
      if (formData.ga4PropertyId) googleData.ga4PropertyId = formData.ga4PropertyId;
      if (formData.ga4MeasurementId) googleData.ga4MeasurementId = formData.ga4MeasurementId;

      if (Object.keys(googleData).length > 0) {
        try {
          await apiRequest("PATCH", `/api/projects/${newProject.id}`, googleData);
          queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        } catch {}
      }

      setStep(4);
    },
    onError: (err: Error) => {
      toast({ title: "Error creating project", description: err.message, variant: "destructive" });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!createdProject) throw new Error("No project created");
      const res = await apiRequest("POST", `/api/projects/${createdProject.id}/verify-tracking`, {
        url: verifyUrl || undefined,
      });
      return res.json();
    },
  });

  const handleNext = useCallback(() => {
    if (step === 1) {
      form.trigger(["name", "domain"]).then((valid) => {
        if (valid) setStep(2);
      });
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const data = form.getValues();
      createMutation.mutate(data);
    }
  }, [step, form, createMutation]);

  const handleBack = useCallback(() => {
    if (step > 1 && step < 4) setStep(step - 1);
  }, [step]);

  const handleFinish = useCallback(() => {
    if (createdProject) {
      onComplete(createdProject);
    }
    onClose();
  }, [createdProject, onComplete, onClose]);

  const handleCopySnippet = useCallback(async () => {
    if (!createdProject) return;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const snippetCode = `<script>
(function(w,d,pID){
  var s = d.createElement('script');
  s.src='${baseUrl}/snippet.js';
  s.async=true;
  s.dataset.projectId=pID;
  d.head.appendChild(s);
})(window, document, '${createdProject.id}');
</script>`;
    await navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  }, [createdProject, toast]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-5">
      <StepIndicator currentStep={step} />

      <div className="min-h-[320px]">
        {step === 1 && (
          <div className="space-y-4" data-testid="wizard-step-1-content">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your website details to create a new analytics project.
              </p>
            </div>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Website" {...field} data-testid="input-project-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Input placeholder="example.com" {...field} data-testid="input-project-domain" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the project"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-project-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4" data-testid="wizard-step-2-content">
            <div className="flex items-center gap-2 mb-1">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Google Search Console</h3>
              <Badge variant="secondary">Optional</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect Google Search Console to import organic search data. You can skip this and set it up later in Project Settings.
            </p>

            <Card>
              <CardContent className="p-4">
                <WizardSetupGuide redirectUri={`${baseUrl}/api/google/callback`} service="search-console" />
              </CardContent>
            </Card>

            <Form {...form}>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="googleClientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="xxxxxxxxxxxx.apps.googleusercontent.com"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-google-client-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="googleClientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="GOCSPX-xxxxxxxxxxxx"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-google-client-secret"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gscSiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Console Site URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-gsc-site-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4" data-testid="wizard-step-3-content">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Google Analytics 4</h3>
              <Badge variant="secondary">Optional</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect your GA4 property to import traffic and engagement data. You can skip this and set it up later.
            </p>

            <Card>
              <CardContent className="p-4">
                <WizardSetupGuide redirectUri={`${baseUrl}/api/google/callback`} service="analytics" />
              </CardContent>
            </Card>

            <Form {...form}>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="ga4PropertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GA4 Property ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456789"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-ga4-property-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ga4MeasurementId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GA4 Measurement ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="G-XXXXXXXXXX"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-ga4-measurement-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        )}

        {step === 4 && createdProject && (
          <div className="space-y-4" data-testid="wizard-step-4-content">
            <div className="flex items-center gap-2 mb-1">
              <Code2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Install Tracking Code</h3>
            </div>

            <div className="rounded-md bg-green-500/5 border border-green-500/10 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Project "{createdProject.name}" created successfully!
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Add this code snippet to your website's <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> tag to start tracking.
            </p>

            <div className="relative">
              <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                <code data-testid="text-wizard-snippet">{`<script>
(function(w,d,pID){
  var s = d.createElement('script');
  s.src='${baseUrl}/snippet.js';
  s.async=true;
  s.dataset.projectId=pID;
  d.head.appendChild(s);
})(window, document, '${createdProject.id}');
</script>`}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1.5 right-1.5"
                onClick={handleCopySnippet}
                data-testid="button-copy-wizard-snippet"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium">Verify Installation</p>
              <p className="text-xs text-muted-foreground">
                Enter your website URL to check if the tracking code has been installed correctly.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={`https://${createdProject.domain}`}
                  value={verifyUrl}
                  onChange={(e) => setVerifyUrl(e.target.value)}
                  data-testid="input-verify-url"
                />
                <Button
                  onClick={() => verifyMutation.mutate()}
                  disabled={verifyMutation.isPending}
                  data-testid="button-verify-tracking"
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
                      : "bg-orange-500/5 border border-orange-500/10"
                  }`}
                  data-testid="verify-result"
                >
                  <div className="flex items-start gap-2">
                    {verifyMutation.data.verified ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        verifyMutation.data.verified
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}>
                        {verifyMutation.data.verified ? "Tracking Verified" : "Not Detected"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {verifyMutation.data.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {verifyMutation.error && (
                <div className="rounded-md bg-destructive/5 border border-destructive/10 p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-destructive text-xs">{(verifyMutation.error as Error).message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t">
        {step < 4 ? (
          <>
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : handleBack}
              data-testid="button-wizard-back"
            >
              {step === 1 ? "Cancel" : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </>
              )}
            </Button>
            <div className="flex items-center gap-2">
              {step === 2 && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      form.setValue("googleClientId", "");
                      form.setValue("googleClientSecret", "");
                      form.setValue("gscSiteUrl", "");
                      form.setValue("ga4PropertyId", "");
                      form.setValue("ga4MeasurementId", "");
                      const data = form.getValues();
                      createMutation.mutate(data);
                    }}
                    disabled={createMutation.isPending}
                    data-testid="button-wizard-skip-all"
                  >
                    Skip All & Create
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setStep(3)}
                    data-testid="button-wizard-skip"
                  >
                    Skip
                  </Button>
                </>
              )}
              {step === 3 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    form.setValue("ga4PropertyId", "");
                    form.setValue("ga4MeasurementId", "");
                    const data = form.getValues();
                    createMutation.mutate(data);
                  }}
                  disabled={createMutation.isPending}
                  data-testid="button-wizard-skip-create"
                >
                  Skip & Create
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={createMutation.isPending}
                data-testid="button-wizard-next"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                {step === 3 ? "Create Project" : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              You can update these settings anytime in Project Settings
            </p>
            <Button onClick={handleFinish} data-testid="button-wizard-finish">
              Go to Dashboard
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { currentProject, setCurrentProject } = useProject();
  const [, setLocation] = useLocation();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCurrentProject(null);
      toast({ title: "Project deleted" });
    },
  });

  const handleWizardComplete = (project: Project) => {
    setCurrentProject(project);
    setLocation("/");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-projects-title">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your analytics projects
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-project">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up your analytics project with optional Google integrations
              </DialogDescription>
            </DialogHeader>
            <ProjectWizard
              onComplete={handleWizardComplete}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FolderKanban className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Create your first project to start tracking user behavior and analytics.
          </p>
          <Button onClick={() => setOpen(true)} data-testid="button-create-first-project">
            <Plus className="h-4 w-4 mr-2" />
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`hover-elevate cursor-pointer transition-colors ${
                currentProject?.id === project.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                setCurrentProject(project);
                setLocation("/");
              }}
              data-testid={`card-project-${project.id}`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Globe className="h-3 w-3 shrink-0" />
                      <span className="text-xs truncate">{project.domain}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {project.trackingVerified && (
                      <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant={project.status === "active" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {project.googleClientId && (
                    <Badge variant="secondary" className="text-xs">
                      <SiGoogle className="h-2.5 w-2.5 mr-1" />
                      Google
                    </Badge>
                  )}
                  {project.ga4PropertyId && (
                    <Badge variant="secondary" className="text-xs">GA4</Badge>
                  )}
                  {project.gscSiteUrl && (
                    <Badge variant="secondary" className="text-xs">GSC</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
                      {format(new Date(project.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(project.id);
                    }}
                    data-testid={`button-delete-project-${project.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
