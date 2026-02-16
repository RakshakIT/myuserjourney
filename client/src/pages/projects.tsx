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
  Check,
  Copy,
  Code2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useState, useCallback } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";

const STEPS = [
  { id: 1, label: "Project Details", icon: FolderKanban },
  { id: 2, label: "Tracking Code", icon: Code2 },
];

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
      })
    ),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
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
    onSuccess: (newProject: Project) => {
      setCreatedProject(newProject);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setStep(2);
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
        if (valid) {
          const data = form.getValues();
          createMutation.mutate(data);
        }
      });
    }
  }, [step, form, createMutation]);

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

        {step === 2 && createdProject && (
          <div className="space-y-4" data-testid="wizard-step-2-content">
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
        {step < 2 ? (
          <>
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-wizard-back"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={createMutation.isPending}
              data-testid="button-wizard-next"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Create Project
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              You can configure Google integrations in Project Settings
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
